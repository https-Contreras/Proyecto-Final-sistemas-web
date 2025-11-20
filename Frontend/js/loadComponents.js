/**
 * Carga un componente HTML (header/footer) en un elemento del DOM.
 * @param {string} url - La ruta al archivo HTML del componente.
 * @param {string} elementId - El ID del elemento donde se insertará el HTML.
 */
async function loadComponent(url, elementId) {
    try {
        // 1. Usamos fetch() para pedir el archivo HTML (requisito del proyecto)
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error al cargar ${url}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // 2. Manipulamos el DOM (requisito del proyecto)
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            
            // 3. Si es el header, actualizar según el estado de autenticación
            if (elementId === 'main-header') {
                actualizarHeader();
                actualizarContadorCarrito();
            }
        } else {
            console.warn(`No se encontró el elemento con ID: ${elementId}`);
        }
    } catch (error) {
        console.error(`No se pudo cargar el componente: ${error}`);
    }
}

/**
 * Actualiza el header según el estado de autenticación del usuario
 */
function actualizarHeader() {
    // Obtener el token y usuario del localStorage
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('user');
    
    // Buscar los botones en el header
    const loginBtn = document.querySelector('a[href*="login.html"]');
    const registerBtn = document.querySelector('a[href*="registro.html"]');
    
    // Si está logueado
    if (token && userJson) {
        try {
            const user = JSON.parse(userJson);
            
            // Ocultar el botón de registrarse
            if (registerBtn) {
                registerBtn.style.display = 'none';
            }
            
            // Reemplazar el botón de "Iniciar Sesión" con el menú de usuario
            if (loginBtn) {
                const userMenuHTML = `
                    <div class="user-menu">
                        <button class="user-menu-btn" id="user-menu-toggle">
                            👤 ${user.nombre}
                        </button>
                        <div class="user-dropdown" id="user-dropdown">
                            <a href="/Frontend/carrito.html">🛒 Mi Carrito</a>
                            <a href="#" id="logout-btn">🚪 Cerrar Sesión</a>
                        </div>
                    </div>
                `;
                
                // Crear un elemento temporal
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = userMenuHTML;
                const userMenu = tempDiv.firstElementChild;
                
                // Reemplazar el botón de login con el menú de usuario
                loginBtn.parentNode.replaceChild(userMenu, loginBtn);
                
                // Agregar event listeners después de un breve delay
                setTimeout(() => {
                    const menuToggle = document.getElementById('user-menu-toggle');
                    const dropdown = document.getElementById('user-dropdown');
                    const logoutBtn = document.getElementById('logout-btn');
                    
                    if (menuToggle && dropdown) {
                        // Toggle del menú
                        menuToggle.addEventListener('click', (e) => {
                            e.stopPropagation();
                            dropdown.classList.toggle('show');
                        });
                        
                        // Cerrar el dropdown al hacer click fuera
                        document.addEventListener('click', (e) => {
                            if (!e.target.closest('.user-menu')) {
                                dropdown.classList.remove('show');
                            }
                        });
                    }
                    
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            cerrarSesion();
                        });
                    }
                }, 100);
            }
            
        } catch (error) {
            console.error('Error al parsear usuario:', error);
            // Si hay error, limpiar localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    }
}

/**
 * Función para cerrar sesión
 */
function cerrarSesion() {
    if (confirm('¿Estás seguro que quieres cerrar sesión?')) {
        // Limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        
        // Redirigir al inicio
        alert('✅ Sesión cerrada exitosamente');
        window.location.href = '/Frontend/index.html';
    }
}

/**
 * Actualizar el contador del carrito
 */
function actualizarContadorCarrito() {
    const cart = localStorage.getItem('cart');
    const cartCount = document.getElementById('cart-count');
    
    if (cart && cartCount) {
        try {
            const cartData = JSON.parse(cart);
            const totalItems = cartData.items.reduce((sum, item) => sum + item.cantidad, 0);
            
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.style.display = 'inline-block';
            } else {
                cartCount.textContent = '0';
            }
        } catch (error) {
            console.error('Error al contar items del carrito:', error);
            cartCount.textContent = '0';
        }
    }
}

/**
 * Espera a que el DOM esté cargado para inyectar los componentes.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Cargamos el header y el footer en sus respectivos placeholders
    loadComponent('/Frontend/components/header.html', 'main-header');
    loadComponent('/Frontend/components/footer.html', 'main-footer');
});

// Actualizar contador del carrito cuando cambie el localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        actualizarContadorCarrito();
    }
});

// También actualizar cuando se modifique el carrito en la misma pestaña
window.addEventListener('cartUpdated', () => {
    actualizarContadorCarrito();
});