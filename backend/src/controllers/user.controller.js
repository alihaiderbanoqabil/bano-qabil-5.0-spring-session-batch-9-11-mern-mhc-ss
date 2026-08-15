const User = require("../models/user.model");
const AppError = require("../utils/AppError");

const getUsers = async (req, res) => {
    const users = await User.find().select("-password");
    return res.json({ message: "Users get successfully", data: users });
};

const getUserById = async (req, res) => {
    // console.log(req.params, "req.params");

    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
        throw new AppError("Forbidden", 403);
    }

    // const user = await User.findById(req.params.id).select("name email");
    // const user = await User.findById(req.params.id).select("-password");
    const user = await User.findById(req.params.id);
    // const user = await User.findOne({ _id: req.params.id });
    // const user = await User.findOne({ email: req.params.email });
    if (!user) {
        throw new AppError("User not found", 404);
    }

    return res.json(user);
};

const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (req.user.role !== "admin" && req.user.id !== user._id.toString()) {
        throw new AppError("Forbidden", 403);
    }

    const updates = { ...req.body };
    if (req.user.role !== "admin") {
        delete updates.role;
    }

    if (updates.password) {
        user.password = updates.password;
        delete updates.password;
    }

    Object.assign(user, updates);
    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    return res.json({ message: "User updated successfully", user: updatedUser });
};

const deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    return res.json({ message: "User deleted successfully" });
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};
