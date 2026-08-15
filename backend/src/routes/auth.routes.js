const express = require("express");
const {
    register,
    login,
    getMe,
    verifyEmail,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.get("/verify-email", verifyEmail);

module.exports = router;