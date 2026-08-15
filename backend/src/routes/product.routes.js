const express = require("express");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/product.controller");
const { authenticate, authorizeRoles, uploadMultiple } = require("../middlewares");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, authorizeRoles("admin"), uploadMultiple("images", 5), createProduct);
router.patch("/:id", authenticate, authorizeRoles("admin"), uploadMultiple("images", 5), updateProduct);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteProduct);

module.exports = router;
