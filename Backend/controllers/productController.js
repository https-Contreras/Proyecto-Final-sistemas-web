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

/**
 * POST /tech-up/api/products (o /admin/products)
 * Crea un producto
 */
exports.createProduct = async (req, res) => {
    try {
        // Validación básica
        const { product_id, nombre, precio, stock } = req.body;
        if (!product_id || !nombre || !precio || stock === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "Faltan campos obligatorios (product_id, nombre, precio, stock)" 
            });
        }

        const result = await productModel.createProduct(req.body);

        res.status(201).json({
            success: true,
            message: "Producto creado con éxito",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ success: false, message: "Error al crear producto", error: error.message });
    }
};


/**
 * PUT /tech-up/api/products/:id
 * Actualiza un producto
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // El ID numérico de la BD
        
        // Verificar si existe antes de actualizar (opcional pero recomendado)
        const producto = await productModel.getProductById(id);
        if (!producto) {
            return res.status(404).json({ success: false, message: "Producto no encontrado" });
        }

        await productModel.updateProduct(id, req.body);

        res.status(200).json({
            success: true,
            message: "Producto actualizado correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ success: false, message: "Error al actualizar", error: error.message });
    }
};

/**
 * DELETE /tech-up/api/products/:id
 * Elimina un producto
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await productModel.deleteProduct(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Producto no encontrado para eliminar" });
        }

        res.status(200).json({
            success: true,
            message: "Producto eliminado con éxito"
        });

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ success: false, message: "Error al eliminar", error: error.message });
    }
};