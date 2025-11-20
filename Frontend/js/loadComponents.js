/**
 * Carga un componente HTML (header/footer) en un elemento del DOM.
 */
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error al cargar ${url}: ${response.statusText}`);
        }

        const html = await response.text();

        // 2. Manipulamos el DOM (requisito del proyecto)
        const element = document.getElementById(elementId);
        
        if (element) {
            element.innerHTML = html;
            console.log(`✅ Componente cargado: ${url}`);
        } else {
            console.warn(`No se encontró el elemento con ID: ${elementId}`);
        }

    } catch (error) {
        console.error(`No se pudo cargar el componente: ${error}`);
    }
}

/**
 * Revisa si hay un usuario logueado en localStorage
 * y actualiza el header.
 */
// ... (la función loadComponent se queda igual) ...
/**
 * Revisa si hay un usuario logueado VERIFICANDO con el Backend
 */
async function checkLoginStatus() {
    // 1. Solo necesitamos el token del storage
    const token = localStorage.getItem('userToken');

    if (!token) return; // Si no hay token, es un invitado

    try {
        // 2. Preguntamos al Backend: "¿Quién es este usuario?"
        const response = await fetch('http://localhost:3000/tech-up/users/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Enviamos el token
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // --- SESIÓN VÁLIDA ---
            const user = data.user;
            
            // Actualizamos nombre en storage por si cambió, pero NO el rol (ese se usa en memoria)
            localStorage.setItem('userName', user.nombre);

            // Actualizamos la UI
            actualizarHeaderUI(user);

        } else {
            // --- TOKEN INVÁLIDO O EXPIRADO ---
            console.warn("Token expirado o inválido. Cerrando sesión.");
            logoutAutomatico();
        }

    } catch (error) {
        console.error("Error verificando sesión:", error);
        // Opcional: si el server está caído, ¿qué hacemos? 
        // Por seguridad, podríamos no mostrar nada de usuario.
    }
}

/*
 * Función auxiliar para pintar el header con estilo
 */
function actualizarHeaderUI(user) {
    const headerTools = document.querySelector('#main-header .header-tools');
    if (!headerTools) return;

    const loginBtn = headerTools.querySelector('.login-btn');
    const registerBtn = headerTools.querySelector('.register-btn');

    // Si encontramos los botones de login (significa que no hemos actualizado aún)
    if (loginBtn || registerBtn) {
        
        // 1. Limpiamos los botones viejos de login/registro
        if (loginBtn) loginBtn.remove();
        if (registerBtn) registerBtn.remove();

        // 2. Creamos un contenedor para las herramientas de usuario
        const userContainer = document.createElement('div');
        userContainer.className = 'user-controls';

        // --- A. Botón de Admin (Si corresponde) ---
        if (user.rol === 'admin') {
            const adminBtn = document.createElement('a');
            adminBtn.href = 'vistaAdmin.html';
            adminBtn.className = 'admin-pill-btn'; // Clase nueva
            adminBtn.innerHTML = '<i class="fas fa-cog"></i> Panel Admin'; // Icono
            userContainer.appendChild(adminBtn);
        }

        // --- B. Información del Usuario y Logout ---
        const userInfoDiv = document.createElement('div');
        userInfoDiv.className = 'user-info-group';
        
        userInfoDiv.innerHTML = `
            <span class="user-greeting">Hola, ${user.nombre.split(' ')[0]}</span>
            <button id="logout-btn" class="logout-link" title="Cerrar Sesión">
                <i class="fas fa-sign-out-alt"></i> Salir
            </button>
        `;

        userContainer.appendChild(userInfoDiv);
        
        // 3. Agregamos todo al header
        headerTools.appendChild(userContainer);

        // 4. Activamos el evento del botón nuevo
        addLogoutEvent();
    }
};


/**
 * Agrega la funcionalidad de cerrar sesión al botón generado dinámicamente
 */
function addLogoutEvent() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); 

            // 1. Borra al usuario de la memoria
            localStorage.removeItem('userName');
            localStorage.removeItem('userToken');
            localStorage.removeItem('techUpCarrito');
            localStorage.removeItem('_grecaptcha');

            // 2. Muestra la alerta con SweetAlert
            Swal.fire({
                title: '¡Sesión cerrada!',
                text: 'Has cerrado sesión exitosamente. ¡Vuelve pronto!',
                icon: 'success',
                timer: 2000, 
                showConfirmButton: false,
                background: '#1a202c', 
                color: '#e2e8f0'
            }).then(() => {
                // 3. Redirige al inicio
                window.location.href = 'index.html';
            });
        });
    }
}

/**
 * Espera a que el DOM esté cargado para inyectar los componentes.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos el header y el footer en paralelo
    Promise.all([
        loadComponent('components/header.html', 'main-header'),
        loadComponent('components/footer.html', 'main-footer')
    ]).then(() => {
        // 2. SOLO DESPUÉS de que cargaron, revisamos el login
        // Si lo ejecutamos antes, los botones no existirían en el DOM todavía.
        checkLoginStatus();
    });
});