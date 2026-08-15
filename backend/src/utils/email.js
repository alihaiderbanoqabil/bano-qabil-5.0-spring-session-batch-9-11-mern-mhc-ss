require("dotenv").config();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// const createVerificationToken = (user) => {
//     return jwt.sign(
//         { id: user._id, email: user.email },
//         process.env.JWT_SECRET,
//         { expiresIn: "24h" }
//     );
// };

const createVerificationEmailTemplate = (name, verificationLink) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #111827;">Verify Your Email Address</h2>
            <p style="color: #374151;">Hello ${name || "there"},</p>
            <p style="color: #374151;">Thank you for registering with us. Please verify your email address to activate your account.</p>
            <p style="margin: 24px 0;">
                <a href="${verificationLink}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Verify Email
                </a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="color: #2563eb; word-break: break-all;">${verificationLink}</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">This link will expire in 24 hours.</p>
        </div>
    `;
};

const sendVerificationEmail = async ({ to, name, verificationLink }) => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("SMTP credentials are not configured. Verification email was not sent.");
        return { success: false, message: "SMTP credentials not configured" };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: String(process.env.EMAIL_PORT || 587) === "465",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: "Verify your email address",
        html: createVerificationEmailTemplate(name, verificationLink),
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
};

module.exports = {
    // createVerificationToken,
    createVerificationEmailTemplate,
    sendVerificationEmail,
};
