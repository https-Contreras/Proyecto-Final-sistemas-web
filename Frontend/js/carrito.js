// 📁 Frontend/js/carrito.js

// ============================================
// 🔐 FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Obtener el token JWT del localStorage
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Verificar si el usuario está logueado
 */
function isUserLoggedIn() {
    const token = getAuthToken();
    return token !== null && token !== '';
}

/**
 * Redirigir al login si no está autenticado
 */
function requireAuth() {
    if (!isUserLoggedIn()) {
        alert('⚠️ Debes iniciar sesión para usar el carrito');
        window.location.href = '/Frontend/login.html';
        return false;
    }
    return true;
}

// ============================================
// 🛒 FUNCIONES DEL CARRITO (localStorage)
// ============================================

/**
 * Obtener el carrito del localStorage
 */
function getLocalCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], cupon_aplicado: null, descuento: 0 };
}

/**
 * Guardar el carrito en localStorage
 */
function saveLocalCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Agregar producto al carrito en localStorage
 */
function addToLocalCart(producto) {
    const cart = getLocalCart();
    
    // Verificar si el producto ya existe
    const existingIndex = cart.items.findIndex(item => item.product_id === producto.product_id);
    
    if (existingIndex !== -1) {
        // Si existe, incrementar cantidad
        cart.items[existingIndex].cantidad += producto.cantidad;
    } else {
        // Si no existe, agregarlo
        cart.items.push(producto);
    }
    
    saveLocalCart(cart);
}

/**
 * Actualizar cantidad de un producto
 */
function updateLocalCartItem(product_id, nuevaCantidad) {
    const cart = getLocalCart();
    const item = cart.items.find(i => i.product_id === product_id);
    
    if (item) {
        item.cantidad = nuevaCantidad;
        saveLocalCart(cart);
    }
}

/**
 * Eliminar producto del carrito
 */
function removeFromLocalCart(product_id) {
    const cart = getLocalCart();
    cart.items = cart.items.filter(item => item.product_id !== product_id);
    
    // Si se eliminó todo, también quitar el cupón
    if (cart.items.length === 0) {
        cart.cupon_aplicado = null;
        cart.descuento = 0;
    }
    
    saveLocalCart(cart);
}

/**
 * Aplicar cupón al carrito
 */
function applyLocalCoupon(cupon, descuento) {
    const cart = getLocalCart();
    cart.cupon_aplicado = cupon;
    cart.descuento = descuento;
    saveLocalCart(cart);
}

/**
 * Limpiar el carrito
 */
function clearLocalCart() {
    localStorage.removeItem('cart');
}

// ============================================
// 🎨 FUNCIONES DE INTERFAZ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    if (!requireAuth()) return;
    
    const cartListElement = document.getElementById('cart-items-list');
    if (!cartListElement) return;

    cargarCarrito();
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', abrirModalPago);
    }
    
    // Botón para aplicar cupón
    const couponBtn = document.querySelector('.coupon-btn');
    if (couponBtn) {
        couponBtn.addEventListener('click', aplicarCupon);
    }
});

/**
 * Cargar el carrito desde localStorage y validar con el backend
 */
async function cargarCarrito() {
    const cart = getLocalCart();
    
    if (cart.items.length === 0) {
        mostrarCarritoVacio();
        return;
    }
    
    try {
        // Validar productos con el backend
        const response = await fetch('http://localhost:3000/tech-up/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ items: cart.items })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Actualizar el carrito local con los datos validados
            cart.items = data.cart.items;
            saveLocalCart(cart);
            
            mostrarItemsCarrito(cart.items);
            actualizarTotales(cart);
        } else {
            console.error('Error al validar carrito:', data.message);
            mostrarItemsCarrito(cart.items);
            actualizarTotales(cart);
        }
        
    } catch (error) {
        console.error('Error al cargar carrito:', error);
        // Mostrar el carrito local aunque falle la validación
        mostrarItemsCarrito(cart.items);
        actualizarTotales(cart);
    }
}

/**
 * Mostrar mensaje de carrito vacío
 */
function mostrarCarritoVacio() {
    const cartListElement = document.getElementById('cart-items-list');
    cartListElement.innerHTML = `
        <div class="empty-cart-message">
            <h3>🛒 Tu carrito está vacío</h3>
            <p>¡Agrega productos para comenzar tu compra!</p>
            <a href="/Frontend/productos.html" class="submit-btn">Ver Productos</a>
        </div>
    `;
    
    document.getElementById('summary-subtotal').textContent = '$0.00';
    document.getElementById('summary-total').textContent = '$0.00';
}

/**
 * Mostrar items del carrito en la interfaz
 */
