# Bano Qabil 5.0 — MERN E-Commerce

Batch 9/11 class project: an Express + MongoDB API with two React frontends —
a customer storefront and an admin portal.

```
backend/    Express 5 + Mongoose API, Socket.IO, Stripe
customer/   Storefront  — React 19, Tailwind, RTK Query   (top navigation)
admin/      Admin panel — React 19, Ant Design, RTK Query (left sidebar)
docs/       Implementation guides
```

`react-app/`, `vite-project/` and `server/` are older class exercises kept for
reference; nothing in the three folders above depends on them.

---

## Running it

Three terminals:

```bash
cd backend && npm install && npm run dev      # http://localhost:5000
```

```bash
cd customer && npm install && npm run dev     # http://localhost:5173
```

```bash
cd admin && npm install && npm run dev        # http://localhost:5174
```

Copy `backend/.env.example` to `backend/.env` and fill in at least `MONGO_URI`
and `JWT_SECRET`. Then seed some data:

```bash
cd backend && npm run seed
```

The seed prints an admin login and a customer login. **It wipes the database
first** — point `MONGO_URI` somewhere disposable before running it.

> **Local gotcha:** browser cookies are shared across ports on the same host, so
> `localhost:5173` and `localhost:5174` share one auth cookie — logging into one
> logs you out of the other. Open one of them on `http://127.0.0.1:<port>`
> instead to get a separate session.

---

## What is implemented

**Backend** — JWT auth in an httpOnly cookie, email verification, forgot/reset
password, role-based authorization, products, categories (tree + flat), orders
with server-side pricing and stock, comments/reviews with per-product rating
aggregates, notifications, dashboard stats, image upload (disk + Cloudinary),
and one shared query engine for every list route (search, filter, sort,
paginate, field-limit, `?pagination=false`).

**Customer portal** — browse with filters, product detail with reviews, cart,
checkout, order tracking and cancellation, profile, the full auth flow, live
notifications with a bell, and Stripe card payments.

**Admin portal** — dashboard with revenue/stat cards and charts, product and
category CRUD with image upload, order management with search by customer,
user management, comment moderation, and live notifications for new orders and
payments.

---

## Documentation

| Doc | What it covers |
| --- | --- |
| [`docs/stripe-integration.md`](docs/stripe-integration.md) | Payment flow, why the webhook is the source of truth, setup, test cards, troubleshooting |
| [`docs/socketio-integration.md`](docs/socketio-integration.md) | Rooms, handshake auth, notification persistence, testing, troubleshooting |
| [`backend/docs/postman/`](backend/docs/postman/) | Importable Postman collection documenting every endpoint |
| [`customer/README.md`](customer/README.md) | Storefront structure and conventions |
| [`admin/README.md`](admin/README.md) | Admin portal structure and conventions |

---

## Security notes

- `backend/.env` and `server/.env` are **committed in git history**. Rotate the
  Gmail app password, `JWT_SECRET` and the Cloudinary secret, then untrack them:
  `git rm --cached backend/.env server/.env` (they are already in `.gitignore`).
- Card details never reach this server — Stripe's iframe collects them and the
  webhook confirms the payment.
- Auth tokens live in an httpOnly cookie, so page JavaScript cannot read them.
