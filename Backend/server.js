const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Rutas para usuarios
const userRoutes = require("./routes/user.routes");

// Rutas para órdenes y generales (tu parte)
const ordersRoutes = require("./routes/orders.routes");
const generalRoutes = require("./routes/general.routes");

const app = express();
const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true); // null = sin error, true = permitido
    }
    // Si el origen no está permitido, se rechaza la solicitud con un mensaje de error.
    return callback(new Error('Not allowed by CORS: ' + origin));
  },

  // Especifica los métodos HTTP que este servidor aceptará.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],

  // Algunos navegadores antiguos esperan un código 200 (en lugar de 204) en respuestas "preflight".
  optionsSuccessStatus: 200
}));

// Permite peticiones de otros orígenes (tu frontend)
app.use(express.json()); // Permite al servidor entender JSON que viene del cliente 
app.use(express.urlencoded({ extended: true })); // Permite entender formularios

const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get('/tech-up/test', (req, res) => {
  // El servidor SIEMPRE responde con JSON 
  res.json({
    message: '¡Bienvenido a la API de Tech-Up!',
    success: true
  });
});

// Rutas de la API
app.use("/tech-up/users", userRoutes);   // login
app.use("/api/orders", ordersRoutes);    // órdenes y pago
app.use("/api/general", generalRoutes);  // contacto y suscripción

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
