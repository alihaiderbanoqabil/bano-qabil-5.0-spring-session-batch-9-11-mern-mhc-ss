const Order = require("../models/order.model");
const AppError = require("../utils/AppError");
const { getStripe, isStripeConfigured } = require("../config/stripe");
const { notifyPaymentUpdate, notifyOrderStatus } = require("../socket");

const CURRENCY = "pkr";

const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * POST /api/payments/checkout-session   { orderId }
 *
 * Stripe ka hosted Checkout page banata hai aur uska URL wapis deta hai.
 * Card details kabhi hamare server ya frontend se guzarti hi nahi — user
 * Stripe ke page par jata hai. Isi wajah se PCI ka jhanjhat nahi hota.
 *
 * Line items order document se banti hain (jo khud server-side prices se bani
 * thi), is liye client amount ke sath kuch chhaer-chhaar nahi kar sakta.
 */
const createCheckoutSession = async (req, res) => {
    if (!isStripeConfigured()) {
        // 503: server ki configuration ki kami hai, client ki galti nahi
        throw new AppError("Card payments are not configured on this server", 503);
    }

    const { orderId } = req.body;
    if (!orderId) {
        throw new AppError("orderId is required", 400);
    }

    const order = await Order.findById(orderId).populate("items.product", "name images");
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
        throw new AppError("Forbidden", 403);
    }

    if (order.paymentStatus === "paid") {
        throw new AppError("This order is already paid", 400);
    }
    if (order.status === "cancelled") {
        throw new AppError("This order was cancelled", 400);
    }

    let session;
    try {
        session = await getStripe().checkout.sessions.create({
            mode: "payment",
            // Stripe amounts ko sab se chhoti unit mein leta hai (paisa/cents)
            line_items: order.items.map((item) => ({
                quantity: item.quantity,
                price_data: {
                    currency: CURRENCY,
                    unit_amount: Math.round(item.price * 100),
                    product_data: {
                        name: item.product?.name || "Product",
                        ...(item.product?.images?.[0]?.startsWith("http")
                            ? { images: [item.product.images[0]] }
                            : {}),
                    },
                },
            })),
            // Webhook ko order dhoondhne ke liye — client se aane wale data par
            // bharosa nahi karte
            metadata: { orderId: order._id.toString() },
            client_reference_id: order._id.toString(),
            success_url: `${frontendUrl()}/orders/${order._id}?payment=success`,
            cancel_url: `${frontendUrl()}/orders/${order._id}?payment=cancelled`,
        });
    } catch (error) {
        // Stripe ke apne messages (jaise "Invalid API Key provided: sk_test_...")
        // customer ke kaam ki nahi aur configuration ki tafseel leak karti hain.
        // Asli wajah log mein, client ko sirf itna ke dobara koshish kare.
        console.error("Stripe checkout session failed:", error.message);
        throw new AppError("Could not start the payment. Please try again in a moment.", 502);
    }

    return res.json({ message: "Checkout session created", url: session.url, sessionId: session.id });
};

/**
 * POST /api/payments/webhook
 *
 * Stripe khud ye call karta hai. Yehi wo jagah hai jahan payment ko "paid"
 * mark karte hain — success_url par bharosa nahi kiya ja sakta, kyunke user
 * wo URL khud bhi khol sakta hai (ya payment ke baad tab band kar sakta hai).
 *
 * Signature verify karne ke liye RAW body chahiye, is liye ye route
 * express.json() se PEHLE mount hota hai (server.js dekho).
 */
const handleWebhook = async (req, res) => {
    if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
        throw new AppError("Stripe webhook is not configured on this server", 503);
    }

    let event;
    try {
        event = getStripe().webhooks.constructEvent(
            req.body, // Buffer — express.raw() se
            req.headers["stripe-signature"],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        // Galat signature = ya to koi naqli request hai ya secret mismatch
        throw new AppError(`Webhook signature verification failed: ${error.message}`, 400);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata?.orderId || session.client_reference_id;
        const order = orderId ? await Order.findById(orderId) : null;

        // Order na mile to bhi 200 dete hain — warna Stripe hamesha retry
        // karta rehta hai kisi aisi cheez ke liye jo wapis nahi aani
        if (order && order.paymentStatus !== "paid") {
            const previousStatus = order.status;

            order.paymentStatus = "paid";
            // Paisay aa gaye to order ab processing mein ja sakta hai
            if (order.status === "pending") order.status = "processing";
            await order.save();

            notifyPaymentUpdate({ order });
            if (order.status !== previousStatus) {
                notifyOrderStatus({ order, previousStatus });
            }
        }
    }

    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
        const session = event.data.object;
        const orderId = session.metadata?.orderId || session.client_reference_id;
        const order = orderId ? await Order.findById(orderId) : null;

        if (order && order.paymentStatus === "pending") {
            order.paymentStatus = "failed";
            await order.save();
            notifyPaymentUpdate({ order });
        }
    }

    // Stripe ko 200 chahiye, warna wo event dobara bhejta rehta hai
    return res.json({ received: true });
};

// GET /api/payments/config — frontend ko batata hai ke card option dikhani hai ya nahi
const getPaymentConfig = async (req, res) => {
    return res.json({
        cardPaymentsEnabled: isStripeConfigured(),
        currency: CURRENCY,
    });
};

module.exports = { createCheckoutSession, handleWebhook, getPaymentConfig };
