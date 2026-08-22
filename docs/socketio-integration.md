# Socket.IO Integration Guide

Real-time notifications in this project: how they work, why they are built this
way, and how to extend them.

---

## 1. What it does

| Event | Who receives it | Trigger |
| --- | --- | --- |
| `product:new` | **everyone** — logged in or not | Admin creates an active product |
| `order:status` | **only that order's customer** | Admin changes the order status |
| `order:payment` | that customer **and** all admins | Stripe webhook confirms/fails a payment |
| `order:new` | **only admins** | A customer places an order |

Two things happen for every notification:

1. A **record is saved** in MongoDB (`Notification` model) — so it survives a
   page refresh and is still there if the customer was offline when it happened.
2. A **live event is emitted** over Socket.IO — so anyone connected right now
   sees it immediately, without polling.

Socket delivery is best-effort; the database record is the source of truth.
Yehi wajah hai ke emit se pehle save karte hain.

---

## 2. File map

**Backend**

| File | Responsibility |
| --- | --- |
| `backend/src/socket/index.js` | Transport only — server setup, handshake auth, rooms, `emitTo*` helpers |
| `backend/src/services/notification.service.js` | Domain layer — decides *what* notification goes to *whom*, writes the DB record, then emits |
| `backend/src/models/notification.model.js` | Schema + per-user read tracking |
| `backend/src/controllers/notification.controller.js` | `GET /api/notifications`, mark-as-read, mark-all-as-read |
| `backend/src/server.js` | Creates the HTTP server and calls `initSocket()` |

Controllers never touch `socket/index.js` directly — they call the service:

```js
// backend/src/controllers/product.controller.js
const { notifyNewProduct } = require("../services/notification.service");
...
if (product.isActive) await notifyNewProduct(product);
```

**Frontend**

| File | Responsibility |
| --- | --- |
| `customer/src/socket.js` / `admin/src/socket.js` | One shared socket instance per app |
| `customer/src/components/RealtimeListener.jsx` | Listens, shows toasts, pushes into the RTK Query cache |
| `customer/src/components/NotificationBell.jsx` | Bell + dropdown + mark-as-read UI |
| `customer/src/store/api/notificationApi.js` | RTK Query endpoints with optimistic updates |
| `admin/src/components/RealtimeListener.jsx` | antd notifications + invalidates `Stats` / `Order` tags |

---

## 3. How the server is wired

Socket.IO needs the raw HTTP server, not the Express app. So `app.listen()` is
replaced:

```js
// backend/src/server.js
const httpServer = http.createServer(app);
initSocket(httpServer);
httpServer.listen(PORT, ...);
```

**Ek hi port, ek hi origin, ek hi cookie.** No separate socket server, no
second port to configure in the firewall, and — most importantly — the browser
sends the same auth cookie on the socket handshake that it sends on API calls.

### Handshake authentication

```js
// backend/src/socket/index.js
const readTokenCookie = (header = "") =>
  header.split(";").map((p) => p.trim())
    .filter((p) => p.startsWith("token="))
    .map((p) => decodeURIComponent(p.slice("token=".length)))[0] || null;

const getUserFromHandshake = (socket) => {
  const token = readTokenCookie(socket.handshake.headers.cookie);
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }   // expired/kharab token = guest, connection todte nahi
};
```

Two deliberate choices here:

- **No separate socket token.** The httpOnly cookie already proves who you are,
  and JS cannot read it — so there is nothing to steal from `localStorage`.
- **Guests are allowed to connect.** They just do not join any private room.
  New-product announcements are public, so a logged-out visitor still gets them.

> **Gotcha we hit:** the `cookie` npm package renamed `parse` → `parseCookie` in
> v2, and our `try/catch` swallowed the resulting `TypeError` — every user
> silently connected as a guest. That is why the parser above is 4 lines of our
> own code with no dependency: fewer moving parts, and it cannot drift.

### Rooms

```js
socket.join("everyone");                                  // sab
if (user) {
  socket.join(`user:${user.id}`);                         // sirf ye customer
  if (user.role === "admin") socket.join("admins");       // sirf admins
}
```

Rooms are decided **at handshake time from the cookie**, never from anything the
client sends. A client cannot ask to join `user:<someone-else>` — there is no
such message handler. Isi wajah se ek customer doosre ki order updates nahi
sun sakta.

---

## 4. Client setup

```js
// customer/src/socket.js
import { io } from "socket.io-client";

export const socket = io({
  withCredentials: true,   // cookie bhejne ke liye — iske bagair guest ban jata hai
  autoConnect: false,      // connect React ke andar hota hai
});
```

**No URL is passed.** The client connects to the origin the page came from, and
Vite proxies it to the backend:

