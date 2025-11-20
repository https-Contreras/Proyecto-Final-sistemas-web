// 📁 Backend/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar JWT y proteger rutas
 */
function verifyToken(req, res, next) {
    // 1. Buscar el token en el header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Acceso denegado. Debes iniciar sesión para usar el carrito.' 
        });
    }
    
    try {
        // 2. Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Agregar la info del usuario al request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        
        // 4. Continuar con la siguiente función
        next();
        
    } catch (error) {
        console.error('Error verificando token:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
            });
        }
        
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido.' 
        });
    }
}

module.exports = { verifyToken };