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

module.exports = {
    getAllProducts,
    getProductById
};