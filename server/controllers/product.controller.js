const Product = require("../models/product.model");

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category", "name slug");
        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name slug");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json(product);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.files && req.files.length) {
            payload.images = req.files.map((file) => `/uploads/${file.filename}`);
        }

        const product = await Product.create(payload);
        return res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.files && req.files.length) {
            payload.images = req.files.map((file) => `/uploads/${file.filename}`);
        }

        const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product updated successfully", product });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
