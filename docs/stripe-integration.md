# Stripe Integration Guide

Card payments in this project: the flow, the security reasoning, setup steps,
and how to test it without spending real money.

---

## 1. The short version

```
Customer picks "Card"
      │
      ▼
POST /api/orders                     order banti hai — paymentStatus: "pending"
      │
      ▼
POST /api/payments/payment-intent    server Stripe se clientSecret leta hai
      │                              (amount stored order se, client se nahi)
      ▼
<PaymentElement /> on the order page card ki details seedha Stripe ko jati hain
      │
      ▼
Stripe → POST /api/payments/webhook  signed event: payment_intent.succeeded
      │
      ▼
order.paymentStatus = "paid"         + socket notification customer aur admin ko
```

Two rules everything else follows from:

1. **The amount is never taken from the client.** It is recomputed from the
   stored order, whose prices came from the product catalogue.
2. **Only the webhook marks an order paid.** Not the browser, not the success
   URL — a customer can open that URL by hand, and can also close the tab
   before it ever loads.

---

## 2. Which Stripe integration, and why

Stripe offers several. This project implements two of them:

| Approach | Route | Where the customer types the card |
| --- | --- | --- |
| **Payment Intents + Elements** (primary) | `POST /api/payments/payment-intent` | On our own order page, inside a Stripe-hosted iframe |
| **Checkout Session** (fallback) | `POST /api/payments/checkout-session` | On Stripe's own hosted page |

The UI uses **Elements**: the customer never leaves the site, but the card
fields live in an iframe served by Stripe, so the card number never touches our
JavaScript, our server, or our logs. PCI scope stays with Stripe either way.

The Checkout Session route is kept because it is genuinely simpler (no client
library, no `clientSecret` juggling) and useful as a fallback. Both paths end at
the same webhook.

**No publishable key in the frontend `.env`.** It comes from
`GET /api/payments/config` instead:

```json
{ "cardPaymentsEnabled": true, "publishableKey": "pk_test_...", "currency": "pkr" }
```

Ek hi jagah (backend ka `.env`) se dono keys aati hain, aur key badalne par
frontend ko dobara build karne ki zarorat nahi parti. The publishable key is
public by design — it is not a secret.

---

## 3. Feature flag: no keys, no problem

If `STRIPE_SECRET_KEY` is unset, the whole feature switches itself off:

```js
// backend/src/config/stripe.js
const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
```

- `GET /api/payments/config` → `cardPaymentsEnabled: false`
- `POST /api/payments/payment-intent` and `/checkout-session` → `503`
- The storefront disables its **Card** option with the reason shown inline

COD orders, browsing, everything else keeps working. Class ke doran har student
ko Stripe account banane ki zarorat nahi parti.

---

## 4. Backend

### File map

| File | Responsibility |
| --- | --- |
| `backend/src/config/stripe.js` | Lazily builds the Stripe client; `isStripeConfigured()` |
| `backend/src/controllers/payment.controller.js` | Payment intent, checkout session, webhook, config |
| `backend/src/routes/payment.routes.js` | `/config`, `/payment-intent`, `/checkout-session` |
| `backend/src/server.js` | Mounts the **webhook** separately — see below |
| `backend/src/models/order.model.js` | `paymentIntentId` (select: false) |

### Creating the payment intent

```js
const order = await Order.findById(orderId).select("+paymentIntentId");
// ownership + state checks: not someone else's, not already paid, not cancelled
const amount = Math.round(order.totalAmount * 100);   // Stripe paisa/cents leta hai
```

**Re-use before create.** If the order already has a usable intent, we update it
instead of making a new one:

```js
if (order.paymentIntentId) {
  const existing = await getStripe().paymentIntents.retrieve(order.paymentIntentId);
  if (["requires_payment_method", "requires_confirmation", "requires_action"].includes(existing.status)) {
    // amount badla ho to update, warna wohi wapis
  }
}
```

Otherwise every page refresh would leave another abandoned intent in the Stripe
dashboard.

