const Notification = require("../models/notification.model");
const { emitToEveryone, emitToUser, emitToAdmins } = require("../socket");

/**
 * Notification service — "kya hua" ko "kis ko batana hai" mein badalta hai.
 *
 * Har notification do jagah jati hai:
 *   1. DB mein (record) — taake refresh ke baad bhi mile, aur wo bhi mil jaye
 *      jo user ke offline hone ke doran aayi thi
 *   2. Socket par (live) — jo abhi juday hue hain unhe foran dikh jaye
 *
 * Socket wala hissa best-effort hai; asal record DB mein banta hai. Is liye
 * emit se pehle save karte hain.
 */

const shortOrderId = (orderId) => `#${String(orderId).slice(-8).toUpperCase()}`;

// Notification ka `body` ek tayyar string hoti hai (frontend usay wese hi
// dikhata hai), is liye raqam yahin format kar dete hain — wahi shakal jo
// baqi app mein hai.
const formatAmount = (value) =>
    new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const STATUS_TEXT = {
    processing: "is being prepared",
    shipped: "has shipped",
    delivered: "was delivered",
    cancelled: "was cancelled",
    pending: "is pending",
};

/**
 * Naya product — sab ke liye (broadcast, user: null).
 */
const notifyNewProduct = async (product) => {
    const notification = await Notification.create({
        user: null, // broadcast
        type: "product:new",
        title: "New product added",
        body: product.name,
        link: `/products/${product._id}`,
    });

    emitToEveryone("product:new", {
        _id: notification._id,
        type: "product:new",
        title: notification.title,
        body: notification.body,
        link: notification.link,
        read: false,
        createdAt: notification.createdAt,
        // Frontend ke toast ke liye thora extra — record mein ye nahi jata
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || null,
    });

    return notification;
};

/**
 * Order ka status badla — sirf us order ke malik ke liye.
 */
const notifyOrderStatus = async ({ order, previousStatus }) => {
    const notification = await Notification.create({
        user: order.user,
        type: "order:status",
        title: `Order ${shortOrderId(order._id)} ${STATUS_TEXT[order.status] || `is now ${order.status}`}`,
        body: `Order total ${formatAmount(order.totalAmount)}`,
        link: `/orders/${order._id}`,
    });

    emitToUser(order.user, "order:status", {
        _id: notification._id,
        type: "order:status",
        title: notification.title,
        body: notification.body,
        link: notification.link,
        read: false,
        createdAt: notification.createdAt,
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        previousStatus,
        totalAmount: order.totalAmount,
    });

    return notification;
};

/**
 * Payment ka natija — customer ko record + live, admins ko sirf live
 * (admin ke liye notifications persist nahi karte; unka dashboard khud
 * refresh ho jata hai).
 */
const notifyPaymentUpdate = async ({ order }) => {
    const paid = order.paymentStatus === "paid";

    const notification = await Notification.create({
        user: order.user,
        type: "order:payment",
        title: paid
            ? `Payment received for ${shortOrderId(order._id)}`
            : `Payment ${order.paymentStatus} for ${shortOrderId(order._id)}`,
        body: `Order total ${formatAmount(order.totalAmount)}`,
        link: `/orders/${order._id}`,
    });

    const payload = {
        _id: notification._id,
        type: "order:payment",
        title: notification.title,
        body: notification.body,
        link: notification.link,
        read: false,
        createdAt: notification.createdAt,
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
        totalAmount: order.totalAmount,
    };

    emitToUser(order.user, "order:payment", payload);
    emitToAdmins("order:payment", payload);

    return notification;
};

/**
 * Nayi order — sirf admins ke liye, aur sirf live (koi DB record nahi:
 * admin portal ka dashboard aur orders table khud hi socket par refresh ho
 * jate hain, un ke liye alag inbox ki zarorat nahi).
 */
const notifyNewOrder = (order) => {
    emitToAdmins("order:new", {
        type: "order:new",
        orderId: order._id,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
        createdAt: new Date().toISOString(),
    });
};

module.exports = {
    notifyNewProduct,
    notifyOrderStatus,
    notifyPaymentUpdate,
    notifyNewOrder,
};
