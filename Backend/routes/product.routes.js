// 📁 Backend/routes/product.routes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * GET /api/productos
 * Obtiene todos los productos (con filtros opcionales)
 */
router.get('/productos', productController.getAllProducts);

/**
 * GET /api/productos/:id
 * Obtiene un producto específico por ID
 */
router.get('/productos/:id', productController.getProductById);

module.exports = router;