const pool=require("../db/db");

async function findUserByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE correo = ?', [email]);  
    return rows; 
}

/**
 * Crea un nuevo usuario en la BD.
 */
async function createUser(nombre, email, passwordHash) {
    const [result] = await pool.execute(
        'INSERT INTO users (nombre, correo, contrasena) VALUES (?, ?, ?)',
        [nombre, email, passwordHash]
    );
    return result; 
}

async function updateUserFailedAttempts(userId, attempts, unlockTime = null) {
    if (unlockTime) {
        // Bloquea la cuenta con la fecha de desbloqueo
        await pool.execute(
            'UPDATE users SET intentosFallidos = ?, cuentaBloqueada = ? WHERE id = ?',
            [attempts, unlockTime, userId]
        );
    } else {
        // Solo actualiza los intentos
        await pool.execute(
            'UPDATE users SET intentosFallidos = ? WHERE id = ?',
            [attempts, userId]
        );
    }
}

async function resetUserLoginAttempts(userId) {
    await pool.execute(
        'UPDATE users SET intentosFallidos = 0, cuentaBloqueada = NULL WHERE id = ?',
        [userId]
    );
}


//funcion que guarda el reset token para cuando olvidan la contraseña
async function savePasswordResetToken(userId, token, expires) {
    try {
        await pool.execute(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [token, expires, userId]
        );
        console.log(`Token de reseteo guardado para el usuario: ${userId}`);
    } catch (error) {
        console.error("Error al guardar el token de reseteo en la BD:", error);
        // Es importante lanzar el error para que el controlador lo atrape
        throw error; 
    }
};

//funcion que busca el usuario por el token que se manda para actualizar contraseña

async function findUserByResetToken(token) {
    // NOW() es la hora actual de la BD.
    // Buscamos donde el token coincida Y la fecha de expiración sea MAYOR a ahora.
    const [rows] = await pool.execute(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
    );
    return rows;
}

//funcion que actualiza la nueva contraseña del usuario
async function updateUserPasswordAndClearToken(userId, newPasswordHash) {
    await pool.execute(
        'UPDATE users SET contrasena = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [newPasswordHash, userId]
    );
};


//Busca un usuario por ID (para verificar token/rol)
async function findUserById(id) {
    const [rows] = await pool.execute(
        'SELECT id, nombre, correo, rol FROM users WHERE id = ?',
        [id]
    );
    return rows[0];
}

module.exports = {
    findUserByEmail, 
    createUser, 
    updateUserFailedAttempts,
    resetUserLoginAttempts,
    savePasswordResetToken,
    findUserByResetToken,
    updateUserPasswordAndClearToken,
    findUserById
}