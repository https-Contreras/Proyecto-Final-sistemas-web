const categories = require("../data/categories");

/**
 * Obtiene todas las categorías
 * GET /tech-up/api/categories
 */
exports.getAllCategories = (req, res) => {
  try {
    console.log(`📂 Categorías solicitadas - Total: ${categories.length}`);

    res.status(200).json({
      success: true,
      total: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las categorías",
      error: error.message,
    });
  }
};
