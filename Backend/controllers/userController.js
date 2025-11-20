const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbModel = require("../model/dbModel")
const mailer = require("../config/mailer");


exports.register = async (req, res) => {
    try {
        // 1. Obtenemos los datos del frontend
        const { nombre, email, password } = req.body;

        // 2. Validamos que los datos vengan
        if (!nombre || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // 3. Revisamos si el email ya existe en la BD
        const existingUser = await dbModel.findUserByEmail(email);

        if (existingUser.length > 0) {
            return res.status(409).json({ message: "El correo electrónico ya está registrado" });
        }

        // 4. Encriptamos la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptado = await bcrypt.hash(password, salt);

        // 5. Insertamos el nuevo usuario en la BD
        await dbModel.createUser(nombre, email, passwordEncriptado);

        // 6. Enviamos respuesta de éxito
        res.status(201).json({
            message: "¡Usuario registrado con éxito!"
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son obligatorios" });
        }

        // 1. Busca al usuario
        const user = await dbModel.findUserByEmail(email);
        const usuarioEncontrado = user[0];

        if (!usuarioEncontrado) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // 2. LÓGICA DE BLOQUEO DE 5 MINUTOS 
        // Revisa si el campo de bloqueo (TIMESTAMP) es una fecha futura
        if (usuarioEncontrado.cuentaBloqueada && new Date(usuarioEncontrado.cuentaBloqueada) > new Date()) {
            
            // Si la hora de bloqueo es mayor a la hora actual, rechaza
            return res.status(403).json({ message: "Cuenta bloqueada temporalmente. Intenta más tarde." });
        }

        // 3. Compara la contraseña
        const esPasswordCorrecto = await bcrypt.compare(password, usuarioEncontrado.contrasena);

        if (!esPasswordCorrecto) {
            // 4. Lógica de intentos fallidos
            const intentos = (usuarioEncontrado.intentosFallidos || 0) + 1;
            let unlockTime = null;

            if (intentos >= 3) {
                // Genera la fecha de desbloqueo: AHORA + 5 minutos
                unlockTime = new Date(Date.now() + 5 * 60 * 1000); 
            }
            
            // Llama al modelo para actualizar los intentos y (quizás) la fecha de bloqueo
            await dbModel.updateUserFailedAttempts(usuarioEncontrado.id, intentos, unlockTime);
            
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // 5. Si el login es exitoso, resetea los intentos
        await dbModel.resetUserLoginAttempts(usuarioEncontrado.id);

        // 6. Creamos el Token (JWT)
        const payload = {
            userId: usuarioEncontrado.id,
            email: usuarioEncontrado.correo,
            rol: usuarioEncontrado.rol
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // 7. Enviamos la respuesta
        res.status(200).json({
            message: "¡Login exitoso!",
            token: token,
            user: {
                nombre: usuarioEncontrado.nombre,
                email: usuarioEncontrado.correo
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Buscamos al usuario
        const userRows = await dbModel.findUserByEmail(email);
        const usuario = userRows[0];

        
        if (usuario) {
            // 3. Si existe, creamos un token de reseteo de 15 minutos
            const payload = { userId: usuario.id, email: usuario.correo };
            const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
            
            const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

            // 4. Guardamos el token en la BD
            await dbModel.savePasswordResetToken(usuario.id, resetToken, expires);

            // 5. Creamos el enlace (apuntando a tu frontend)
            const resetLink = `http://127.0.0.1:5500/Frontend/reset-password.html?token=${resetToken}`;

            // 6. Creamos el cuerpo del correo
            const htmlBody = `
                <h1>Recuperación de Contraseña - Tech-Up</h1>
                <p>Hola ${usuario.nombre},</p>
                <p>Recibimos una solicitud para reestablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <a href="${resetLink}" style="padding: 10px 20px; background-color: #00e5ff; color: #0a0f18; text-decoration: none; border-radius: 5px;">
                    Reestablecer Contraseña
                </a>
                <p>Si tú no solicitaste esto, ignora este correo. El enlace expira en 15 minutos.</p>
            `;

            // 7. Enviamos el correo
            await mailer.sendEmail(email, "Reestablece tu contraseña de Tech-Up", htmlBody);
        }

        // 8. Damos la respuesta genérica al frontend
        res.status(200).json({
            message: "Si tu correo está registrado, recibirás un enlace para reestablecer tu contraseña."
        });

    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

//reset-password:
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Datos incompletos." });
        }

        // 1. Buscar usuario por token válido
        const userRows = await dbModel.findUserByResetToken(token);
        const usuario = userRows[0];

        if (!usuario) {
            // Si no encuentra nada, el token es inválido o ya expiró
            return res.status(400).json({ message: "El enlace es inválido o ha expirado." });
        }

        // 2. Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // 3. Guardar cambios y borrar token
        await dbModel.updateUserPasswordAndClearToken(usuario.id, passwordHash);

        res.status(200).json({ message: "Contraseña actualizada con éxito." });

    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

//para verificar rol de usuario admin
exports.verifyUser = async (req, res) => {
    try {
        // 1. Obtener el token del header "Authorization"
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ message: "No autorizado" });
        }

        // 2. Verificar el Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Consultar la BD para obtener el rol REAL y ACTUALIZADO
        // (No confiamos solo en el token, vamos a la fuente de verdad)
        const usuario = await dbModel.findUserById(decoded.userId);

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 4. Devolver datos seguros (sin password)
        res.status(200).json({
            success: true,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol // <--- AQUÍ VA EL ROL REAL
            }
        });

    } catch (error) {
        console.error("Error verificando token:", error);
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
};

//para formulario de contacto
exports.contact = async(req,res)=>{
    try {
        const { nombre, email, asunto, mensaje } = req.body;
        
        // ✅ Si llegaste aquí, el CAPTCHA es válido
        
        console.log('✅ Mensaje de contacto recibido con CAPTCHA válido:', { 
            nombre, 
            email, 
            asunto,
            mensaje
        });
        
        // Por ahora simulamos el envío exitoso
        res.json({
            success: true,
            message: 'Mensaje enviado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje'
        });
    }
};