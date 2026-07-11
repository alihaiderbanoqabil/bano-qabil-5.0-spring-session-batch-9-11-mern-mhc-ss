const Category = require("../models/category.model");

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.json(categories);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.json(category);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.file) {
            payload.image = `/uploads/${req.file.filename}`;
        }

        const category = await Category.create(payload);
        return res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.file) {
            payload.image = `/uploads/${req.file.filename}`;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.json({ message: "Category updated successfully", category });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.json({ message: "Category deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
