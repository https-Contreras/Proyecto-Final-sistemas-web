// 📁 Backend/controllers/productController.js

const db = require('../config/db.config');

/**
 * GET /api/productos - Obtener todos los productos con filtros opcionales
 */
exports.getAllProducts = async (req, res) => {
    try {
        const { categoria, oferta } = req.query;
        
        let query = 'SELECT * FROM productos WHERE 1=1';
        const params = [];
        
        // Filtro por categoría
        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }
        
        // Filtro por productos en oferta
        if (oferta === '1' || oferta === 'true') {
            query += ' AND en_oferta = 1';
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [productos] = await db.query(query, params);
        
        res.json({
            success: true,
            productos: productos,
            total: productos.length
        });
        
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos'
        });
    }
};

/**
 * GET /api/productos/:id - Obtener un producto específico
 */
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [productos] = await db.query(
            'SELECT * FROM productos WHERE product_id = ?',
            [id]
        );
        
        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            producto: productos[0]
        });
        
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto'
        });
    }
};