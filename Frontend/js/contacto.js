document.addEventListener('DOMContentLoaded', () => {

    const contactForm = document.getElementById('contact-form');
    
    // Si el formulario no existe en esta página, no hagas nada.
    if (!contactForm) return;

    contactForm.addEventListener('submit', (event) => {
        // 1. Evita que el formulario se envíe de la forma tradicional
        event.preventDefault();

        // 2. (Opcional) Muestra un 'Cargando...'
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // 3. Captura los datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            asunto: document.getElementById('asunto').value,
            mensaje: document.getElementById('mensaje').value,
        };

        // 4. Muestra los datos en la consola (AQUÍ IRÁ TU 'FETCH' AL BACKEND)
        console.log("Datos del formulario capturados:", formData);

        // 5. Simula una respuesta del backend (borra esto cuando tengas el backend)
        setTimeout(() => {
          // 6. Da retroalimentación al usuario (Requisito del proyecto [cite: 81])
            const msgElement = document.getElementById('form-message');
            msgElement.textContent = "¡Mensaje enviado! En breve te responderemos.";
            msgElement.style.color = "var(--color-primary)";
            
            submitBtn.textContent = 'Enviar Mensaje';
            submitBtn.disabled = false;
            contactForm.reset(); // Limpia el formulario
        }, 1500);
    });
});