const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyCaptcha } = require('../middleware/captcha.middleware'); // ← Ruta correcta

// POST /tech-up/users/login - Autenticación de usuarios
router.post("/login", userController.login);

router.post("/login", verifyCaptcha, userController.login);
router.post('/register', verifyCaptcha, userController.register);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/verify", userController.verifyUser);

//Ruta de formulario de contacto
router.post('/contact', verifyCaptcha,userController.contact);


module.exports = router;
