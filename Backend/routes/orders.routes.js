const express = require("express");
const router = express.Router();

const {
  checkoutOrder,
  getUserOrders,
} = require("../controllers/ordersController");

// Crea la orden final, reduce inventario y manda correo con PDF
router.post("/checkout", checkoutOrder);

// Opcional: historial de compras del usuario
router.get("/", getUserOrders);

module.exports = router;