function mostrarItemsCarrito(items) {
    const cartListElement = document.getElementById('cart-items-list');
    cartListElement.innerHTML = '';

    if (items.length === 0) {
        mostrarCarritoVacio();
        return;
    }

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        
        const subtotalItem = item.precio * item.cantidad;

        itemElement.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.nombre}</h4>
                <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
                <button class="cart-item-remove" data-id="${item.product_id}">Eliminar</button>
            </div>
            <div class="cart-item-controls">
                <label for="qty-${item.product_id}">Cantidad:</label>
                <input type="number" id="qty-${item.product_id}" class="cart-item-qty" 
                       value="${item.cantidad}" min="1" max="${item.stock_disponible || 99}" 
                       data-id="${item.product_id}">
                <p class="cart-item-subtotal">Subtotal: $${subtotalItem.toFixed(2)}</p>
                ${item.stock_disponible ? `<small style="color: #888;">Stock: ${item.stock_disponible}</small>` : ''}
            </div>
        `;
        cartListElement.appendChild(itemElement);
    });
    
    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', eliminarProducto);
    });
    
    // Agregar event listeners a los inputs de cantidad
    document.querySelectorAll('.cart-item-qty').forEach(input => {
        input.addEventListener('change', actualizarCantidad);
    });
}

/**
 * Actualizar totales del resumen
 */
function actualizarTotales(cart) {
    const subtotal = cart.items.reduce((acc, item) => {
        return acc + (item.precio * item.cantidad);
    }, 0);

    const descuento = cart.descuento || 0;
    const total = subtotal - descuento;

    document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
    
    // Mostrar descuento si hay cupón aplicado
    if (cart.cupon_aplicado) {
        const cuponInput = document.getElementById('coupon-code');
        if (cuponInput) {
            cuponInput.value = cart.cupon_aplicado.codigo;
            cuponInput.disabled = true;
        }
        
        const cuponBtn = document.querySelector('.coupon-btn');
        if (cuponBtn) {
            cuponBtn.textContent = '✅ Aplicado';
            cuponBtn.disabled = true;
        }
    }
}

/**
 * Actualizar cantidad de un producto
 */
async function actualizarCantidad(e) {
    const product_id = e.target.dataset.id;
    const nuevaCantidad = parseInt(e.target.value);
    
    if (nuevaCantidad < 1) {
        alert('La cantidad debe ser mayor a 0');
        e.target.value = 1;
        return;
    }
    
    try {
        // Validar con el backend
        const response = await fetch('http://localhost:3000/tech-up/api/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ product_id, cantidad: nuevaCantidad })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Actualizar localStorage
            updateLocalCartItem(product_id, nuevaCantidad);
            
            // Recargar carrito
            cargarCarrito();
        } else {
            alert('⚠️ ' + data.message);
            // Revertir el valor
            cargarCarrito();
        }
        
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        alert('❌ Error al actualizar la cantidad');
        cargarCarrito();
    }
}

/**
 * Eliminar producto del carrito
 */
async function eliminarProducto(e) {
    const product_id = e.target.dataset.id;
    
    if (!confirm('¿Seguro que quieres eliminar este producto?')) {
        return;
    }
    
    try {
        // Notificar al backend (opcional, ya que está en localStorage)
        const response = await fetch('http://localhost:3000/tech-up/api/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ product_id })
        });
        
        // Eliminar del localStorage
        removeFromLocalCart(product_id);
        
        // Recargar carrito
        cargarCarrito();
        
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        // Eliminar de todas formas del localStorage
        removeFromLocalCart(product_id);
        cargarCarrito();
    }
}

/**
 * Aplicar cupón de descuento
 */
async function aplicarCupon() {
    const cuponInput = document.getElementById('coupon-code');
    const codigo_cupon = cuponInput.value.trim();
    
    if (!codigo_cupon) {
        alert('⚠️ Ingresa un código de cupón');
        return;
    }
    
    const cart = getLocalCart();
    const subtotal = cart.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    if (subtotal === 0) {
        alert('⚠️ Tu carrito está vacío');
        return;
    }
    
    const cuponBtn = document.querySelector('.coupon-btn');
    cuponBtn.textContent = 'Validando...';
    cuponBtn.disabled = true;
    
    try {
        const response = await fetch('http://localhost:3000/tech-up/api/cart/apply-coupon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ codigo_cupon, subtotal })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Aplicar cupón en localStorage
            applyLocalCoupon(data.cupon, data.descuento);
            
            alert(`✅ ${data.message}\n💰 Ahorro: $${data.descuento.toFixed(2)}`);
            
            // Recargar carrito con el descuento
            cargarCarrito();
        } else {
            alert('⚠️ ' + data.message);
            cuponBtn.textContent = 'Aplicar';
            cuponBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error al aplicar cupón:', error);
        alert('❌ Error al aplicar el cupón');
        cuponBtn.textContent = 'Aplicar';
        cuponBtn.disabled = false;
    }
}

// ============================================
// 💳 FUNCIONES DEL MODAL DE PAGO
// ============================================

let captchaWidgets = {
    tarjeta: null,
    transferencia: null,
    oxxo: null
};

function abrirModalPago() {
    const cart = getLocalCart();
    
    if (cart.items.length === 0) {
        alert('⚠️ Tu carrito está vacío');
        return;
    }
    
    const totalElement = document.getElementById('summary-total');
    const total = totalElement.textContent;
    
    const modalHTML = `
        <div id="payment-modal" class="payment-modal">
            <div class="payment-modal-content">
                <span class="close-modal">&times;</span>
                
                <h2>Método de Pago</h2>
                <p class="payment-total">Total a pagar: <strong>${total}</strong></p>
                
                <div class="payment-method-selector">
                    <button type="button" class="payment-method-btn active" data-method="tarjeta">
                        💳 Tarjeta
                    </button>
                    <button type="button" class="payment-method-btn" data-method="transferencia">
                        🏦 Transferencia
                    </button>
                    <button type="button" class="payment-method-btn" data-method="oxxo">
                        🏪 OXXO
                    </button>
                </div>
                
                <!-- Formulario de Tarjeta -->
                <form id="payment-form-tarjeta" class="payment-form active">
                    <div class="form-group">
                        <label for="card-number">Número de Tarjeta</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="card-name">Nombre del Titular</label>
                        <input type="text" id="card-name" placeholder="JUAN PÉREZ" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="card-expiry">Fecha de Expiración</label>
                            <input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="card-cvv">CVV</label>
                            <input type="text" id="card-cvv" placeholder="123" maxlength="4" required>
                        </div>
                    </div>
                    
                    <div class="form-group captcha-group">
                        <div id="captcha-tarjeta"></div>
                    </div>
                    
                    <button type="submit" class="submit-btn payment-submit-btn">
                        Confirmar Pago
                    </button>
                </form>
                
                <!-- Formulario de Transferencia -->
                <form id="payment-form-transferencia" class="payment-form">
                    <div class="payment-info-box">
                        <h3>📋 Datos para Transferencia</h3>
                        <div class="info-item"><strong>Banco:</strong> <span>BBVA Bancomer</span></div>
                        <div class="info-item"><strong>CLABE:</strong> <span>012180001234567890</span></div>
                        <div class="info-item"><strong>Cuenta:</strong> <span>0123456789</span></div>
                        <div class="info-item"><strong>Titular:</strong> <span>Tech-Up S.A. de C.V.</span></div>
                        <div class="info-item"><strong>Concepto:</strong> <span>Pago Pedido #${generarNumeroPedido()}</span></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="transfer-bank">Tu Banco</label>
                        <select id="transfer-bank" required>
                            <option value="">Selecciona tu banco</option>
                            <option value="bbva">BBVA</option>
                            <option value="banamex">Banamex</option>
                            <option value="santander">Santander</option>
                            <option value="hsbc">HSBC</option>
                            <option value="scotiabank">Scotiabank</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="transfer-account">Titular de la Cuenta</label>
                        <input type="text" id="transfer-account" placeholder="Nombre completo" required>
                    </div>
                    
                    <div class="form-group captcha-group">
                        <div id="captcha-transferencia"></div>
                    </div>
                    
                    <button type="submit" class="submit-btn payment-submit-btn">
                        Confirmar Transferencia
                    </button>
                </form>
                
                <!-- Formulario de OXXO -->
                <form id="payment-form-oxxo" class="payment-form">
                    <div class="payment-info-box oxxo-box">
                        <h3>🏪 Paga en OXXO</h3>
                        <p class="oxxo-instructions">Presenta este código en cualquier tienda OXXO para completar tu pago.</p>
                        
                        <div class="oxxo-code">
                            <strong>Código de Referencia:</strong>
                            <div class="reference-code">${generarCodigoOxxo()}</div>
                        </div>
                        
                        <div class="info-item"><strong>Monto a pagar:</strong> <span class="oxxo-amount">${total}</span></div>
                        <div class="info-item"><strong>Válido hasta:</strong> <span>${obtenerFechaExpiracion()}</span></div>
                    </div>
                    
                    <div class="oxxo-steps">
                        <h4>Instrucciones:</h4>
                        <ol>
                            <li>Acude a cualquier tienda OXXO</li>
                            <li>Indica que quieres realizar un pago de servicio</li>
                            <li>Proporciona el código de referencia</li>
                            <li>Realiza el pago en efectivo</li>
                            <li>Guarda tu comprobante</li>
                        </ol>
                    </div>
                    
                    <div class="form-group captcha-group">
                        <div id="captcha-oxxo"></div>
                    </div>
                    
                    <button type="submit" class="submit-btn payment-submit-btn">
                        Confirmar Pedido
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => renderizarCaptcha('tarjeta'), 500);
    
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.addEventListener('click', cerrarModalPago);
    
    const modal = document.getElementById('payment-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModalPago();
    });
    
    const methodBtns = document.querySelectorAll('.payment-method-btn');
    const forms = document.querySelectorAll('.payment-form');
    
    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.dataset.method;
            
            methodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `payment-form-${method}`) {
                    form.classList.add('active');
                }
            });
            
            renderizarCaptcha(method);
        });
    });
    
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    const cvvInput = document.getElementById('card-cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    forms.forEach(form => {
        form.addEventListener('submit', procesarPago);
    });
}

