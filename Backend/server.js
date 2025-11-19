const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importar rutas
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();
const ALLOWED_ORIGINS = ["http://localhost:5500", "http://127.0.0.1:5500"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get("/tech-up/test", (req, res) => {
  res.json({
    message: "¡Bienvenido a la API de Tech-Up!",
    success: true,
    endpoints: {
      users: "/tech-up/users",
      products: "/tech-up/api/products",
      categories: "/tech-up/api/categories",
    },
  });
});

// Registrar rutas
app.use("/tech-up/users", userRoutes);
app.use("/tech-up/api/products", productRoutes);
app.use("/tech-up/api/categories", categoryRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(
    `📦 API Productos: http://localhost:${PORT}/tech-up/api/products`
  );
  console.log(
    `📂 API Categorías: http://localhost:${PORT}/tech-up/api/categories`
  );
});
