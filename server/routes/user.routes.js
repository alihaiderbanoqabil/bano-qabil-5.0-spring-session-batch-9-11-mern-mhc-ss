const express = require("express");
const {
    register,
    login,
    getMe,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/user.controller");
// const { authenticate, authorizeRoles } = require("../middlewares");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;




// router.post("/register", register);
// router.post("/login", login);
// router.get("/me", authenticate, getMe);
// router.get("/", authenticate, authorizeRoles("admin"), getUsers);
// router.get("/:id", authenticate, getUserById);
// router.patch("/:id", authenticate, updateUser);
// router.delete("/:id", authenticate, authorizeRoles("admin"), deleteUser);
