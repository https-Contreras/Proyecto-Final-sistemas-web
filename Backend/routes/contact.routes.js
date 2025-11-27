const express = require("express");
const router = express.Router();
const { verifyCaptcha } = require("../middleware/captcha.middleware");
const userController = require("../controllers/userController");
// Ruta para procesar formulario de contacto (CON verificación de CAPTCHA)
/**
 * @swagger
 * /tech-up/contact:
 *   post:
 *     summary: Enviar mensaje de contacto
 *     description: Envía un mensaje a través del formulario de contacto. Se enviará un correo al equipo de Tech-Up.
 *     tags: [Contacto]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - mensaje
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo
 *                 example: "María González"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico
 *                 example: "maria@ejemplo.com"
 *               asunto:
 *                 type: string
 *                 description: Asunto del mensaje (opcional)
 *                 example: "Consulta sobre producto"
 *               mensaje:
 *                 type: string
 *                 description: Contenido del mensaje
 *                 example: "Me gustaría saber más sobre la Laptop Gamer..."
 *               telefono:
 *                 type: string
 *                 description: Teléfono opcional
 *                 example: "4491234567"
 *     responses:
 *       200:
 *         description: Mensaje enviado exitosamente
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
 *                   example: "Mensaje enviado exitosamente. Te responderemos pronto."
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */

router.post("/contact", verifyCaptcha, userController.contact);

module.exports = router;
