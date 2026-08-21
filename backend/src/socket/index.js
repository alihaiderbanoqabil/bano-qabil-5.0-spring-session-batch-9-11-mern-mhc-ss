const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

/**
 * Socket.IO layer
 * -----------------------------------------------------------------------
 * Rooms ka nizam:
 *
 *   "everyone"      -> har connected client (guest bhi). Naya product add hone
 *                      ka announcement isi par jata hai.
 *   "user:<id>"     -> ek khaas customer. Uski order ka status badle to yahan.
 *   "admins"        -> saare logged-in admins. Nayi order aane par yahan.
 *
 * Auth: browser wahi httpOnly cookie handshake ke sath bhejta hai (client par
 * `withCredentials: true` hona zaroori hai), is liye HTTP routes aur socket
 * dono ek hi session use karte hain — koi alag socket token nahi.
 */

let io = null;

const ROOMS = {
  everyone: "everyone",
  admins: "admins",
  user: (userId) => `user:${userId}`,
};

// "a=1; token=xyz; b=2" -> "xyz". Ek chhota parser hi kaafi hai; cookie
// library ka API version ke sath badal jata hai aur hamein sirf ek naam chahiye.
const readTokenCookie = (header = "") =>
  header
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("token="))
    .map((part) => decodeURIComponent(part.slice("token=".length)))[0] || null;

// Handshake se user nikalta hai. Token na ho ya kharab ho to null — guest
// connection allowed hai, kyunke product announcements sab ke liye hain.
const getUserFromHandshake = (socket) => {
  const token = readTokenCookie(socket.handshake.headers.cookie);
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Expire/kharab token = guest, connection todte nahi
    return null;
  }
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    // Express ke CORS ki tarah — cookie bhejne ke liye exact origin chahiye
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const user = getUserFromHandshake(socket);
    socket.data.user = user;

    socket.join(ROOMS.everyone);

    if (user) {
      socket.join(ROOMS.user(user.id));
      if (user.role === "admin") socket.join(ROOMS.admins);
    }

    // Client ko bata dete hain ke wo kis haisiyat se juda hai — frontend isi se
    // decide karta hai ke bell dikhani hai ya nahi
    socket.emit("connected", {
      authenticated: Boolean(user),
      role: user?.role || "guest",
    });

    socket.on("disconnect", () => {
      // Socket.IO rooms khud saaf kar deta hai; yahan sirf debugging ke liye
      if (process.env.NODE_ENV !== "production") {
        console.log("socket disconnected:", socket.id);
      }
    });
  });

  console.log("Socket.IO ready");
  return io;
};

/**
 * Emit karne wale helpers.
 *
 * Har helper `io` ke null hone par chup chaap wapis aa jata hai — is liye
 * seed script ya tests jahan HTTP server nahi chal raha, wahan controllers
 * crash nahi karte.
 */
const emitToEveryone = (event, payload) => {
  if (!io) return;
  io.to(ROOMS.everyone).emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(ROOMS.user(String(userId))).emit(event, payload);
};

const emitToAdmins = (event, payload) => {
  if (!io) return;
  io.to(ROOMS.admins).emit(event, payload);
};

// ── Domain events ────────────────────────────────────────────────────────
// Controllers inhe call karte hain, raw event names nahi — is se event ka
// naam aur payload ki shape ek jagah rehti hai.

const notifyNewProduct = (product) => {
  emitToEveryone("product:new", {
    type: "product:new",
    productId: product._id,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || null,
    createdAt: new Date().toISOString(),
  });
};

const notifyOrderStatus = ({ order, previousStatus }) => {
  emitToUser(order.user, "order:status", {
    type: "order:status",
    orderId: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    previousStatus,
    totalAmount: order.totalAmount,
    createdAt: new Date().toISOString(),
  });
};

const notifyNewOrder = (order) => {
  emitToAdmins("order:new", {
    type: "order:new",
    orderId: order._id,
    totalAmount: order.totalAmount,
    itemCount: order.items?.length || 0,
    createdAt: new Date().toISOString(),
  });
};

const notifyPaymentUpdate = ({ order }) => {
  const payload = {
    type: "order:payment",
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: new Date().toISOString(),
  };

  emitToUser(order.user, "order:payment", payload);
  emitToAdmins("order:payment", payload);
};

module.exports = {
  initSocket,
  getIO: () => io,
  ROOMS,
  notifyNewProduct,
  notifyOrderStatus,
  notifyNewOrder,
  notifyPaymentUpdate,
};
