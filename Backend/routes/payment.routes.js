// 📁 Backend/routes/payment.routes.js

const express = require('express');
const router = express.Router();
const { verifyCaptcha } = require('../middleware/captcha.middleware');
const paymentController = require("../controllers/orderController");

// Ruta para procesar pagos (CON verificación de CAPTCHA)
router.post('/procesar-pago', verifyCaptcha, paymentController.createOrder);

module.exports = router;