// 📁 Backend/routes/cart.routes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth.middleware');

// ============================================
// 🛒 RUTAS DEL CARRITO
// ============================================

// Todas las rutas del carrito requieren autenticación (JWT)

/**
 * GET /api/cart
 * Obtiene el carrito del usuario (valida productos desde localStorage)
 */
router.post('/cart', verifyToken, cartController.getCart);

/**
 * POST /api/cart/add
 * Agrega un producto al carrito (valida stock)
 */
router.post('/cart/add', verifyToken, cartController.addToCart);

/**
 * PUT /api/cart/update
 * Actualiza la cantidad de un producto (valida stock)
 */
router.put('/cart/update', verifyToken, cartController.updateCartItem);

/**
 * DELETE /api/cart/remove
 * Elimina un producto del carrito
 */
router.delete('/cart/remove', verifyToken, cartController.removeFromCart);

/**
 * POST /api/cart/apply-coupon
 * Aplica un cupón de descuento
 */
router.post('/cart/apply-coupon', verifyToken, cartController.applyCoupon);

module.exports = router;