```js
// customer/vite.config.js
proxy: {
  '/api': { target: 'http://localhost:5000', changeOrigin: true },
  '/socket.io': { target: 'http://localhost:5000', ws: true },   // ws: true zaroori hai
}
```

> **Gotcha:** without `ws: true` the WebSocket upgrade never reaches the
> backend and the client silently stays on HTTP long-polling forever. It still
> "works", just slower and noisier.

### Reconnecting on login/logout

```jsx
useEffect(() => {
  if (socket.connected) socket.disconnect();
  socket.connect();
  ...
}, [dispatch, isLoggedIn, user?._id]);
```

Room membership is fixed at handshake, so after a login or logout the old
connection is in the wrong rooms. Reconnect karna zaroori hai.

### Turning an event into UI

```jsx
socket.on("order:status", (payload) => {
  prependToList(payload);                       // bell ki list mein daalo
  toast.custom(...);                            // live toast
  dispatch(baseApi.util.invalidateTags([        // screen par khula data refresh
    { type: "Order", id: payload.orderId },
    { type: "Order", id: "LIST" },
  ]));
});
```

That third line is what makes the admin dashboard numbers move on their own
when an order arrives — no polling, no refresh button.

---

## 5. Persistence and read state

A broadcast to 10,000 customers must not write 10,000 documents. So:

```js
// backend/src/models/notification.model.js
{
  user: ObjectId | null,   // null = broadcast (sab ke liye)
  type, title, body, link,
  readBy: [ObjectId],      // kis kis ne parh li
}
```

- **Targeted** (`order:status`) → `user: <id>`, `readBy` holds at most that one id.
- **Broadcast** (`product:new`) → `user: null`, `readBy` grows as people read it.

One document either way. Read state is per user, so marking a broadcast read
does not affect anybody else.

```js
notificationSchema.statics.filterFor = (userId) => ({
  $or: [{ user: userId }, { user: null }],
});
```

### API

| Route | Does |
| --- | --- |
| `GET /api/notifications` | Your notifications + broadcasts, newest first, with an `unread` count |
| `PATCH /api/notifications/:id/read` | `$addToSet` your id into `readBy` — idempotent |
| `PATCH /api/notifications/read-all` | Same, for everything you have not read yet |

`$addToSet` means clicking twice is harmless, and `read-all` filters on
`readBy: { $ne: userId }` so it only writes documents that actually change.

### Optimistic updates on the client

```js
// customer/src/store/api/notificationApi.js
async onQueryStarted(id, { dispatch, queryFulfilled }) {
  const patch = dispatch(notificationApi.util.updateQueryData("getNotifications", undefined, (draft) => {
    const item = draft.data.find((n) => n._id === id);
    if (item && !item.read) { item.read = true; draft.unread -= 1; }
  }));
  try { await queryFulfilled; } catch { patch.undo(); }
}
```

The badge drops instantly; if the request fails, `patch.undo()` puts it back.

---

## 6. Testing it

**Without a browser** — three clients with different cookies:

```js
const { io } = require("socket.io-client");
const socket = io("http://localhost:5000", {
  extraHeaders: { Cookie: "token=<jwt>" },   // browser khud bhejta hai, Node mein manually
});
socket.on("product:new", console.log);
```

> **Gotcha:** with `transports: ["websocket"]` the `extraHeaders` option is
> ignored. Leave the default transports so the handshake goes over polling first.

Then trigger events with `curl` and watch which client receives what. The three
things worth asserting:

1. `product:new` reaches guest + customer + admin.
2. `order:status` reaches **only** the owning customer.
3. Changing something other than the status (e.g. the shipping address) emits
   **nothing** — otherwise every edit pings the customer.

**In the browser:** open the storefront, create a product from the admin portal
(or `curl`), and watch the toast and the bell badge. Then refresh the page — the
notification must still be there. That refresh is the whole point of the
database record.

---

## 7. Extending it

To add a new notification type:

1. Add the type to the `enum` in `notification.model.js`.
2. Write a `notifyX()` in `notification.service.js` — save the record, then emit.
3. Call it from the controller where the thing actually happens.
4. Handle the event in the frontend listener(s) and add an icon in the bell.

Keep the decision of *who gets what* in the service. `socket/index.js` should
stay dumb — it only knows how to send.

---

## 8. Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Everyone connects as `guest` | Cookie not reaching the handshake — check `withCredentials: true`, and that the client is on the same origin (or CORS lists the exact origin) |
| Events never arrive, no errors | `/socket.io` not proxied, or proxied without `ws: true` |
| Customer sees another customer's order updates | Somebody emitted to `everyone` instead of `user:<id>` |
| Notification shows twice | The socket payload was inserted into the cache *and* a refetch ran — the listener de-dupes by `_id`, keep that check |
| Works in dev, not in production | CORS origin list in `socket/index.js` still points at localhost |
