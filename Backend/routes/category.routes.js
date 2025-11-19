const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// GET /tech-up/api/categories - Obtiene todas las categorías
router.get("/", categoryController.getAllCategories);

module.exports = router;
