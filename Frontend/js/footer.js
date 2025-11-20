// Función para inicializar el formulario de suscripción
function initSubscribeForm() {
  const subscribeForm = document.getElementById("subscribe-form");

  if (subscribeForm) {

    subscribeForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const emailInput = document.getElementById("sub-email");
      const submitBtn = subscribeForm.querySelector(".footer-subscribe-btn");
      const email = emailInput.value.trim();


      // Validación básica
      if (!email) {
        showMessage("Por favor ingresa tu correo electrónico", "error");
        return;
      }

      // Deshabilitar botón mientras se procesa
      submitBtn.disabled = true;
      submitBtn.innerHTML = "⏳";

      try {
        const response = await fetch(
          "http://localhost:3000/tech-up/subscriptions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          }
        );

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (data.success) {
          showMessage("¡Suscripción exitosa! Revisa tu correo 📧", "success");
          emailInput.value = ""; // Limpiar el campo
        } else {
          showMessage(data.message || "Error al suscribirse", "error");
        }
      } catch (error) {
        console.error("❌ Error:", error);
        showMessage("Error de conexión. Intenta de nuevo.", "error");
      } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = "→";
      }
    });
  } else {
    console.log("⚠️ Formulario de suscripción NO encontrado, reintentando...");
    // Reintentar después de 500ms (por si el footer se carga después)
    setTimeout(initSubscribeForm, 500);
  }
}

// Función para mostrar mensajes al usuario
function showMessage(message, type) {
  // Crear elemento de mensaje
  const messageDiv = document.createElement("div");
  messageDiv.className = `subscribe-message ${type}`;
  messageDiv.textContent = message;

  // Estilos inline para el mensaje
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ${
          type === "success"
            ? "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
            : "background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);"
        }
    `;

  document.body.appendChild(messageDiv);

  // Eliminar mensaje después de 5 segundos
  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        document.body.removeChild(messageDiv);
      }
    }, 300);
  }, 5000);
}

// Agregar animaciones CSS
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSubscribeForm);
} else {
  // El DOM ya está cargado, ejecutar inmediatamente
  initSubscribeForm();
}

console.log("🚀 footer.js cargado correctamente");
