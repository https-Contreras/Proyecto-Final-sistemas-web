const express = require("express");
const router = express.Router();

const {
  handleContact,
  handleSubscribe,
} = require("../controllers/generalController");

// Formulario "Contáctanos"
router.post("/contact", handleContact);

// Suscripción del footer
router.post("/subscribe", handleSubscribe);

module.exports = router;
