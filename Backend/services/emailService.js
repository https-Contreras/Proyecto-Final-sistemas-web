const nodemailer = require("nodemailer");

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar la configuración del transportador
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Error en la configuración de email:", error);
  } else {
    console.log("✅ Servidor de email listo para enviar mensajes");
  }
});

/**
 * Envía un correo de bienvenida al usuario que se suscribe
 */
const sendWelcomeEmail = async (toEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "🎉 ¡Bienvenido a Tech-Up Elite!",
    html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 ¡Bienvenido a Tech-Up!</h1>
                    </div>
                    <div class="content">
                        <h2>¡Gracias por unirte a la élite tecnológica!</h2>
                        <p>Estamos emocionados de tenerte con nosotros. A partir de ahora recibirás:</p>
                        <ul>
                            <li>✨ Ofertas exclusivas</li>
                            <li>🎁 Cupones de descuento</li>
                            <li>🔥 Acceso anticipado a nuevos productos</li>
                            <li>📰 Noticias sobre tecnología</li>
                        </ul>
                        <p>Como agradecimiento, aquí está tu cupón de bienvenida:</p>
                        <div style="background: #fff; padding: 20px; text-align: center; border: 2px dashed #667eea; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #667eea; margin: 0;">WELCOME10</h3>
                            <p style="margin: 5px 0;">10% de descuento en tu primera compra</p>
                        </div>
                        <center>
                            <a href="http://localhost:5500/index.html" class="button">Explorar Productos</a>
                        </center>
                        <p>¡Prepárate para la mejor experiencia tecnológica!</p>
                    </div>
                    <div class="footer">
                        <p>Tech-Up - Proyecto académico de Programación de Sistemas WEB</p>
                        <p>Si no solicitaste esta suscripción, puedes ignorar este correo.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo de bienvenida enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar correo de bienvenida:", error);
    throw error;
  }
};

/**
 * Envía una notificación al admin cuando alguien se suscribe
 */
const sendAdminNotification = async (subscriberEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: "🔔 Nueva suscripción en Tech-Up",
    html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                    .content { background: #ecf0f1; padding: 20px; border-radius: 0 0 5px 5px; }
                    .info-box { background: white; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📧 Nueva Suscripción</h2>
                    </div>
                    <div class="content">
                        <p>¡Tienes un nuevo suscriptor en Tech-Up!</p>
                        <div class="info-box">
                            <p><strong>Email:</strong> ${subscriberEmail}</p>
                            <p><strong>Fecha:</strong> ${new Date().toLocaleString(
                              "es-MX",
                              { timeZone: "America/Mexico_City" }
                            )}</p>
                        </div>
                        <p>El usuario ha recibido su correo de bienvenida con el cupón WELCOME10.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Notificación de admin enviada:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar notificación de admin:", error);
    throw error;
  }
};

/**
 * Envía un correo de oferta/promoción a un suscriptor
 */
const sendPromotionalEmail = async (toEmail, offerDetails) => {
  const { title, description, discountCode, imageUrl } = offerDetails;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `🎁 ${title} - Tech-Up`,
    html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
                    .offer-image { width: 100%; max-width: 500px; height: auto; border-radius: 10px; margin: 20px 0; }
                    .discount-code { background: #f093fb; color: white; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; margin: 20px 0; }
                    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔥 ${title}</h1>
                    </div>
                    <div class="content">
                        ${
                          imageUrl
                            ? `<img src="${imageUrl}" alt="Oferta" class="offer-image" />`
                            : ""
                        }
                        <p>${description}</p>
                        ${
                          discountCode
                            ? `
                        <div class="discount-code">
                            ${discountCode}
                        </div>
                        <p style="text-align: center;">Usa este código al finalizar tu compra</p>
                        `
                            : ""
                        }
                        <center>
                            <a href="http://localhost:5500/index.html" class="button">Ver Productos</a>
                        </center>
                        <p style="color: #777; font-size: 12px; margin-top: 30px;">Esta oferta es exclusiva para suscriptores de Tech-Up Elite.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo promocional enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar correo promocional:", error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendAdminNotification,
  sendPromotionalEmail,
};
