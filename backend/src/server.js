require("dotenv").config();

const express = require("express");
const http = require("http");
// https://www.npmjs.com/package/cors
const cors = require('cors'); 
// https://www.npmjs.com/package/helmet
const helmet = require('helmet');
// https://www.npmjs.com/package/express-rate-limit
const rateLimit = require('express-rate-limit');
// https://www.npmjs.com/package/express-xss-sanitizer
const { xss } = require('express-xss-sanitizer');
// https://www.npmjs.com/package/cookie-parser
// req.cookies bharta hai — httpOnly auth cookie parhne ke liye zaroori hai
const cookieParser = require('cookie-parser');

const path = require("path");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const orderRoutes = require("./routes/order.routes");
const commentRoutes = require("./routes/comment.routes");
const statsRoutes = require("./routes/stats.routes");
const paymentRoutes = require("./routes/payment.routes");
const { handleWebhook } = require("./controllers/payment.controller");
const { initSocket } = require("./socket");

// Express ke bahar hone wale stray promise rejections ke liye — sirf LOG karte
// hain, process band nahi karte. Wajah: kuch third-party SDKs (jaise Cloudinary)
// khud internally ek "orphaned" duplicate rejection bhejte hain jo already
// errorHandler se properly 400/500 ban kar client ko ja chuka hota hai — us par
// process.exit() karna ek normal user-error (jaise galat file format) ko pure
// server ka outage bana deta hai sab users ke liye. Genuine sync bugs
// uncaughtException se abhi bhi fatal hain.
process.on("unhandledRejection", (reason) => {
    console.warn("Unhandled Rejection (logged, process zinda hai):", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

connectDB();

const app = express();

app.set('query parser', 'extended'); // restores qs-style nested query parsing

// Adds headers: Access-Control-Allow-Origin: *
// app.use(cors())

// Helmet — sets various security-related HTTP headers
app.use(helmet());

// middleware which sanitizes user input data (in req.body, req.query, req.headers and req.params) to prevent Cross Site Scripting (XSS) attack.
app.use(xss());

// CORS — configure allowed origins as needed
// NOTE: auth cookie ke sath origin '*' kaam nahi karta — credentials: true ke
// sath browser exact origin maangta hai. Is liye har frontend port yahan likhna
// parta hai (5173 = Vite ka default, 3000 = CRA/Next).
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // replace with your allowed origin(s)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, // cookies/auth headers cross-origin bhejne ke liye zaroori
}));

// ── Stripe webhook — sab se pehle, JSON parser se PEHLE ──────────────────
// Signature verify karne ke liye Stripe ko byte-for-byte wohi body chahiye jo
// usne bheji thi. express.json() usay parse kar ke object bana deta, aur xss()
// sanitize kar deta — dono se signature toot jata. Is liye ye route yahan hai,
// apne raw parser ke sath. Rate limiter se bhi bahar rakha hai, warna busy
// din mein Stripe ke retries 429 khane lagte.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Rate limiting — protects against brute force / abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // limit each IP to 100 requests per window
    standardHeaders: true,    // return rate limit info in RateLimit-* headers
    legacyHeaders: false,     // disable X-RateLimit-* headers
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Middleware to parse JSON request bodies
app.use(express.json()); 
// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true })); 
// Cookies ko req.cookies mein parse karta hai (auth token cookie ke liye)
app.use(cookieParser()); 
// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/media", require("./routes/media.routes"));

// Har route ke baad honi chahiye: upar jo bhi match na ho, wo yahan pakra jata hai.
app.use(notFound);
// Sab se aakhir mein honi chahiye: next() se aaya, sync throw hua, ya async
// reject hua (Express 5 khud forward karta hai) — har error yahan aata hai.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Socket.IO ko express ke saath ek hi HTTP server par chalate hain — is liye
// app.listen() ki jagah apna http server banate hain aur usi ko dono dete hain.
// Fayda: ek hi port, ek hi origin, aur wohi auth cookie socket par bhi.
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;



// Quick reference — errorHandler live test se ye responses aate hain:

// expired verification token       400  {"message":"Verification token has expired"}
// expired auth token               401  {"message":"Token expired"}
// invalid auth token               401  {"message":"Invalid token"}
// malformed JSON body              400  {"message":"Invalid JSON body"}
// 404 unmatched route              404  {"message":"Route not found - GET /api/nope"}
// CastError bad ObjectId           400  {"message":"Invalid _id: not-valid"}
// customer → admin-only route      403  {"message":"Forbidden: insufficient role"}
// upload non-image                 400  {"message":"Only image files are allowed"}
// duplicate category name          400  {"message":"name already exists"}
// missing product fields           400  {"message":"Category is required, Price is required"}
// unexpected bug (dev)             500  {"message":"Cannot read properties of undefined..."}
// unexpected bug (production)      500  {"message":"Internal server error"}