const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const {
    // createVerificationToken,
    sendVerificationEmail } = require("../utils/email");

const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days — same as the JWT expiry

// const createToken = (user, expiryTime) => {
//     return jwt.sign(
//         { id: user._id, email: user.email, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: expiryTime }
//     );
// };

const createToken = (user, expiryTime = "7d") => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: expiryTime }
    );
};

// const createToken = (user, expiryTime = "24h") => {
//     return jwt.sign(
//         { id: user._id, email: user.email, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: expiryTime }
//     );
// };

// const createToken = (user) => {
//     return jwt.sign(
//         { id: user._id, email: user.email, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//     );
// };

// Cookie ki options ek hi jagah. clearCookie ko bhi bilkul yehi options
// (maxAge ke bagair) chahiye hoti hain — warna browser cookie ko match nahi
// karta aur logout par wo delete hi nahi hoti.
const tokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,                           // JavaScript isay parh nahi sakta (XSS protection)
        secure: isProduction,                     // HTTPS only in production
        sameSite: isProduction ? "none" : "lax",  // "none" ke sath secure: true zaroori hai
        path: "/",
    };
};

// Sends the JWT as an httpOnly cookie so the browser attaches it automatically.
// httpOnly keeps it out of reach of JavaScript, which protects it from XSS.
const setTokenCookie = (res, token) => {
    res.cookie("token", token, { ...tokenCookieOptions(), maxAge: TOKEN_MAX_AGE });
};

const register = async (req, res) => {
    // console.log(req.body, "body");

    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password) {
        throw new AppError("Name, email and password are required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already exists", 400);
    }
    const isCustomer = role === "customer";

    // Duplicate phone upar wale check se bach kar nikal jata hai — errorHandler
    // us unique-index violation ko "phone already exists" bana deta hai.
    const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        address,
        // ...(role === "admin" ? { isEmailVerified: true } : {}),
        // ...(!isCustomer ? { isEmailVerified: true } : {}),
        ...(isCustomer ? {} : { isEmailVerified: true })
    });


    if (isCustomer) {
        // const verificationToken = createVerificationToken(user);
        const verificationToken = createToken(user, "24h");
        user.emailVerificationToken = verificationToken;
        await user.save();

        const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

        await sendVerificationEmail({
            to: user.email,
            name: user.name,
            verificationLink,
        });
    }

    return res.status(201).json({
        message: `User registered successfully.${isCustomer ? " Please verify your email to activate your account." : ""}`,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            ...(isCustomer ? { isEmailVerified: user.isEmailVerified } : {})
        },
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError("Invalid email or password", 401);
    }

    if (!user.isEmailVerified) {
        throw new AppError("Please verify your email before logging in", 403);
    }
    // Token response body mein NAHI jata — sirf httpOnly cookie mein set hota
    // hai. Is se frontend ko token localStorage mein rakhne ki zarorat nahi
    // parti (jahan se XSS use chura sakta hai), aur browser har request ke
    // sath cookie khud bhej deta hai.
    //
    // Frontend ko `credentials: "include"` (ya axios mein `withCredentials: true`)
    // lagana zaroori hai, warna browser cookie na bhejega na rakhega.
    setTokenCookie(res, createToken(user));

    return res.json({
        message: "Login successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    });
};

/**
 * Logout — cookie hata deta hai.
 *
 * Jaan boojh kar `authenticate` ke bagair rakha hai: agar token expire ho chuka
 * ho to bhi browser se cookie nikalni chahiye. Isi liye ye request kabhi fail
 * nahi karti, chahe user pehle se logged out ho.
 *
 * Note: JWT stateless hai — hum server par kuch "revoke" nahi kar rahe. Agar
 * kisi ne cookie ki value pehle copy kar li ho to wo token apni expiry tak
 * valid rehta hai. Sach much revoke karne ke liye DB mein blacklist ya
 * refresh-token wala tareeqa chahiye hota hai.
 */
const logout = async (req, res) => {
    res.clearCookie("token", tokenCookieOptions());

    return res.json({ message: "Logout successfully" });
};

const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    return res.json(user);
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new AppError("Verification token is required", 400);
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // Yehi ek jagah hai jahan JWT errors 401 nahi bante: purana signup link
        // ek bad request hai, authentication challenge nahi. Har jagah aur ye
        // errorHandler tak jaate hain, jo 401 deta hai.
        throw new AppError(
            error.name === "TokenExpiredError"
                ? "Verification token has expired"
                : "Invalid verification token",
            400
        );
    }

    const user = await User.findOne({ email: decoded.email, emailVerificationToken: token });

    if (!user) {
        throw new AppError("Invalid or expired verification token", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    return res.json({ message: "Email verified successfully" });
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    verifyEmail,
};