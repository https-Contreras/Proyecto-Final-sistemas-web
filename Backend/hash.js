const bcrypt = require('bcryptjs');

// Escribe aquí la contraseña que SÍ te sabes
const miPasswordPlano = 'raul1234'; 

// Esta función la encripta
async function generarHash() {
    console.log("Generando hash para:", miPasswordPlano);
    
    // 1. Genera el "salt" (complejidad)
    const salt = await bcrypt.genSalt(10);
    
    // 2. Crea el hash
    const hash = await bcrypt.hash(miPasswordPlano, salt);

    // 3. Imprime el hash en la consola
    console.log("¡Copia esta línea de abajo!");
    console.log(hash);
}

generarHash();