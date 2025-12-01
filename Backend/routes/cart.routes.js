// Backend/routes/cart.routes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/adminMiddleware");

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtener carrito del usuario
 *     description: Retorna el carrito de compras actual del usuario autenticado
 *     tags: [Carrito]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           productoId:
 *                             type: integer
 *                             example: 5
 *                           nombre:
 *                             type: string
 *                             example: "Laptop Gamer"
 *                           precio:
 *                             type: number
 *                             example: 48500.00
 *                           cantidad:
 *                             type: integer
 *                             example: 2
 *                           subtotal:
 *                             type: number
 *                             example: 97000.00
 *                     total:
 *                       type: number
 *                       example: 97000.00
 *                     cantidadItems:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *       500:
 *         description: Error del servidor
 */
router.get("/", verifyToken, cartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Agregar producto al carrito
 *     description: Agrega un producto al carrito o incrementa su cantidad si ya existe
 *     tags: [Carrito]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - cantidad
 *             properties:
 *               productoId:
 *                 type: integer
 *                 description: ID del producto a agregar
 *                 example: 5
 *               cantidad:
 *                 type: integer
 *                 description: Cantidad a agregar
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       200:
 *         description: Producto agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Producto agregado al carrito"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/add", verifyToken, cartController.addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Actualizar cantidad de producto
 *     description: Modifica la cantidad de un producto en el carrito
 *     tags: [Carrito]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - cantidad
 *             properties:
 *               productoId:
 *                 type: integer
 *                 description: ID del producto a actualizar
 *                 example: 5
 *               cantidad:
 *                 type: integer
 *                 description: Nueva cantidad
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cantidad actualizada"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put("/update", verifyToken, cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{productoId}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     description: Elimina completamente un producto del carrito
 *     tags: [Carrito]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *         example: 5
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado del carrito"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete(
  "/remove/:productoId",
  verifyToken,
  cartController.removeFromCart
);

/**
 * @swagger
 * /api/cart/apply-coupon:
 *   post:
 *     summary: Aplicar cupón de descuento
 *     description: Aplica un código de cupón al carrito para obtener descuento
 *     tags: [Carrito]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código del cupón
 *                 example: "WELCOME10"
 *     responses:
 *       200:
 *         description: Cupón aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cupón aplicado correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     descuento:
 *                       type: number
 *                       example: 10
 *                     totalConDescuento:
 *                       type: number
 *                       example: 43650.00
 *       400:
 *         description: Cupón inválido o expirado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/apply-coupon", verifyToken, cartController.applyCoupon);

/**
 * @swagger
 * /api/cart/remove-coupon:
 *   delete:
 *     summary: Eliminar cupón aplicado
 *     description: Remueve el cupón de descuento del carrito
 *     tags: [Carrito]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cupón eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cupón eliminado"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete("/remove-coupon", verifyToken, cartController.removeCoupon);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Vaciar carrito completo
 *     description: Elimina todos los productos del carrito del usuario
 *     tags: [Carrito]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Carrito vaciado"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete("/clear", verifyToken, cartController.clearCart);

/**
 * @swagger
 * /api/cart/coupons:
 *   get:
 *     summary: Obtener cupones disponibles
 *     description: Retorna la lista de cupones de descuento activos
 *     tags: [Carrito]
 *     responses:
 *       200:
 *         description: Lista de cupones obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       codigo:
 *                         type: string
 *                         example: "WELCOME10"
 *                       descuento:
 *                         type: number
 *                         example: 10
 *                       descripcion:
 *                         type: string
 *                         example: "10% de descuento en tu primera compra"
 *                       activo:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Error del servidor
 */
router.get("/coupons", cartController.getAvailableCoupons);

module.exports = router;
