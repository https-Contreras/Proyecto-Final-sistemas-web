const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

// POST /tech-up/subscriptions - Nueva suscripción al newsletter
router.post("/", subscriptionController.subscribe);

// GET /tech-up/subscriptions - Obtener todas las suscripciones (admin)
router.get("/get-subs", subscriptionController.getAllSubscriptions);

// GET /tech-up/subscriptions/stats - Obtener estadísticas de suscripciones
router.get("/stats", subscriptionController.getSubscriptionStats);

module.exports = router;
