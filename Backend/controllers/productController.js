const productModel = require('../model/productModel');


exports.getAllProducts = async (req, res) => {
  try {
    // 1. Extraemos 'precio' del query string
    const { categoria, oferta, precio } = req.query;


    // 2. Se lo pasamos al modelo (ahora recibe 3 argumentos)
    const products = await productModel.getAllProducts(categoria, oferta, precio);

    res.status(200).json({
      success: true,
      total: products.length,
      filters: {
        categoria: categoria || null,
        oferta: oferta || null,
        precio: precio || null // Devolvemos el filtro aplicado para confirmar
      },
      data: products,
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
 * Obtiene un producto específico por ID (Desde BD)
 * GET /tech-up/api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Llamamos al modelo (BD)
    const product = await productModel.getProductById(id);

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