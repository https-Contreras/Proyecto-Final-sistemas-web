
exports.login = (req, res) => {
    console.log("Entro a login");
    res.status(200).json({ 
        message: "Respuesta de prueba desde el controlador" 
    });
};
