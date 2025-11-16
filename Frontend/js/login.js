document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    if (!loginForm) return; 

    loginForm.addEventListener('submit', async (event) => {
        // 1. Evita que la página se recargue
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageElement = document.getElementById('login-message');
        const submitBtn = loginForm.querySelector('.submit-btn');

        messageElement.textContent = ''; 
        submitBtn.textContent = 'Verificando...';
        submitBtn.disabled = true;

        try {
            // 2. Llama a tu API de backend
            const response = await fetch('http://localhost:3000/tech-up/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            // 3. Esperamos la respuesta JSON del backend
            const data = await response.json();

            // 4. Imprime la respuesta COMPLETA del servidor en la consola
            console.log("Respuesta del servidor:", data);

            // 5. Reaccionamos según la respuesta
            if (response.ok) {
                
                // ¡ÉXITO! Solo muestra una alerta
                alert('¡Login exitoso! (Respuesta de prueba del backend)');
                
                // Muestra el mensaje de éxito
                messageElement.textContent = '¡Login exitoso!';
                messageElement.style.color = 'var(--color-primary)';
                
                // (Ya no intentamos guardar en localStorage ni redirigir)
                submitBtn.textContent = 'Entrar';
                submitBtn.disabled = false;
                
            } else {
                // ¡ERROR! (Ej. contraseña incorrecta)
                messageElement.textContent = data.message || 'Error en tus credenciales';
                submitBtn.textContent = 'Entrar';
                submitBtn.disabled = false;
            }

        } catch (error) {
            // ¡ERROR DE RED!
            console.error('Error de fetch:', error);
            messageElement.textContent = 'No se pudo conectar al servidor. Intenta más tarde.';
            submitBtn.textContent = 'Entrar';
            submitBtn.disabled = false;
        }
    });
});