function renderizarCaptcha(metodo) {
    if (captchaWidgets[metodo] !== null) return;
    
    if (typeof grecaptcha === 'undefined' || !grecaptcha.render) {
        console.error('reCAPTCHA no está cargado');
        return;
    }
    
    const containerId = `captcha-${metodo}`;
    const container = document.getElementById(containerId);
    
    if (!container || container.children.length > 0) return;
    
    try {
        captchaWidgets[metodo] = grecaptcha.render(containerId, {
            'sitekey': '6Le84A0sAAAAAFllLkm3fs8hIY90-EZp6yQOfCL0'
        });
    } catch (error) {
        console.error(`Error al renderizar CAPTCHA para ${metodo}:`, error);
    }
}

function cerrarModalPago() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        captchaWidgets = { tarjeta: null, transferencia: null, oxxo: null };
        modal.remove();
    }
}

function procesarPago(e) {
    e.preventDefault();
    
    const formId = e.target.id;
    const metodo = formId.replace('payment-form-', '');
    const widgetId = captchaWidgets[metodo];
    
    if (widgetId === null) {
        alert('⚠️ Error: CAPTCHA no inicializado correctamente.');
        return;
    }
    
    let captchaToken;
    try {
        captchaToken = grecaptcha.getResponse(widgetId);
    } catch (error) {
        console.error('Error al obtener respuesta del CAPTCHA:', error);
        alert('⚠️ Error al validar el CAPTCHA. Por favor, recarga la página.');
        return;
    }
    
    if (!captchaToken) {
        alert('⚠️ Por favor, completa el CAPTCHA antes de continuar con el pago.');
        return;
    }
    
    const submitBtn = e.target.querySelector('.payment-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Procesando...';
    submitBtn.disabled = true;
    
    const datos = recopilarDatosCompra(metodo);
    const total = document.getElementById('summary-total').textContent;
    
    fetch('http://localhost:3000/tech-up/procesar-pago', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            captchaToken: captchaToken,
            metodo: metodo,
            datos: datos,
            total: total
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let mensaje = '';
            switch(metodo) {
                case 'tarjeta':
                    mensaje = `¡Pago con tarjeta procesado exitosamente! 🎉\n\nOrden #${data.ordenId}\nGracias por tu compra en Tech-Up.`;
                    break;
                case 'transferencia':
                    mensaje = `¡Transferencia registrada! 💰\n\nOrden #${data.ordenId}\nRecibirás un email de confirmación cuando se acredite el pago.`;
                    break;
                case 'oxxo':
                    mensaje = `¡Pedido confirmado! 🏪\n\nOrden #${data.ordenId}\nRecuerda realizar el pago en OXXO dentro de las próximas 48 horas.`;
                    break;
            }
            
            alert(mensaje);
            cerrarModalPago();
            
            // Limpiar carrito de localStorage
            clearLocalCart();
            
            // Recargar la página
            window.location.reload();
        } else {
            alert('⚠️ ' + data.message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            grecaptcha.reset(widgetId);
        }
    })
    .catch(error => {
        console.error('Error al procesar pago:', error);
        alert('❌ Error al procesar el pago. Por favor, intenta de nuevo.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        grecaptcha.reset(widgetId);
    });
}

function recopilarDatosCompra(metodo) {
    const datos = {};
    
    if (metodo === 'tarjeta') {
        datos.numeroTarjeta = document.getElementById('card-number').value;
        datos.nombreTitular = document.getElementById('card-name').value;
        datos.expiracion = document.getElementById('card-expiry').value;
        datos.cvv = document.getElementById('card-cvv').value;
    } else if (metodo === 'transferencia') {
        datos.banco = document.getElementById('transfer-bank').value;
        datos.titular = document.getElementById('transfer-account').value;
    }
    
    return datos;
}

function generarNumeroPedido() {
    return Math.floor(100000 + Math.random() * 900000);
}

function generarCodigoOxxo() {
    const chars = '0123456789';
    let codigo = '';
    for (let i = 0; i < 14; i++) {
        codigo += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3 || i === 7 || i === 11) codigo += ' ';
    }
    return codigo;
}

function obtenerFechaExpiracion() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 2);
    return fecha.toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
}