**If that existing intent is already `succeeded` or `processing`, we refuse to
create a new one** and answer `409`. There is a real window between a successful
payment and the webhook arriving, during which the order still reads `pending` —
handing out a fresh intent in that window could charge the customer twice.

`paymentIntentId` is `select: false` — the client has no use for it, so it does
not go out in normal order responses. That is also why the query above needs an
explicit `+paymentIntentId`.

### The webhook — and why it is mounted first

```js
// backend/src/server.js — BEFORE express.json(), xss(), and the rate limiter
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);
```

Stripe signs the **exact bytes** it sent. `express.json()` would parse them into
an object and `xss()` would sanitize them — either one breaks the signature. It
is also outside the rate limiter, so a burst of Stripe retries cannot get itself
throttled into `429`s.

```js
event = getStripe().webhooks.constructEvent(
  req.body,                          // Buffer, not an object
  req.headers["stripe-signature"],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Events handled

| Event | Effect |
| --- | --- |
| `payment_intent.succeeded` | `paymentStatus → paid`; a `pending` order also moves to `processing`; emits `order:payment` + `order:status` |
| `checkout.session.completed` | Same, for the hosted-page route |
| `checkout.session.expired`, `payment_intent.payment_failed` | `paymentStatus → failed` (only if still `pending`) |

Two habits worth copying:

- **Idempotent.** `if (order.paymentStatus !== "paid")` — Stripe can and does
  deliver the same event twice.
- **Always answer `200`,** even for events we ignore or an order that no longer
  exists. A `4xx`/`5xx` makes Stripe retry for days.

### Error messages

```js
catch (error) {
  console.error("Stripe payment intent failed:", error.message);
  throw new AppError("Could not start the payment. Please try again in a moment.", 502);
}
```

Stripe's own errors are useful to us and useless (sometimes revealing) to the
customer — `Invalid API Key provided: sk_test_****...` should never reach a
browser. Asli wajah log mein, user ko generic message.

---

## 5. Frontend (customer portal)

| File | Responsibility |
| --- | --- |
| `customer/src/components/CardPaymentForm.jsx` | Loads Stripe.js, creates the intent, renders `<PaymentElement />` |
| `customer/src/store/api/paymentApi.js` | `getPaymentConfig`, `createPaymentIntent`, `createCheckoutSession` |
| `customer/src/pages/Checkout.jsx` | Creates the order, then sends the user to `/orders/:id?pay=1` |
| `customer/src/pages/OrderDetail.jsx` | Shows the card form, the result banners, and "Pay now with card" |

### Why the order is created *before* payment

If the customer abandons the card form, the order still exists in their history
as unpaid — and **Pay now with card** finishes it later. Building the order only
after payment would lose the cart and leave a paid customer with no order.

### Loading Stripe.js once

```js
const stripePromiseCache = new Map();
const getStripePromise = (key) => {
  if (!stripePromiseCache.has(key)) stripePromiseCache.set(key, loadStripe(key));
  return stripePromiseCache.get(key);
};
```

`loadStripe()` injects a script tag — calling it on every render is a real
performance bug.

### Confirming

```js
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: `${origin}/orders/${orderId}?payment=success` },
  redirect: "if_required",
});
```

`redirect: "if_required"` keeps simple cards on our page, while 3D Secure still
gets its full redirect to the bank and back.

Card errors are shown as-is (`Your card was declined`) because they are
actionable; anything else becomes a generic message.

### After success

The UI does **not** flip the order to paid. It navigates to
`?payment=success`, which shows *"Confirming your payment with Stripe..."* until
the webhook lands — and the socket `order:payment` event then updates the page
by itself. Jo cheez server ne confirm nahi ki, UI usay sach nahi dikhati.

---

## 6. Setup

### 1. Keys

From <https://dashboard.stripe.com/test/apikeys> into `backend/.env`:

```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 2. Webhook forwarding (production ka sahi raasta)

