const express = require("express");
const router = express.Router();

// Importamos el controlador de productos (que ya tiene create, update, delete)
const productController = require("../controllers/productController");
// Importamos el controlador de suscripciones (para las stats)
const subscriptionController = require("../controllers/subscriptionController");

// Importamos los middlewares de seguridad
const { verifyToken, verifyAdmin } = require("../middleware/adminMiddleware");


// Crear Producto (POST /api/admin/products)
router.post("/products", verifyToken, verifyAdmin, productController.createProduct);

// Editar Producto (PUT /api/admin/products/:id)
router.put("/products/:id", verifyToken, verifyAdmin, productController.updateProduct);

// Eliminar Producto (DELETE /api/admin/products/:id)
router.delete("/products/:id", verifyToken, verifyAdmin, productController.deleteProduct);


// ==========================================
// 📊 RUTAS DE ESTADÍSTICAS (DASHBOARD)
// ==========================================

// Obtener estadísticas de suscriptores (GET /api/admin/subscriptions/stats)
//router.get("/subscriptions/stats", verifyToken, verifyAdmin, subscriptionController.getSubscriptionStats);

// Obtener lista de suscriptores (GET /api/admin/subscriptions)
//router.get("/subscriptions", verifyToken, verifyAdmin, subscriptionController.getAllSubscriptions);


module.exports = router;