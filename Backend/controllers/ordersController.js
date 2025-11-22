// Aquí después vas a conectar tu BD y helpers de correo/PDF
// const db = require("../db/connection");
// const sendEmail = require("../helpers/sendEmail");
// const generateOrderPdf = require("../helpers/generateOrderPdf");

const checkoutOrder = async (req, res) => {
  try {
    const { items, coupon, shippingData } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "La orden no tiene productos" });
    }

    // TODO: lógica real de orden

    return res.status(201).json({
      message: "Orden creada correctamente (dummy)",
      // orderId: nuevaOrdenId,
    });
  } catch (error) {
    console.error("Error en checkoutOrder:", error);
    return res.status(500).json({ message: "Error al procesar la orden" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    // TODO: traer órdenes reales de la BD

    return res.json({
      message: "Historial de órdenes (dummy)",
      orders: [],
    });
  } catch (error) {
    console.error("Error en getUserOrders:", error);
    return res.status(500).json({ message: "Error al obtener las órdenes" });
  }
};

module.exports = {
  checkoutOrder,
  getUserOrders,
};

