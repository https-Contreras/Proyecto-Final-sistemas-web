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
function checkLoginStatus() {
    const userName = localStorage.getItem('userName');
    
    if (userName) {
        // Buscamos el contenedor de botones dentro del header cargado
        const headerTools = document.querySelector('#main-header .header-tools');
        
        if (headerTools) {
            const loginBtn = headerTools.querySelector('.login-btn');
            const registerBtn = headerTools.querySelector('.register-btn');

            // Solo si existen los botones originales, hacemos el reemplazo
            if (loginBtn && registerBtn) {
                // 1. Crear mensaje de bienvenida
                const welcomeSpan = document.createElement('span');
                welcomeSpan.className = 'header-username';
                welcomeSpan.textContent = `Hola, ${userName.split(' ')[0]}`; // Solo el primer nombre

                // 2. Crear botón de logout
                const logoutButton = document.createElement('button');
                logoutButton.id = 'logout-btn';
                logoutButton.className = 'logout-btn';
                logoutButton.textContent = 'Cerrar Sesión';

                // 3. Reemplazar los elementos viejos por los nuevos
                loginBtn.replaceWith(welcomeSpan);
                registerBtn.replaceWith(logoutButton);

                // 4. Activamos el evento del nuevo botón
                addLogoutEvent();
            }
        }
    }
}

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