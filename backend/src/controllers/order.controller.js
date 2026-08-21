const Order = require("../models/order.model");
const Product = require("../models/product.model");
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

    // order.user populate ho chuka hai, is liye .toString() poora document deta
    // hai — comparison ke liye uska _id chahiye. (Pehle yahan customer ko apni
    // hi order par 403 milta tha.)
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user.id) {
        throw new AppError("Forbidden", 403);
    }

    return res.json(order);
};

/**
 * Order banata hai. Price aur totalAmount client se NAHI letey — DB se
 * padhte hain, warna koi bhi 1500 ka laptop 1 rupay mein order kar sakta hai.
 * Sath hi stock check aur decrement bhi yahan hota hai.
 */
const createOrder = async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Order must have at least one item", 400);
    }

    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productById = new Map(products.map((product) => [product._id.toString(), product]));

    const orderItems = items.map((item) => {
        const product = productById.get(String(item.product));
        if (!product) {
            throw new AppError(`Product not found or unavailable: ${item.product}`, 400);
        }

        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new AppError(`Invalid quantity for ${product.name}`, 400);
        }
        if (product.stock < quantity) {
            throw new AppError(`Only ${product.stock} left in stock for ${product.name}`, 400);
        }

        return { product: product._id, quantity, price: product.price };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
        user: req.user.role === "admin" && req.body.user ? req.body.user : req.user.id,
        items: orderItems,
        totalAmount: Math.round(totalAmount * 100) / 100,
        shippingAddress,
        paymentMethod,
    });

    // Stock kam karo. Transaction nahi hai (standalone Mongo replica set ke
    // bagair chalta nahi), is liye ye best-effort hai — class project ke liye
    // kaafi, magar production mein transaction ya reservation chahiye hoti.
    await Promise.all(
        orderItems.map((item) =>
            Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
        )
    );

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
        // Customer sirf apni order cancel kar sakta hai — status ki baqi
        // values (shipped, delivered...) admin ka kaam hain.
        const wantsCancel = payload.status === "cancelled";
        delete payload.status;
        delete payload.paymentStatus;
        delete payload.paymentMethod;

        if (wantsCancel) {
            if (["shipped", "delivered"].includes(order.status)) {
                throw new AppError(`Cannot cancel an order that is already ${order.status}`, 400);
            }
            payload.status = "cancelled";
        }
    }

    // items/totalAmount client se badalna allowed nahi — pricing server ka kaam hai
    delete payload.items;
    delete payload.totalAmount;
    delete payload.user;

    const wasCancelled = order.status === "cancelled";

    Object.assign(order, payload);
    await order.save();

    // Cancel hone par stock wapis shelf par — warna cancelled orders inventory
    // hamesha ke liye kha jati hain.
    if (!wasCancelled && order.status === "cancelled") {
        await Promise.all(
            order.items.map((item) =>
                Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
            )
        );
    }

    return res.json({ message: "Order updated successfully", order });
};

const deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    // Pehle yahan koi check nahi tha — koi bhi logged-in user kisi ki bhi
    // order delete kar sakta tha.
    if (req.user.role !== "admin" && order.user.toString() !== req.user.id) {
        throw new AppError("Forbidden", 403);
    }

    await order.deleteOne();

    return res.json({ message: "Order deleted successfully" });
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
};
