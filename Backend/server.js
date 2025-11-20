// 📁 Backend/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 📦 Importar todas las rutas
const userRoutes = require("./routes/user.routes");
const paymentRoutes = require("./routes/payment.routes");
const contactRoutes = require("./routes/contact.routes");
const cartRoutes = require("./routes/cart.routes"); // ⭐ NUEVO
const productRoutes = require("./routes/product.routes"); // ⭐ NUEVO

const app = express();
const ALLOWED_ORIGINS = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
];

app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS: ' + origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// ========================================
// 🛣️ RUTAS DE LA API
// ========================================

// Ruta de prueba
app.get('/tech-up/test', (req, res) => {
    res.json({
        message: '¡Bienvenido a la API de Tech-Up!',
        success: true
    });
});

// 👤 Rutas de usuarios (login, register) - CON CAPTCHA
app.use("/tech-up/users", userRoutes);

// 🛒 Rutas del carrito - CON AUTENTICACIÓN JWT (⭐ NUEVO)
app.use("/tech-up/api", cartRoutes);

// 📦 Rutas de productos - PÚBLICAS (⭐ NUEVO)
app.use("/tech-up/api", productRoutes);

// 💳 Rutas de pagos - CON CAPTCHA
app.use("/tech-up", paymentRoutes);

// 📧 Rutas de contacto - CON CAPTCHA
app.use("/tech-up", contactRoutes);

// 🖼️ Servir imágenes estáticas (sin protección CAPTCHA)
app.use('/images', express.static('public/images'));

// ========================================
// 🚀 INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🚀 Servidor Tech-Up corriendo       ║
║   📍 http://localhost:${PORT}           ║
║   🔐 Protección CAPTCHA: ACTIVADA     ║
║   🛒 APIs del Carrito: ACTIVADAS      ║
╚═══════════════════════════════════════╝
    `);
    console.log('📋 Rutas protegidas con CAPTCHA:');
    console.log('   ✅ POST /tech-up/users/login');
    console.log('   ✅ POST /tech-up/users/register');
    console.log('   ✅ POST /tech-up/procesar-pago');
    console.log('   ✅ POST /tech-up/contact');
    console.log('');
    console.log('📦 Rutas de Productos (públicas):');
    console.log('   ✅ GET /tech-up/api/productos');
    console.log('   ✅ GET /tech-up/api/productos/:id');
    console.log('');
    console.log('🛒 Rutas del Carrito (requieren JWT):');
    console.log('   ✅ POST /tech-up/api/cart');
    console.log('   ✅ POST /tech-up/api/cart/add');
    console.log('   ✅ PUT /tech-up/api/cart/update');
    console.log('   ✅ DELETE /tech-up/api/cart/remove');
    console.log('   ✅ POST /tech-up/api/cart/apply-coupon');
    console.log('');
    console.log('💡 Cupones disponibles:');
    console.log('   🎫 TECH10 (10% descuento)');
    console.log('   🎫 WELCOME50 ($50 pesos)');
    console.log('   🎫 STUDENT15 (15% descuento)');
});