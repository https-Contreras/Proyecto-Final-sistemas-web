const emailService = require("../config/mailer");
const subscriptionModel = require("../model/suscripcionesModel");

/**
 * Controlador para manejar nuevas suscripciones al newsletter
 * POST /tech-up/subscriptions
 */
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar que el email venga en la petición
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "El formato del correo electrónico no es válido",
      });
    }

    const isSubscribed = await subscriptionModel.isSubscribed(email);
    if (isSubscribed) {
      return res.status(400).json({
        success: false,
        message: "Este correo ya está suscrito a nuestro newsletter",
      });
    }

    console.log(`📧 Nueva suscripción: ${email}`);

    // Guardar suscripción en "base de datos" (simulada)
    await subscriptionModel.addSubscription(email);

    // Enviar correo de bienvenida al usuario
    await emailService.sendWelcomeEmail(email);

    // Enviar notificación al admin
    await emailService.sendAdminNotification(email);

    res.status(201).json({
      success: true,
      message: "¡Suscripción exitosa! Te hemos enviado un cupón a tu correo.",
      data: {
        email: email,
        fechaSuscripcion: new Date() // La fecha real la pone MySQL, aquí solo simulamos para la respuesta
      }
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

exports.getAllSubscriptions = async (req, res) => { // Agregamos ASYNC
  try {
    // Usamos AWAIT para esperar a la base de datos
    const subscriptions = await subscriptionModel.getAllSubscriptions();

    console.log(`📋 Suscripciones solicitadas - Total: ${subscriptions.length}`);

    res.status(200).json({
      success: true,
      total: subscriptions.length,
      data: subscriptions
    });

  } catch (error) {
    console.error("❌ Error al obtener suscripciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las suscripciones",
      error: error.message
    });
  }
};

/**
 * Obtiene estadísticas de suscripciones
 * GET /tech-up/subscriptions/stats
 */exports.getSubscriptionStats = async (req, res) => { // Agregamos ASYNC
  try {
    // Llamadas paralelas a la BD para ser más eficientes
    const [total, subscriptions] = await Promise.all([
        subscriptionModel.getTotalSubscriptions(),
        subscriptionModel.getAllSubscriptions()
    ]);

    // Calcular suscripciones recientes en código (JS)
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    // Filtramos usando la fecha que viene de la BD (campo fecha_suscripcion)
    const recentSubscriptions = subscriptions.filter(
      sub => new Date(sub.fecha_suscripcion) >= sixMonthsAgo
    );

    console.log(`📊 Estadísticas de suscripciones solicitadas`);

    res.status(200).json({
      success: true,
      data: {
        totalSuscriptores: total,
        suscripcionesRecientes: recentSubscriptions.length,
        // Verificamos si hay suscripciones para sacar la última
        ultimaSuscripcion: subscriptions.length > 0 
          ? subscriptions[subscriptions.length - 1].fecha_suscripcion 
          : null
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message
    });
  }
};