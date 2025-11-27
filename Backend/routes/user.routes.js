const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyCaptcha } = require("../middleware/captcha.middleware"); // ← Ruta correcta

// POST /tech-up/users/login - Autenticación de usuarios
router.post("/login", userController.login);
/**
 * @swagger
 * /tech-up/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y retorna un token JWT
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@ejemplo.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "contraseña123"
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                   example: "Login exitoso"
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     nombre:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     email:
 *                       type: string
 *                       example: "juan@ejemplo.com"
 *       400:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post("/login", verifyCaptcha, userController.login);
/**
 * @swagger
 * /tech-up/users/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una cuenta de usuario nueva en el sistema
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "juan@ejemplo.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 6 caracteres)
 *                 example: "contraseña123"
 *               telefono:
 *                 type: string
 *                 description: Teléfono opcional
 *                 example: "4491234567"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *                   example: "Usuario registrado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     email:
 *                       type: string
 *                       example: "juan@ejemplo.com"
 *       400:
 *         description: Datos inválidos o email ya registrado
 *       500:
 *         description: Error del servidor
 */

router.post("/register", verifyCaptcha, userController.register);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/verify", userController.verifyUser);

//Ruta de formulario de contacto
router.post("/contact", verifyCaptcha, userController.contact);

module.exports = router;
