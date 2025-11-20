document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = contactForm.querySelector('.submit-btn');
        
        // ✅ VALIDAR CAPTCHA CON ALERTA
        const captchaResponse = grecaptcha.getResponse();
        
        if (!captchaResponse) {
            Swal.fire({
                title: '¡Atención!',
                text: 'Por favor, completa el CAPTCHA para continuar.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#667eea', // Tu color primario
                background: '#1a202c', // Fondo oscuro estilo Tech-Up
                color: '#fff'
            });
            return;
        }

        // UI: Estado de carga
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            asunto: document.getElementById('asunto').value,
            mensaje: document.getElementById('mensaje').value,
            captchaToken: captchaResponse
        };

        try {
            const response = await fetch('http://localhost:3000/tech-up/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ ÉXITO
                Swal.fire({
                    title: '¡Mensaje Enviado!',
                    text: 'Hemos recibido tu mensaje correctamente. Te contactaremos pronto.',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false,
                    background: '#1a202c',
                    color: '#fff'
                });

                contactForm.reset();
                grecaptcha.reset(); // Importante: resetear captcha para nuevo envío
            } else {
                // ❌ ERROR DEL SERVIDOR
                throw new Error(data.message || "Error al enviar el mensaje");
            }

        } catch (error) {
            // ❌ ERROR DE CONEXIÓN O CATCH
            console.error(error);
            Swal.fire({
                title: '¡Error!',
                text: error.message || 'Hubo un problema de conexión. Inténtalo más tarde.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#ff4d4d',
                background: '#1a202c',
                color: '#fff'
            });
            
            grecaptcha.reset();
        } finally {
            // Restaurar el botón pase lo que pase
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});