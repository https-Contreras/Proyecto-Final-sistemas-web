const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

/**
 * @swagger
 * /tech-up/subscriptions:
 *   post:
 *     summary: Suscribirse al newsletter
 *     description: Permite a un usuario suscribirse al newsletter. Envía un correo de bienvenida automáticamente.
 *     tags: [Suscripciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del suscriptor
 *                 example: "usuario@ejemplo.com"
 *     responses:
 *       201:
 *         description: Suscripción exitosa
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
 *                   example: "¡Suscripción exitosa! Revisa tu correo."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "usuario@ejemplo.com"
 *                     fechaSuscripcion:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos o email ya suscrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "El correo electrónico es requerido"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Obtener todas las suscripciones
 *     description: Retorna la lista completa de suscriptores (solo para administradores)
 *     tags: [Suscripciones]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de suscripciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 150
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: "usuario@ejemplo.com"
 *                       fechaSuscripcion:
 *                         type: string
 *                         format: date-time
 *                       activo:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", subscriptionController.subscribe);
router.get("/", subscriptionController.getAllSubscriptions);

/**
 * @swagger
 * /tech-up/subscriptions/stats:
 *   get:
 *     summary: Obtener estadísticas de suscripciones
 *     description: Retorna estadísticas sobre el total de suscriptores y crecimiento
 *     tags: [Suscripciones]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas
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
 *                     totalSuscriptores:
 *                       type: integer
 *                       example: 150
 *                     suscripcionesRecientes:
 *                       type: integer
 *                       example: 25
 *                     ultimaSuscripcion:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stats", subscriptionController.getSubscriptionStats);

module.exports = router;
