# Stripe setup (test mode)

Card payments optional hain — keys na hon to poora app chalta rehta hai, bas
checkout par Card option disabled dikhta hai.

## 1. Test keys lein

https://dashboard.stripe.com/test/apikeys se **Secret key** copy karen
(`sk_test_...`) aur `backend/.env` mein daalen:

```
STRIPE_SECRET_KEY=sk_test_...
```

Publishable key ki zarorat nahi — hum Stripe ka **hosted Checkout** use karte
hain, apna card form nahi, is liye frontend par koi Stripe key nahi jati.

## 2. Webhook chalayen

Order ko "paid" mark karne wala faisla webhook karta hai, is liye local par
Stripe CLI zaroori hai:

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
```

CLI ek `whsec_...` print karta hai — usay `.env` mein daal kar backend restart
karen:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. Test karen

Storefront par card se order dein. Stripe ke page par test card:

| Field | Value |
| --- | --- |
| Card | `4242 4242 4242 4242` |
| Expiry | koi future date |
| CVC | koi 3 digits |
| ZIP | koi 5 digits |

Payment ke baad:

- order `paymentStatus: paid` aur `status: processing` ho jati hai
- customer ko realtime notification (socket) jati hai
- admin dashboard ke numbers khud update ho jate hain

Ya webhook ko direct trigger karen:

```bash
stripe trigger checkout.session.completed
```

## Kyun success_url par bharosa nahi?

`?payment=success` wala URL customer khud bhi type kar sakta hai, aur payment
ke baad tab band kar dene se wo kabhi khulta bhi nahi. Is liye paisay milne ka
record sirf signed webhook se banta hai — success URL sirf UI ka banner dikhata
hai.

## Kyun webhook route express.json() se pehle hai?

Stripe un exact bytes par signature banata hai jo usne bheje. `express.json()`
unhe object bana deta aur `xss()` sanitize kar deta — dono se signature toot
jata. Is liye `server.js` mein sirf ye ek route pehle, `express.raw()` ke sath
mount hota hai (aur rate limiter se bahar, warna Stripe ke retries 429 khatey).
