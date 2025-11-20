// 📁 Backend/controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');
require('dotenv').config();

/**
 * LOGIN - Iniciar sesión
 */
exports.login = async (req, res) => {
    console.log("Entró a login");
    console.log("Datos recibidos:", req.body);
    
    // Si llegó aquí, el CAPTCHA ya fue validado por el middleware ✅
    
    const { email, password } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email y contraseña son requeridos'
        });
    }
    
    try {
        // 1. Buscar usuario por email
        const [usuarios] = await db.query(
            'SELECT id, nombre, correo, contrasena, rol, intentosFallidos, cuentaBloqueada FROM users WHERE correo = ?',
            [email]
        );
        
        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }
        
        const usuario = usuarios[0];
        
        // 2. Verificar si la cuenta está bloqueada (opcional - puedes implementar la lógica)
        // Por ahora solo verificamos que exista el campo
        
        // 3. Comparar contraseñas
        const passwordMatch = await bcrypt.compare(password, usuario.contrasena);
        
        if (!passwordMatch) {
            // Podrías incrementar intentosFallidos aquí
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }
        
        // 4. Resetear intentos fallidos si los hay
        await db.query(
            'UPDATE users SET intentosFallidos = 0 WHERE id = ?',
            [usuario.id]
        );
        
        // 5. Generar JWT Token
        const token = jwt.sign(
            { 
                userId: usuario.id,
                email: usuario.correo,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        // 6. Responder con éxito
        res.json({
            success: true,
            message: 'Login exitoso',
            token: token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.correo,
                rol: usuario.rol
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

/**
 * REGISTER - Crear nueva cuenta
 */
exports.register = async (req, res) => {
    console.log("Entró a register");
    console.log("Datos recibidos:", req.body);
    
    // El CAPTCHA ya fue validado ✅
    
    const { nombre, email, password } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }
    
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 8 caracteres'
        });
    }
    
    try {
        // 1. Verificar si el email ya existe
        const [usuariosExistentes] = await db.query(
            'SELECT id FROM users WHERE correo = ?',
            [email]
        );
        
        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Este correo ya está registrado'
            });
        }
        
        // 2. Hash de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 3. Insertar nuevo usuario
        const [resultado] = await db.query(
            'INSERT INTO users (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, 'usuario']
        );
        
        const nuevoUserId = resultado.insertId;
        
        // 4. Generar JWT Token automáticamente
        const token = jwt.sign(
            { 
                userId: nuevoUserId,
                email: email,
                rol: 'usuario'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        // 5. Responder con éxito
        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            token: token,
            user: {
                id: nuevoUserId,
                nombre: nombre,
                email: email,
                rol: 'usuario'
            }
        });
        
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la cuenta'
        });
    }
};