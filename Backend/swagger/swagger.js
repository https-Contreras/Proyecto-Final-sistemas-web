const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Configuración básica de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tech-Up API",
      version: "1.0.0",
      description:
        "Documentación técnica de la API de Tech-Up - Proyecto académico de Programación de Sistemas WEB",
      contact: {
        name: "Tech-Up Team",
        email: "info@tech-up.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
    tags: [
      {
        name: "Usuarios",
        description: "Gestión de usuarios y autenticación",
      },
      {
        name: "Productos",
        description: "Catálogo de productos",
      },
      {
        name: "Carrito",
        description: "Carrito de compras",
      },
      {
        name: "Pagos",
        description: "Procesamiento de pagos",
      },
      {
        name: "Suscripciones",
        description: "Newsletter y suscripciones",
      },
      {
        name: "Promociones",
        description: "Envío de promociones por email",
      },
      {
        name: "Contacto",
        description: "Formulario de contacto",
      },
      {
        name: "Admin",
        description: "Panel de administración",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT de autenticación",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error al procesar la solicitud",
            },
            error: {
              type: "string",
              example: "Detalles del error",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operación exitosa",
            },
          },
        },
      },
    },
  },
  // Rutas donde buscar comentarios de documentación
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
