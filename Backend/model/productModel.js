const pool = require('../db/db');

/**
 * Obtiene productos con filtros dinámicos (Categoría, Oferta y PRECIO)
 */
const getAllProducts = async (categoria, oferta, precio) => { // <-- Agregamos 'precio' aquí
    let query = 'SELECT * FROM productos';
    const params = [];
    const conditions = [];

    // 1. Filtro por Categoría
    if (categoria && categoria !== 'all') {
        conditions.push('categoria = ?');
        params.push(categoria);
    }

    // 2. Filtro por Oferta
    if (oferta !== undefined && oferta !== null) {
        const isOferta = (oferta === 'true' || oferta === '1') ? 1 : 0;
        conditions.push('en_oferta = ?');
        params.push(isOferta);
    }

    // 3. NUEVO: Filtro por Rango de Precios
    if (precio && precio !== 'all') {
        switch (precio) {
            case '0-10000':
                conditions.push('precio <= 10000');
                break;
            case '10001-30000':
                // Usamos BETWEEN para el rango medio
                conditions.push('precio BETWEEN 10001 AND 30000');
                break;
            case '30001+':
                conditions.push('precio > 30000');
                break;
            // Si mandan algo raro, simplemente no filtramos por precio
        }
    }

    // 4. Construir el WHERE
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    // 5. Ejecutar
    const [rows] = await pool.execute(query, params);
    return rows;
};
/*
 * Busca un producto por ID
 */
const getProductById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM productos WHERE id = ?',
        [id]
    );
    return rows[0]; // Retorna el primer resultado o undefined
};


/*
FUNCIONES PARA EL CRUD DEL ADMIN*/
const createProduct = async (data) => {
    const { product_id, nombre, descripcion, precio, stock, categoria, imagen, en_oferta } = data;
    
    // Convertimos el booleano a 1 o 0 para MySQL
    const ofertaBit = (en_oferta === true || en_oferta === 'true') ? 1 : 0;

    const [result] = await pool.execute(
        `INSERT INTO productos 
        (product_id, nombre, descripcion, precio, stock, categoria, imagen, en_oferta) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product_id, nombre, descripcion, precio, stock, categoria, imagen, ofertaBit]
    );
    return result;
};

/**
 * Actualiza un producto existente
 */
const updateProduct = async (id, data) => {
    const { nombre, descripcion, precio, stock, categoria, imagen, en_oferta } = data;
    
    const ofertaBit = (en_oferta === true || en_oferta === 'true') ? 1 : 0;

    const [result] = await pool.execute(
        `UPDATE productos 
         SET nombre=?, descripcion=?, precio=?, stock=?, categoria=?, imagen=?, en_oferta=?
         WHERE id=?`,
        [nombre, descripcion, precio, stock, categoria, imagen, ofertaBit, id]
    );
    return result;
};

const deleteProduct = async (id) => {
    const [result] = await pool.execute(
        'DELETE FROM productos WHERE id = ?',
        [id]
    );
    return result;
};

module.exports = {
    getAllProducts,
    getProductById, 
    createProduct,
    updateProduct,
    deleteProduct
};