// 📁 Backend/routes/payment.routes.js

const express = require("express");
const router = express.Router();
const { verifyCaptcha } = require('../middleware/captcha.middleware');
const paymentController = require("../controllers/orderController");

// Ruta para procesar pagos (CON verificación de CAPTCHA)
router.post('/procesar-pago', verifyCaptcha, paymentController.createOrder);


// Ruta para procesar pagos (CON verificación de CAPTCHA)
/**
 * @swagger
 * /tech-up/payment/process:
 *   post:
 *     summary: Procesar pago
 *     description: Procesa el pago de una orden de compra
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - metodoPago
 *               - datosComprador
 *             properties:
 *               monto:
 *                 type: number
 *                 format: float
 *                 description: Monto total a pagar
 *                 example: 48500.00
 *               metodoPago:
 *                 type: string
 *                 enum: [tarjeta, paypal, transferencia, oxxo]
 *                 description: Método de pago seleccionado
 *                 example: "tarjeta"
 *               datosComprador:
 *                 type: object
 *                 required:
 *                   - nombre
 *                   - email
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "juan@ejemplo.com"
 *                   telefono:
 *                     type: string
 *                     example: "4491234567"
 *                   direccion:
 *                     type: object
 *                     properties:
 *                       calle:
 *                         type: string
 *                         example: "Av. Principal 123"
 *                       ciudad:
 *                         type: string
 *                         example: "Aguascalientes"
 *                       estado:
 *                         type: string
 *                         example: "Aguascalientes"
 *                       cp:
 *                         type: string
 *                         example: "20100"
 *               datosTarjeta:
 *                 type: object
 *                 description: Solo si metodoPago es 'tarjeta'
 *                 properties:
 *                   numero:
 *                     type: string
 *                     example: "4242424242424242"
 *                   nombreTitular:
 *                     type: string
 *                     example: "Juan Perez"
 *                   expiracion:
 *                     type: string
 *                     example: "12/25"
 *                   cvv:
 *                     type: string
 *                     example: "123"
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
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
 *                   example: "Pago procesado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaccionId:
 *                       type: string
 *                       example: "TXN-123456789"
 *                     ordenId:
 *                       type: integer
 *                       example: 456
 *                     monto:
 *                       type: number
 *                       example: 48500.00
 *                     fecha:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos de pago inválidos
 *       401:
 *         description: No autorizado
 *       402:
 *         description: Pago rechazado
 *       500:
 *         description: Error del servidor
 */

router.post("/procesar-pago", verifyCaptcha, async (req, res) => {
  try {
    const { metodo, datos, total } = req.body;

    // ✅ Si llegaste aquí, el CAPTCHA es válido (gracias al middleware)

    console.log("✅ Procesando pago con CAPTCHA válido:", { metodo, total });

    // 🔐 Aquí va tu lógica de pago real
    // Por ejemplo: procesar tarjeta, registrar transferencia, etc.

    // Simular procesamiento exitoso
    const ordenId = Math.floor(100000 + Math.random() * 900000);

    res.json({
      success: true,
      message: "Pago procesado exitosamente",
      ordenId: ordenId,
      metodo: metodo,
    });
  } catch (error) {
    console.error("❌ Error procesando pago:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar el pago",
    });
  }
});

module.exports = router;
