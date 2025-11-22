// const db = require("../db/connection");
// const sendEmail = require("../helpers/sendEmail");

const handleContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Faltan datos del formulario" });
    }

    return res
      .status(200)
      .json({ message: "Mensaje recibido, en breve te contactaremos" });
  } catch (error) {
    console.error("Error en handleContact:", error);
    return res.status(500).json({ message: "Error al enviar el mensaje" });
  }
};

const handleSubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El correo es obligatorio" });
    }

    return res
      .status(201)
      .json({ message: "Gracias por suscribirte, revisa tu correo" });
  } catch (error) {
    console.error("Error en handleSubscribe:", error);
    return res.status(500).json({ message: "Error al suscribirse" });
  }
};

module.exports = {
  handleContact,
  handleSubscribe,
};
