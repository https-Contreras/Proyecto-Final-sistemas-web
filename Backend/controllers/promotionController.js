const emailService = require("../config/mailer");
const { getAllSubscriptions } = require("../model/suscripcionesModel");

/**
 * Controlador para enviar promociones a un suscriptor específico
 * POST /tech-up/promotions/send
 */
exports.sendPromotion = async (req, res) => {
  try {
    const { email, title, description, discountCode, imageUrl } = req.body;

    // Validar datos requeridos
    if (!email || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Email, título y descripción son requeridos",
      });
    }

    console.log(`📢 Enviando promoción "${title}" a: ${email}`);

    // Enviar correo promocional
    await emailService.sendPromotionalEmail(email, {
      title,
      description,
      discountCode,
      imageUrl,
    });

    res.status(200).json({
      success: true,
      message: "Promoción enviada exitosamente",
      data: {
        sentTo: email,
        title: title,
      },
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

/**
 * Controlador para enviar promociones a TODOS los suscriptores
 * POST /tech-up/promotions/send-all
 */
exports.sendPromotionToAll = async (req, res) => {
  try {
    const { title, description, discountCode, imageUrl } = req.body;

    // Validar datos requeridos
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Título y descripción son requeridos",
      });
    }

    // Obtener todos los suscriptores activos
    const subscriptions = getAllSubscriptions();

    if (subscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay suscriptores en la base de datos",
      });
    }

    console.log(
      `📢 Enviando promoción "${title}" a ${subscriptions.length} suscriptores...`
    );

    let successCount = 0;
    let errorCount = 0;

    // Enviar a cada suscriptor
    for (const subscription of subscriptions) {
      try {
        await emailService.sendPromotionalEmail(subscription.email, {
          title,
          description,
          discountCode,
          imageUrl,
        });
        successCount++;
        console.log(`  ✅ Enviado a: ${subscription.email}`);

        // Pequeña pausa para no saturar el servidor de email
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        console.error(
          `  ❌ Error al enviar a ${subscription.email}:`,
          error.message
        );
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`  ✅ Enviados: ${successCount}`);
    console.log(`  ❌ Errores: ${errorCount}`);

    res.status(200).json({
      success: true,
      message: "Promoción enviada a todos los suscriptores",
      data: {
        totalSuscriptores: subscriptions.length,
        exitosos: successCount,
        fallidos: errorCount,
        title: title,
      },
    });
  } catch (error) {
    console.error("❌ Error al enviar promociones masivas:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar las promociones",
      error: error.message,
    });
  }
};
