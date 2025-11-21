const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Valida que la petición tenga un Token válido
 */
const verifyToken = (req, res, next) => {
    try {
        // 1. Buscar el header "Authorization"
        const authHeader = req.headers['authorization'];
        
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Acceso denegado. No se proporcionó un token." 
            });
        }

        // 2. Verificar el token con la llave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Guardar los datos del usuario en la petición (req) para usarlos después
        req.user = decoded; 
        
        next(); // Continuar a la siguiente función

    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: "Token inválido o expirado." 
        });
    }
};

/**
 * Valida que el usuario sea Administrador
 * (Debe usarse DESPUÉS de verifyToken)
 */
const verifyAdmin = (req, res, next) => {
    // req.user viene del middleware anterior
    if (req.user && req.user.rol === 'admin') {
        next(); // Es admin, pásale
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Acceso denegado. Se requieren permisos de Administrador." 
        });
    }
};

module.exports = { verifyToken, verifyAdmin };