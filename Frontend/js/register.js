document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('register-form');
    if (!registerForm) return; // No hacer nada si no estamos en esta página

    registerForm.addEventListener('submit', async (event) => {
        // 1. Evita que la página se recargue
        event.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        
        const messageElement = document.getElementById('register-message');
        const submitBtn = registerForm.querySelector('.submit-btn');

        // --- INICIO DE VALIDACIÓN EN CLIENTE  ---
        
        // 2. Limpia errores previos
        messageElement.textContent = '';

        // 3. Revisa que las contraseñas coincidan
        if (password !== passwordConfirm) {
            messageElement.textContent = 'Las contraseñas no coinciden. Inténtalo de nuevo.';
            messageElement.style.color = '#ff4d4d'; // Rojo para error
            return; // Detiene la ejecución
        }

        if (password.length < 8) {
             messageElement.textContent = 'Tu contraseña debe tener al menos 8 caracteres.';
             messageElement.style.color = '#ff4d4d';
             return;
        }
        // --- FIN DE VALIDACIÓN EN CLIENTE ---

        submitBtn.textContent = 'Creando...';
        submitBtn.disabled = true;

        // 4. Prepara los datos para el backend
        const formData = {
            nombre: nombre,
            email: email,
            password: password
        };
        
        // (Por ahora solo lo mostramos en consola)
        console.log("Datos listos para enviar al backend:", formData);

        // --- SIMULACIÓN DE ÉXITO ---
        // (Aquí irá tu 'fetch' al API de /api/auth/register)
        setTimeout(() => {
            messageElement.textContent = '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.';
            messageElement.style.color = 'var(--color-primary)'; // Verde/Neón para éxito
            
            submitBtn.textContent = 'Crear Cuenta';
            submitBtn.disabled = false;
            registerForm.reset(); // Limpia el formulario
        }, 1500);

    });
});