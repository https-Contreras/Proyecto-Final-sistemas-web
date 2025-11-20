const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// GET /tech-up/api/products - Obtiene todos los productos con filtros opcionales
router.get("/", productController.getAllProducts);

// GET /tech-up/api/products/:id - Obtiene un producto por ID
router.get("/:id", productController.getProductById);

module.exports = router;
