const products = require("../data/products");

/**
 * Obtiene todos los productos con filtros opcionales
 * GET /tech-up/api/products
 * Query params: ?categoria=laptops&oferta=true
 */
exports.getAllProducts = (req, res) => {
  try {
    const { categoria, oferta } = req.query;

    let filteredProducts = [...products];

    // Filtrar por categoría si se proporciona
    if (categoria) {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }

    // Filtrar por oferta si se proporciona
    if (oferta !== undefined) {
      const isOferta = oferta === "true" || oferta === "1";
      filteredProducts = filteredProducts.filter(
        (product) => product.oferta === isOferta
      );
    }

    console.log(
      `📦 Productos solicitados - Categoria: ${categoria || "todas"}, Oferta: ${
        oferta || "cualquiera"
      } - Total: ${filteredProducts.length}`
    );

    res.status(200).json({
      success: true,
      total: filteredProducts.length,
      filters: {
        categoria: categoria || null,
        oferta: oferta || null,
      },
      data: filteredProducts,
    });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los productos",
      error: error.message,
    });
  }
};

/**
 * Obtiene un producto específico por ID
 * GET /tech-up/api/products/:id
 */
exports.getProductById = (req, res) => {
  try {
    const { id } = req.params;

    // Buscar producto por ID
    const product = products.find((p) => p.id === parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Producto con ID ${id} no encontrado`,
      });
    }

    console.log(`📦 Producto solicitado: ${product.nombre}`);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el producto",
      error: error.message,
    });
  }
};
