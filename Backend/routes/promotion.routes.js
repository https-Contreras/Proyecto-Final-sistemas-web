const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");

// POST /tech-up/promotions/send - Enviar promoción a un suscriptor específico
/**
 * @swagger
 * /tech-up/promotions/send:
 *   post:
 *     summary: Enviar promoción a un suscriptor
 *     description: Envía un correo promocional a un suscriptor específico
 *     tags: [Promociones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - title
 *               - description
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del destinatario
 *                 example: "usuario@ejemplo.com"
 *               title:
 *                 type: string
 *                 description: Título de la promoción
 *                 example: "¡50% de descuento en laptops!"
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la oferta
 *                 example: "Aprovecha esta increíble oferta por tiempo limitado..."
 *               discountCode:
 *                 type: string
 *                 description: Código de descuento (opcional)
 *                 example: "LAPTOP50"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL de imagen promocional (opcional)
 *                 example: "https://ejemplo.com/promo.jpg"
 *     responses:
 *       200:
 *         description: Promoción enviada exitosamente
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
 *                   example: "Promoción enviada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sentTo:
 *                       type: string
 *                       example: "usuario@ejemplo.com"
 *                     title:
 *                       type: string
 *                       example: "¡50% de descuento!"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/send", promotionController.sendPromotion);

// POST /tech-up/promotions/send-all - Enviar promoción a todos los suscriptores
/**
 * @swagger
 * /tech-up/promotions/send-all:
 *   post:
 *     summary: Enviar promoción a todos los suscriptores
 *     description: Envía un correo promocional masivo a todos los suscriptores activos del newsletter
 *     tags: [Promociones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "¡Black Friday en Tech-Up!"
 *               description:
 *                 type: string
 *                 example: "Descuentos de hasta 70% en toda la tienda"
 *               discountCode:
 *                 type: string
 *                 example: "BLACKFRI70"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://ejemplo.com/blackfriday.jpg"
 *     responses:
 *       200:
 *         description: Promociones enviadas exitosamente
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
 *                   example: "Promoción enviada a todos los suscriptores"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSuscriptores:
 *                       type: integer
 *                       example: 150
 *                     exitosos:
 *                       type: integer
 *                       example: 148
 *                     fallidos:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/send-all", promotionController.sendPromotionToAll);

module.exports = router;