> **Jaldi mein hain?** Webhook ke bagair bhi payment ab poora ho jata hai:
> confirm hote hi frontend `POST /api/payments/sync/:orderId` call karta hai,
> jis par server **khud Stripe se pooch kar** order paid karta hai. Yani
> `stripe listen` chalaye bagair bhi local par flow chalta hai. Webhook phir
> bhi lagana chahiye — wo un cases ko sambhalta hai jahan customer payment ke
> baad tab band kar de, ya browser se sync ki request hi na jaye.


```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the printed `whsec_...` into `.env` and restart the backend:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Pay with a test card

| Field | Value |
| --- | --- |
| Card | `4242 4242 4242 4242` |
| Expiry | any future date |
| CVC | any 3 digits |

Other useful numbers: `4000 0025 0000 3155` (requires 3D Secure),
`4000 0000 0000 9995` (declined — insufficient funds).

### 4. What you should see

1. Order moves to `paid` + `processing`
2. The customer gets a realtime notification (bell + toast)
3. The admin dashboard's paid revenue updates on its own
4. `stripe listen` prints `payment_intent.succeeded [200]`

---

## 6b. The sync endpoint

`POST /api/payments/sync/:orderId` — owner ya admin.

Ye webhook ka **mutabadil nahi, sathi** hai. Payment confirm hone ke foran baad
frontend isay call karta hai; server order ka `paymentIntentId` le kar Stripe se
seedha intent retrieve karta hai aur **sirf tab** order paid karta hai jab:

- `intent.status === "succeeded"`, **aur**
- `intent.amount_received` order ke total ke barabar ho (paisa mein)

Client ke kehne par kuch nahi hota — sirf orderId aata hai, baqi sab server
Stripe se poochta hai. Webhook aur sync dono ek hi `markOrderPaid()` helper use
karte hain, is liye dono raaste kabhi alag nahi hotay, aur dono idempotent hain:
jo order pehle se paid ho, us par dobara notification nahi jati.

Kyun chahiye tha: local par webhook ke liye `stripe listen` zaroori hai, aur
production mein bhi webhook kabhi der se aata hai — customer tab tak "pending"
dekhta rehta hai.

## 7. Testing without a Stripe account

The signature check can be exercised offline, because the SDK can generate a
valid test signature:

```js
const payload = JSON.stringify({ type: "payment_intent.succeeded", data: { object: { metadata: { orderId } } } });
const header = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_test_local_secret" });
```

Run the backend with `STRIPE_SECRET_KEY=sk_test_dummy` and
`STRIPE_WEBHOOK_SECRET=whsec_test_local_secret`, then POST that payload and
header. You can assert the whole chain — signature accepted, order marked paid,
socket events emitted — without ever reaching Stripe's servers. Wrong signature
must give `400`.

Creating an intent, though, is a real API call: that one needs real test keys.

---

## 8. Going to production

- Swap `pk_test_` / `sk_test_` for live keys, and create a **live** webhook
  endpoint in the Stripe dashboard (its secret is different from the CLI one).
- The webhook URL must be publicly reachable — the CLI is a local dev tool.
- `FRONTEND_URL` must be the real site, since return URLs are built from it.
- Currency is `pkr` in `payment.controller.js`; Stripe's minimum charge and
  supported methods vary by currency and account country.
- Consider persisting Stripe's event ids to reject replays across restarts; the
  current `paymentStatus !== "paid"` check is enough for this project but is
  state-based, not event-based.

---

## 9. Troubleshooting

| Symptom | Cause |
| --- | --- |
| `Webhook signature verification failed` | The route is not getting the raw body (something parsed it first), or the secret does not match the listener that sent the event |
| Order stays `pending` after a successful payment | No webhook reached the server — is `stripe listen` running? |
| `503 Card payments are not configured` | `STRIPE_SECRET_KEY` missing — check the backend's `.env` and restart |
| `409 payment is already going through` | The order's existing intent is `succeeded`/`processing` and the webhook has not landed yet — refusing a second intent is deliberate |
| `502 Could not start the payment` | Stripe rejected the call; the real reason is in the server log |
| Card form never appears | `publishableKey` is `null` in `/api/payments/config` |
| Amount is wrong | Stripe works in the smallest currency unit — `Math.round(total * 100)` |
