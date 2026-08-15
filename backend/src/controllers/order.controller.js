const Order = require("../models/order.model");
const AppError = require("../utils/AppError");
const { queryService } = require("../utils/queryService");

const getOrders = async (req, res) => {
    // const filter = req.user.role === "admin" ? {} : { user: req.user.id };
    // const orders = await Order.find(filter).populate("user", "name email").populate("items.product", "name price");
    // return res.json(orders);

    const result = await queryService(Order, req.query,
        {
            baseFilter: req.user.role === "admin" ? {} : { user: req.user.id },            // always-on server-side filter

            populate: [
                { path: 'user', select: 'name email' }, 
                { path: 'items.product', select: 'name price' }
            ],

        }
    );
  return res.json({ message: "Orders fetched successfully.", ...result });
};

const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product", "name price");
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (req.user.role !== "admin" && order.user.toString() !== req.user.id) {
        throw new AppError("Forbidden", 403);
    }

    return res.json(order);
};

const createOrder = async (req, res) => {
    const payload = {
        ...req.body,
        user: req.user.role === "admin" && req.body.user ? req.body.user : req.user.id,
    };

    const order = await Order.create(payload);
    return res.status(201).json({ message: "Order created successfully", order });
};

const updateOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (req.user.role !== "admin" && order.user.toString() !== req.user.id) {
        throw new AppError("Forbidden", 403);
    }

    const payload = { ...req.body };
    if (req.user.role !== "admin") {
        delete payload.status;
        delete payload.paymentStatus;
        delete payload.paymentMethod;
    }

    Object.assign(order, payload);
    await order.save();

    return res.json({ message: "Order updated successfully", order });
};

const deleteOrder = async (req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return res.json({ message: "Order deleted successfully" });
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
};
