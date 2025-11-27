// Frontend/js/carrito.js

/**
 * CARRITO.JS
 * Lógica del carrito de compras para el Frontend
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const API_BASE_URL = 'http://localhost:3000';
const CART_API = `${API_BASE_URL}/api/cart`;

const COSTOS_ENVIO = {
    'mx': 150.00,  // México
    'usa': 450.00, // Estados Unidos
    'ca': 600.00   // Canadá
};

let datosResumenActual = null; // Para guardar los montos base (subtotal/descuento)
// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Carrito.js cargado');
    
    const token = localStorage.getItem('userToken');
    
    if (!token) {
        mostrarCarritoVacio('Inicia sesión para ver tu carrito');
        deshabilitarControles();
        return;
    }
    
    cargarCarrito();
    initEventListeners();
});

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    const couponBtn = document.querySelector('.coupon-btn');
    if (couponBtn) {
        couponBtn.addEventListener('click', aplicarCupon);
    }
    
    const couponInput = document.getElementById('coupon-code');
    if (couponInput) {
        couponInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                aplicarCupon();
            }
        });
    }
    
    const countrySelect = document.getElementById('shipping-country');
    if (countrySelect) {
        countrySelect.addEventListener('change', () => {
            // Si ya tenemos datos cargados, recalculamos
            if (datosResumenActual) actualizarResumen(datosResumenActual);
        });
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', finalizarCompra);
    }
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

async function cargarCarrito() {
    const token = localStorage.getItem('userToken');
    const cartContainer = document.getElementById('cart-items-list');
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = `
        <div class="cart-loading" style="text-align: center; padding: 3rem;">
            <p style="color: var(--color-text-muted);">Cargando tu carrito...</p>
        </div>
    `;
    
    try {
        const response = await fetch(CART_API, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            renderizarCarrito(data.data);
        } else {
            mostrarCarritoVacio('Error al cargar el carrito');
        }
        
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarCarritoVacio('No se pudo conectar con el servidor');
    }
}

function renderizarCarrito(cartData) {
    const { items, resumen } = cartData;
    const cartContainer = document.getElementById('cart-items-list');
    
    if (!items || items.length === 0) {
        mostrarCarritoVacio('Tu carrito está vacío');
        actualizarResumen(resumen);
        return;
    }
    
    cartContainer.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = crearItemElement(item);
        cartContainer.appendChild(itemElement);
    });
    
    // --- CAMBIO CLAVE: Guardamos los datos base en la global ---
    datosResumenActual = resumen; 
    
    actualizarResumen(resumen);
    actualizarContadorHeader(resumen.cantidadItems);
}

function crearItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.productId = item.productId;
    
    const subtotalItem = (item.precio * item.cantidad).toFixed(2);
    
    div.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.imagen || 'assets/images/placeholder.jpg'}" alt="${item.nombre}">
        </div>
        
        <div class="cart-item-details">
            <h4 class="cart-item-name">${item.nombre}</h4>
            <p class="cart-item-price">$${item.precio.toFixed(2)} c/u</p>
            ${item.stockDisponible <= 5 ? `<span class="stock-warning">⚠️ Solo quedan ${item.stockDisponible}</span>` : ''}
        </div>
        
        <div class="cart-item-quantity">
            <button class="qty-btn qty-decrease" data-product-id="${item.productId}" ${item.cantidad <= 1 ? 'disabled' : ''}>−</button>
            <span class="qty-value">${item.cantidad}</span>
            <button class="qty-btn qty-increase" data-product-id="${item.productId}" ${item.cantidad >= item.stockDisponible ? 'disabled' : ''}>+</button>
        </div>
        
        <div class="cart-item-subtotal">
            <span>$${subtotalItem}</span>
        </div>
        
        <button class="cart-item-remove" data-product-id="${item.productId}" title="Eliminar">🗑️</button>
    `;
    
    const decreaseBtn = div.querySelector('.qty-decrease');
    const increaseBtn = div.querySelector('.qty-increase');
    const removeBtn = div.querySelector('.cart-item-remove');
    
    decreaseBtn.addEventListener('click', () => actualizarCantidad(item.productId, item.cantidad - 1));
    increaseBtn.addEventListener('click', () => actualizarCantidad(item.productId, item.cantidad + 1));
    removeBtn.addEventListener('click', () => eliminarProducto(item.productId));
    
    return div;
}
function actualizarResumen(resumen) {
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');
    
    // 1. Obtener valores base
    const subtotal = parseFloat(resumen.subtotal);
    const descuento = parseFloat(resumen.descuento || 0);

    // 2. Calcular Envío según el país seleccionado
    const countrySelect = document.getElementById('shipping-country');
    const paisSeleccionado = countrySelect ? countrySelect.value : 'mx';
    
    // Si el carrito está vacío o el subtotal es 0, el envío es 0. Si no, tarifa del país.
    const costoEnvio = (resumen.cantidadItems > 0) ? (COSTOS_ENVIO[paisSeleccionado] || 0) : 0;

    // 3. Calcular Total Final
    const total = subtotal - descuento + costoEnvio;

    // 4. Actualizar HTML
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    if (shippingEl) {
        if (resumen.cantidadItems === 0) {
            shippingEl.textContent = '$0.00';
        } else {
            shippingEl.textContent = `$${costoEnvio.toFixed(2)}`;
        }
    }
    
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    
    mostrarDescuento(resumen);
}
function mostrarDescuento(resumen) {
    let discountLine = document.querySelector('.summary-line.discount');
    const totalLine = document.querySelector('.summary-line.total');
    
    const couponInput = document.getElementById('coupon-code');
    let couponBtn = document.querySelector('.coupon-btn'); // Usamos let para actualizar la referencia

    // 1. Lógica Visual del Descuento (Montos)
    if (resumen.descuento > 0 || resumen.cuponAplicado) {
        if (!discountLine && totalLine) {
            discountLine = document.createElement('div');
            discountLine.className = 'summary-line discount';
            totalLine.parentNode.insertBefore(discountLine, totalLine);
        }
        if (discountLine) {
            discountLine.innerHTML = `
                <span style="color: var(--color-primary);">Descuento (${resumen.cuponAplicado}):</span>
                <span style="color: var(--color-primary);">-$${resumen.descuento.toFixed(2)}</span>
            `;
        }

        // 2. Lógica del Botón (LA PARTE QUE PEDISTE)
        if (couponInput && couponBtn) {
            couponInput.value = resumen.cuponAplicado;
            couponInput.disabled = true;

            // ESTADO 1: "✓ Aplicado" (Visual, dura 2 segundos)
            couponBtn.textContent = '✓ Aplicado';
            couponBtn.disabled = true;
            couponBtn.style.background = 'var(--color-primary)';
            couponBtn.style.color = '#fff';
            couponBtn.style.borderColor = 'var(--color-primary)';

            // ESTADO 2: Transición a "Quitar"
            setTimeout(() => {
                // Verificamos que el botón siga existiendo en el DOM
                couponBtn = document.querySelector('.coupon-btn');
                if(!couponBtn) return;

                couponBtn.textContent = '✖ Quitar';
                couponBtn.style.background = 'transparent'; 
                couponBtn.style.color = '#ff4d4d'; // Rojo
                couponBtn.style.borderColor = '#ff4d4d';
                couponBtn.disabled = false;

                // IMPORTANTE: Limpiamos listeners viejos (clonando el botón) y asignamos eliminar
                const newBtn = couponBtn.cloneNode(true);
                couponBtn.parentNode.replaceChild(newBtn, couponBtn);
                
                // Asignamos el evento de borrar
                newBtn.addEventListener('click', eliminarCupon);

            }, 2000); // 2 segundos de espera
        }

    } else {
        // Lógica cuando NO hay cupón (Resetear a estado normal)
        if (discountLine) discountLine.remove();
        
        if (couponInput && couponBtn) {
            couponInput.value = '';
            couponInput.disabled = false;
            
            couponBtn.textContent = 'Aplicar';
            couponBtn.disabled = false;
            couponBtn.style.background = ''; // Reset estilos
            couponBtn.style.color = '';
            couponBtn.style.borderColor = '';

            // Limpiamos listeners y asignamos aplicar
            const newBtn = couponBtn.cloneNode(true);
            couponBtn.parentNode.replaceChild(newBtn, couponBtn);
            
            // Asignamos el evento de aplicar
            newBtn.addEventListener('click', aplicarCupon);
        }
    }
}
function mostrarCarritoVacio(mensaje = 'Tu carrito está vacío') {
    const cartContainer = document.getElementById('cart-items-list');
    
    if (cartContainer) {
        cartContainer.innerHTML = `
            <div class="cart-empty" style="text-align: center; padding: 3rem;">
                <p style="font-size: 4rem; margin-bottom: 1rem;">🛒</p>
                <h3 style="color: var(--color-text-muted); margin-bottom: 1rem;">${mensaje}</h3>
                <a href="productos.html" class="submit-btn" style="display: inline-block; text-decoration: none;">Ver Productos</a>
            </div>
        `;
    }
    
    actualizarContadorHeader(0);
}

function deshabilitarControles() {
    const couponInput = document.getElementById('coupon-code');
    const couponBtn = document.querySelector('.coupon-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    if (couponInput) couponInput.disabled = true;
    if (couponBtn) couponBtn.disabled = true;
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Inicia sesión para comprar';
    }
}

// ============================================
// OPERACIONES DEL CARRITO
// ============================================

async function actualizarCantidad(productId, nuevaCantidad) {
    const token = localStorage.getItem('userToken');
    
    try {
        const response = await fetch(`${CART_API}/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, cantidad: nuevaCantidad })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            renderizarCarrito(data.data);
        } else {
            mostrarNotificacion(data.message || 'Error al actualizar', 'error');
        }
        
    } catch (error) {
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function eliminarProducto(productId) {
    const token = localStorage.getItem('userToken');
    
    const confirmar = await Swal.fire({
        title: '¿Eliminar producto?',
        text: '¿Estás seguro de quitar este producto del carrito?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1a202c',
        color: '#e2e8f0'
    });
    
    if (!confirmar.isConfirmed) return;
    
    try {
        const response = await fetch(`${CART_API}/remove`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            renderizarCarrito(data.data);
            mostrarNotificacion(data.message, 'success');
        } else {
            mostrarNotificacion(data.message || 'Error al eliminar', 'error');
        }
        
    } catch (error) {
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function aplicarCupon() {
    const token = localStorage.getItem('userToken');
    const couponInput = document.getElementById('coupon-code');
    const couponBtn = document.querySelector('.coupon-btn');
    
    if (!couponInput || !couponInput.value.trim()) {
        mostrarNotificacion('Ingresa un código de cupón', 'warning');
        return;
    }
    
    const codigo = couponInput.value.trim();
    const originalText = couponBtn.textContent;
    couponBtn.textContent = '...';
    couponBtn.disabled = true;
    
    try {
        const response = await fetch(`${CART_API}/apply-coupon`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: codigo })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            renderizarCarrito(data.data);
            mostrarNotificacion(data.message, 'success');
        } else {
            couponBtn.textContent = originalText;
            couponBtn.disabled = false;
            mostrarNotificacion(data.message || 'Cupón inválido', 'error');
        }
        
    } catch (error) {
        couponBtn.textContent = originalText;
        couponBtn.disabled = false;
        mostrarNotificacion('Error de conexión', 'error');
    }
}


async function eliminarCupon() {
    const token = localStorage.getItem('userToken');
    const couponInput = document.getElementById('coupon-code');
    const couponBtn = document.querySelector('.coupon-btn');

    // Feedback visual inmediato
    couponBtn.textContent = '...';
    couponBtn.disabled = true;

    try {
        // Asegúrate de crear esta ruta en tu backend: router.delete('/cart/coupon', ...)
        // O si usas la misma ruta de update, ajusta aquí.
        const response = await fetch(`${CART_API}/remove-coupon`, { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            renderizarCarrito(data.data); // Esto volverá a pintar todo y reseteara el botón a "Aplicar"
            mostrarNotificacion('Cupón eliminado', 'info');
            if (couponInput) {
                couponInput.value = ''; // Limpiamos el input
                couponInput.disabled = false;
            }
        } else {
            mostrarNotificacion(data.message || 'Error al quitar cupón', 'error');
            // Si falla, regresamos el botón a estado "Quitar"
            couponBtn.textContent = '✖ Quitar';
            couponBtn.disabled = false;
        }

    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error de conexión', 'error');
        couponBtn.textContent = '✖ Quitar';
        couponBtn.disabled = false;
    }
}

async function finalizarCompra() {
    const token = localStorage.getItem('userToken');
    const cartContainer = document.getElementById('cart-items-list');
    
    if (cartContainer && cartContainer.querySelector('.cart-empty')) {
        mostrarNotificacion('Tu carrito está vacío', 'warning');
        return;
    }
    
    const result = await Swal.fire({
        title: '¡Confirmar Compra!',
        html: `<p>Estás a punto de finalizar tu compra.</p>
               <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 1rem;">
               (Esta es una simulación - No se procesará ningún pago real)</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✓ Confirmar Compra',
        cancelButtonText: 'Seguir comprando',
        confirmButtonColor: '#667eea',
        background: '#1a202c',
        color: '#e2e8f0'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        const response = await fetch(`${CART_API}/clear`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const ordenId = Math.floor(100000 + Math.random() * 900000);
            
            await Swal.fire({
                title: '¡Compra Exitosa! 🎉',
                html: `<p>Tu pedido ha sido procesado correctamente.</p>
                       <p style="margin-top: 1rem;"><strong>Número de orden:</strong> 
                       <span style="color: var(--color-primary); font-size: 1.2rem;">#${ordenId}</span></p>`,
                icon: 'success',
                confirmButtonText: 'Volver a la tienda',
                background: '#1a202c',
                color: '#e2e8f0'
            });
            
            window.location.href = 'productos.html';
        }
        
    } catch (error) {
        mostrarNotificacion('Error al procesar la compra', 'error');
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function actualizarContadorHeader(cantidad) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cantidad;
        cartCount.style.transform = 'scale(1.3)';
        setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 200);
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: '#1a202c',
            color: '#e2e8f0'
        }).fire({ icon: tipo, title: mensaje });
    } else {
        alert(mensaje);
    }
}

// ============================================
// FUNCIÓN GLOBAL PARA AGREGAR DESDE OTRAS PÁGINAS
// ============================================

window.agregarAlCarrito = async function(productId, cantidad = 1) {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
        Swal.fire({
            title: 'Inicia Sesión',
            text: 'Necesitas iniciar sesión para agregar productos al carrito',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ir a Login',
            cancelButtonText: 'Cancelar',
            background: '#1a202c',
            color: '#e2e8f0'
        }).then((result) => {
            if (result.isConfirmed) window.location.href = 'login.html';
        });
        return false;
    }
    
    try {
        const response = await fetch(`${CART_API}/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, cantidad })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            actualizarContadorHeader(data.data.resumen.cantidadItems);
            Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#1a202c',
                color: '#e2e8f0'
            }).fire({ icon: 'success', title: data.message });
            return true;
        } else {
            Swal.fire({
                title: 'Error',
                text: data.message || 'No se pudo agregar al carrito',
                icon: 'error',
                background: '#1a202c',
                color: '#e2e8f0'
            });
            return false;
        }
        
    } catch (error) {
        Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            icon: 'error',
            background: '#1a202c',
            color: '#e2e8f0'
        });
        return false;
    }
};


async function finalizarCompra() {
    const token = localStorage.getItem('userToken');
    const cartContainer = document.getElementById('cart-items-list');
    
    // Verificar que hay items en el carrito
    if (cartContainer && cartContainer.querySelector('.cart-empty')) {
        mostrarNotificacion('Tu carrito está vacío', 'warning');
        return;
    }
    
    // Verificar sesión
    if (!token) {
        Swal.fire({
            title: 'Inicia Sesión',
            text: 'Necesitas iniciar sesión para realizar una compra',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ir a Login',
            cancelButtonText: 'Cancelar',
            background: '#1a202c',
            color: '#e2e8f0'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'login.html';
            }
        });
        return;
    }
    
    // Redirigir al checkout
    window.location.href = 'checkout.html';
}
console.log('✅ carrito.js cargado correctamente');