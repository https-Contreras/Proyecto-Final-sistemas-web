const express = require("express");
const router = express.Router();
const userController=require("../controllers/userController");


router.post("/login",userController.login);

// Nueva ruta para suscripciones
router.post("/subscribe", userController.subscribe);

module.exports=router;