const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

/**
 * @swagger
 * /tech-up/api/products:
 *   get:
 *     summary: Obtiene todos los productos
 *     description: Retorna una lista de todos los productos. Acepta filtros opcionales por categoría y ofertas.
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [laptops, desktops, accesorios]
 *         description: Filtrar por categoría
 *         example: laptops
 *       - in: query
 *         name: oferta
 *         schema:
 *           type: boolean
 *         description: Filtrar productos en oferta
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
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
 *                   example: 10
 *                 filters:
 *                   type: object
 *                   properties:
 *                     categoria:
 *                       type: string
 *                       example: laptops
 *                     oferta:
 *                       type: string
 *                       example: "true"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: "Laptop Gamer Avanzada RTX 4080"
 *                       descripcion:
 *                         type: string
 *                         example: "Intel Core i9, 32GB RAM, RTX 4080"
 *                       precio:
 *                         type: number
 *                         format: float
 *                         example: 48500.00
 *                       precioOriginal:
 *                         type: number
 *                         format: float
 *                         example: 55000.00
 *                       categoria:
 *                         type: string
 *                         example: "laptops"
 *                       oferta:
 *                         type: boolean
 *                         example: true
 *                       descuento:
 *                         type: integer
 *                         example: 12
 *                       imagen:
 *                         type: string
 *                         example: "assets/images/laptop-gamer.jpg"
 *                       stock:
 *                         type: integer
 *                         example: 15
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /tech-up/api/products/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     description: Retorna la información detallada de un producto específico
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     responses:
 *       200:
 *         description: Producto encontrado
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "Laptop Gamer Avanzada RTX 4080"
 *                     descripcion:
 *                       type: string
 *                       example: "Intel Core i9, 32GB RAM, RTX 4080"
 *                     precio:
 *                       type: number
 *                       format: float
 *                       example: 48500.00
 *                     categoria:
 *                       type: string
 *                       example: "laptops"
 *                     especificaciones:
 *                       type: object
 *                       properties:
 *                         procesador:
 *                           type: string
 *                           example: "Intel Core i9-13900H"
 *                         ram:
 *                           type: string
 *                           example: "32GB DDR5"
 *                         almacenamiento:
 *                           type: string
 *                           example: "2TB SSD NVMe"
 *       404:
 *         description: Producto no encontrado
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
 *                   example: "Producto con ID 1 no encontrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", productController.getProductById);

module.exports = router;
