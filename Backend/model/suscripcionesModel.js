
const pool = require('../db/db'); 

/**
 * Agrega una nueva suscripción a la BD
 * @param {string} email 
 */
const addSubscription = async (email) => {
    // Insertamos. 'activo' y 'fecha_suscripcion' se ponen solos por defecto en la BD
    const [result] = await pool.execute(
        'INSERT INTO subscriptions (email) VALUES (?)',
        [email]
    );
    return result;
};

/**
 * Verifica si un email ya está suscrito
 * @param {string} email 
 * @returns {boolean} true si existe, false si no
 */
const isSubscribed = async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM subscriptions WHERE email = ?',
        [email]
    );
    
    // Si rows tiene algo (length > 0), es que ya existe
    return rows.length > 0;
};

/**
 * Obtiene todas las suscripciones activas (Útil para panel de admin o newsletters)
 */
const getAllSubscriptions = async () => {
    const [rows] = await pool.execute(
        'SELECT * FROM subscriptions WHERE activo = 1'
    );
    return rows;
};

/**
 * Obtiene el total de suscriptores (Para tus gráficas del dashboard)
 */
const getTotalSubscriptions = async () => {
    const [rows] = await pool.execute(
        'SELECT COUNT(*) as total FROM subscriptions WHERE activo = 1'
    );
    // rows[0] será algo como { total: 5 }
    return rows[0].total;
};

// Exportamos las funciones
module.exports = {
    addSubscription,
    isSubscribed,
    getAllSubscriptions,
    getTotalSubscriptions
};