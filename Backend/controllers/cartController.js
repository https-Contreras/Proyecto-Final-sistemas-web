// 📁 Backend/controllers/cartController.js

const db = require('../config/db.config');

// 🎫 CUPONES HARDCODEADOS (sin base de datos)
const CUPONES_VALIDOS = {
    'TECH10': {
        codigo: 'TECH10',
        tipo: 'porcentaje',
        valor: 10,
        descripcion: '10% de descuento'
    },
    'WELCOME50': {
        codigo: 'WELCOME50',
        tipo: 'fijo',
        valor: 50,
        descripcion: '$50 pesos de descuento'
    },
    'STUDENT15': {
        codigo: 'STUDENT15',
        tipo: 'porcentaje',
        valor: 15,
        descripcion: '15% de descuento para estudiantes'
    }
};

/**
 * GET /api/cart - Obtener el carrito del usuario
 * El carrito viene del localStorage del cliente, solo validamos productos
 */
exports.getCart = async (req, res) => {
    try {
        const { items } = req.body; // El frontend envía los items del localStorage
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.json({
                success: true,
                cart: {
                    items: [],
                    subtotal: 0,
                    descuento: 0,
                    total: 0
                }
            });
        }
        
        // Validar que los productos existen y tienen stock
        const productIds = items.map(item => item.product_id);
        const placeholders = productIds.map(() => '?').join(',');
        
        const [productos] = await db.query(
            `SELECT product_id, nombre, precio, stock, imagen, categoria 
             FROM productos 
             WHERE product_id IN (${placeholders})`,
            productIds
        );
        
        // Crear mapa de productos para acceso rápido
        const productosMap = {};
        productos.forEach(p => {
            productosMap[p.product_id] = p;
        });
        
        // Validar y calcular totales
        const itemsValidados = [];
        let subtotal = 0;
        
        for (const item of items) {
            const producto = productosMap[item.product_id];
            
            if (!producto) {
                console.warn(`Producto ${item.product_id} no encontrado en BD`);
                continue;
            }
            
            // Verificar stock disponible
            const cantidadFinal = Math.min(item.cantidad, producto.stock);
            
            if (cantidadFinal <= 0) {
                console.warn(`Producto ${item.product_id} sin stock`);
                continue;
            }
            
            const itemValidado = {
                product_id: producto.product_id,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen,
                categoria: producto.categoria,
                cantidad: cantidadFinal,
                stock_disponible: producto.stock,
                subtotal_item: parseFloat(producto.precio) * cantidadFinal
            };
            
            itemsValidados.push(itemValidado);
            subtotal += itemValidado.subtotal_item;
        }
        
        res.json({
            success: true,
            cart: {
                items: itemsValidados,
                subtotal: subtotal,
                descuento: 0,
                total: subtotal
            }
        });
        
    } catch (error) {
        console.error('Error en getCart:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el carrito'
        });
    }
};

/**
 * POST /api/cart/add - Agregar un producto al carrito
 */
exports.addToCart = async (req, res) => {
    try {
        const { product_id, cantidad = 1 } = req.body;
        
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'El product_id es requerido'
            });
        }
        
        if (cantidad < 1) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser mayor a 0'
            });
        }
        
        // Verificar que el producto existe y tiene stock
        const [productos] = await db.query(
            'SELECT product_id, nombre, precio, stock, imagen, categoria FROM productos WHERE product_id = ?',
            [product_id]
        );
        
        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const producto = productos[0];
        
        // Verificar stock disponible
        if (producto.stock < cantidad) {
            return res.status(400).json({
                success: false,
                message: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`
            });
        }
        
        if (producto.stock === 0) {
            return res.status(400).json({
                success: false,
                message: 'Producto agotado'
            });
        }
        
        // Retornar el producto validado para que el frontend lo agregue al localStorage
        res.json({
            success: true,
            message: 'Producto validado correctamente',
            producto: {
                product_id: producto.product_id,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio),
                imagen: producto.imagen,
                categoria: producto.categoria,
                cantidad: cantidad,
                stock_disponible: producto.stock
            }
        });
        
    } catch (error) {
        console.error('Error en addToCart:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar producto al carrito'
        });
    }
};

/**
 * PUT /api/cart/update - Actualizar cantidad de un producto
 */
exports.updateCartItem = async (req, res) => {
    try {
        const { product_id, cantidad } = req.body;
        
        if (!product_id || cantidad === undefined) {
            return res.status(400).json({
                success: false,
                message: 'El product_id y cantidad son requeridos'
            });
        }
        
        if (cantidad < 1) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser mayor a 0'
            });
        }
        
        // Verificar stock disponible
        const [productos] = await db.query(
            'SELECT stock FROM productos WHERE product_id = ?',
            [product_id]
        );
        
        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const producto = productos[0];
        
        if (producto.stock < cantidad) {
            return res.status(400).json({
                success: false,
                message: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`,
                stock_disponible: producto.stock
            });
        }
        
        res.json({
            success: true,
            message: 'Cantidad actualizada correctamente',
            nueva_cantidad: cantidad,
            stock_disponible: producto.stock
        });
        
    } catch (error) {
        console.error('Error en updateCartItem:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto'
        });
    }
};

/**
 * DELETE /api/cart/remove - Eliminar un producto del carrito
 */
exports.removeFromCart = (req, res) => {
    try {
        const { product_id } = req.body;
        
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'El product_id es requerido'
            });
        }
        
        // Como el carrito está en localStorage, solo confirmamos la operación
        res.json({
            success: true,
            message: 'Producto eliminado del carrito'
        });
        
    } catch (error) {
        console.error('Error en removeFromCart:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto'
        });
    }
};

/**
 * POST /api/cart/apply-coupon - Aplicar cupón de descuento
 */
exports.applyCoupon = (req, res) => {
    try {
        const { codigo_cupon, subtotal } = req.body;
        
        if (!codigo_cupon) {
            return res.status(400).json({
                success: false,
                message: 'Debes ingresar un cupón'
            });
        }
        
        if (!subtotal || subtotal <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El carrito está vacío'
            });
        }
        
        // Buscar el cupón (case-insensitive)
        const codigoUpper = codigo_cupon.toUpperCase().trim();
        const cupon = CUPONES_VALIDOS[codigoUpper];
        
        if (!cupon) {
            return res.status(404).json({
                success: false,
                message: 'Cupón no válido'
            });
        }
        
        // Calcular el descuento
        let descuento = 0;
        
        if (cupon.tipo === 'porcentaje') {
            descuento = (subtotal * cupon.valor) / 100;
        } else if (cupon.tipo === 'fijo') {
            descuento = cupon.valor;
        }
        
        // El descuento no puede ser mayor al subtotal
        descuento = Math.min(descuento, subtotal);
        
        const total = subtotal - descuento;
        
        res.json({
            success: true,
            message: `¡Cupón ${cupon.codigo} aplicado!`,
            cupon: {
                codigo: cupon.codigo,
                descripcion: cupon.descripcion,
                tipo: cupon.tipo,
                valor: cupon.valor
            },
            descuento: descuento,
            nuevo_total: total
        });
        
    } catch (error) {
        console.error('Error en applyCoupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aplicar el cupón'
        });
    }
};