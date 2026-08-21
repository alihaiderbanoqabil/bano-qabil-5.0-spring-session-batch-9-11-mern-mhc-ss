const express = require("express");
const { createCheckoutSession, getPaymentConfig } = require("../controllers/payment.controller");
const { authenticate } = require("../middlewares");

const router = express.Router();

// Webhook is router mein NAHI hai — usay raw body chahiye, is liye wo
// server.js mein express.json() se pehle mount hota hai.
router.get("/config", getPaymentConfig);
router.post("/checkout-session", authenticate, createCheckoutSession);

module.exports = router;
