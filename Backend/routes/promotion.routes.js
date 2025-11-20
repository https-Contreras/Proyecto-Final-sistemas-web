const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");

// POST /tech-up/promotions/send - Enviar promoción a un suscriptor específico
router.post("/send", promotionController.sendPromotion);

// POST /tech-up/promotions/send-all - Enviar promoción a todos los suscriptores
router.post("/send-all", promotionController.sendPromotionToAll);

module.exports = router;