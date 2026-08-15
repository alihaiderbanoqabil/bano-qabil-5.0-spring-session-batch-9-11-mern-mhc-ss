const Product = require("../models/product.model");
const AppError = require("../utils/AppError");
const { queryService } = require("../utils/queryService");

const getProducts = async (req, res) => {
    // console.log(req.query, "req.query");

    // const products = await Product.find().populate("category", "name slug").select("name description");
    // return res.json({ message: "Products fetched successfully.", data: products });

    // const result = await queryService(Product, req.query, {
    //     searchFields: ['name', 'description'],       // regex search targets
    //     populate: [{ path: 'category', select: 'name slug' }],
    //     // baseFilter: { ...(req.user.role === "customer" ? { isActive: true } : {}) },            // always-on server-side filter user this kind of check when api is private
    //     baseFilter: { isActive: true },            // always-on server-side filter
    // });

    const result = await queryService(Product, req.query,
        {
            baseFilter: { isActive: true },            // always-on server-side filter
            searchFields: ['name', 'description'],       // regex search targets
            populate: [{ path: 'category', select: 'name slug' }],
            // defaultLimit: 50,
            // maxLimit: 200
        }
    );

    // return res.json({ message: "Products fetched successfully.", data: result });
    return res.json({ message: "Products fetched successfully.", ...result });
};

const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category", "name slug");
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return res.json(product);
};

const createProduct = async (req, res) => {
    const payload = { ...req.body };

    if (req.files && req.files.length) {
        payload.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await Product.create(payload);
    return res.status(201).json({ message: "Product created successfully", product });
};

const updateProduct = async (req, res) => {
    const payload = { ...req.body };
    if (req.files && req.files.length) {
        payload.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return res.json({ message: "Product updated successfully", product });
};

const deleteProduct = async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return res.json({ message: "Product deleted successfully" });
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
