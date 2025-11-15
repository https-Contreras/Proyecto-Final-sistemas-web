const emailService = require("../services/emailService");

// Controlador de login existente
exports.login = (req, res) => {
  console.log("Entro a login");
  res.status(200).json({
    message: "Respuesta de prueba desde el controlador",
  });
};

// Controlador para enviar promociones a suscriptores
exports.sendPromotion = async (req, res) => {
  try {
    const { email, title, description, discountCode, imageUrl } = req.body;

    if (!email || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Email, título y descripción son requeridos",
      });
    }

    console.log(`📢 Enviando promoción "${title}" a: ${email}`);

    await emailService.sendPromotionalEmail(email, {
      title,
      description,
      discountCode,
      imageUrl,
    });

    res.status(200).json({
      success: true,
      message: "Promoción enviada exitosamente",
      sentTo: email,
    });
  } catch (error) {
    console.error("❌ Error al enviar promoción:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar la promoción",
      error: error.message,
    });
  }
};

// Controlador para manejar suscripciones
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "El formato del correo electrónico no es válido",
      });
    }

    console.log(`📧 Nueva suscripción: ${email}`);

    await emailService.sendWelcomeEmail(email);
    await emailService.sendAdminNotification(email);

    res.status(200).json({
      success: true,
      message: "¡Suscripción exitosa! Revisa tu correo.",
      email: email,
    });
  } catch (error) {
    console.error("❌ Error en suscripción:", error);
    res.status(500).json({
      success: false,
      message: "Hubo un error al procesar tu suscripción. Intenta de nuevo.",
      error: error.message,
    });
  }
};
