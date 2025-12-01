const express = require("express");
const router = express.Router();
// Importamos el controlador de productos (que ya tiene create, update, delete)
const productController = require("../controllers/productController");
// Importamos el controlador de suscripciones (para las stats)
const statsController= require("../controllers/statsController");

// Importamos los middlewares de seguridad
const { verifyToken, verifyAdmin } = require("../middleware/adminMiddleware");
const { verify } = require("jsonwebtoken");

// Crear Producto (POST /api/admin/products)
router.post(
  "/products",
  verifyToken,
  verifyAdmin,
  productController.createProduct
);

// Editar Producto (PUT /api/admin/products/:id)
router.put(
  "/products/:id",
  verifyToken,
  verifyAdmin,
  productController.updateProduct
);

// Eliminar Producto (DELETE /api/admin/products/:id)
router.delete("/products/:id", verifyToken, verifyAdmin, productController.deleteProduct);

//obtener estadisticas 
router.get("/dashboard-stats", verifyToken, verifyAdmin, statsController.getDashboardStats);
router.delete(
  "/products/:id",
  verifyToken,
  verifyAdmin,
  productController.deleteProduct
);

// ==========================================
// 📊 RUTAS DE ESTADÍSTICAS (DASHBOARD)
// ==========================================

// Obtener estadísticas de suscriptores (GET /api/admin/subscriptions/stats)
/**
 * @swagger
 * /tech-up/api/admin/stats:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     description: Retorna estadísticas generales para el panel de administración (ventas, productos, usuarios)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     totalVentas:
 *                       type: number
 *                       example: 1250000.00
 *                     totalProductos:
 *                       type: integer
 *                       example: 150
 *                     totalUsuarios:
 *                       type: integer
 *                       example: 450
 *                     totalSuscriptores:
 *                       type: integer
 *                       example: 280
 *                     ventasHoy:
 *                       type: number
 *                       example: 45000.00
 *                     productosMasVendidos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 9
 *                           nombre:
 *                             type: string
 *                             example: "Teclado Mecánico RGB"
 *                           ventasSimuladas:
 *                             type: integer
 *                             example: 234
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido - Se requieren permisos de administrador
 *       500:
 *         description: Error del servidor
 */
//router.get("/subscriptions/stats", verifyToken, verifyAdmin, subscriptionController.getSubscriptionStats);

// Obtener lista de suscriptores (GET /api/admin/subscriptions)
//router.get("/subscriptions", verifyToken, verifyAdmin, subscriptionController.getAllSubscriptions);

module.exports = router;
