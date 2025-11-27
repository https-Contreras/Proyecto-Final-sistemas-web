// Frontend/js/checkout.js

/**
 * CHECKOUT.JS
 * Lógica del proceso de pago
 * Requiere: Sesión iniciada + CAPTCHA
 */

const API_BASE_URL = 'http://localhost:3000';
const CART_API = `${API_BASE_URL}/api/cart`;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('💳 Checkout.js cargado');
    
    // Verificar sesión
    const token = localStorage.getItem('userToken');
    if (!token) {
        Swal.fire({
            title: 'Inicia Sesión',
            text: 'Necesitas iniciar sesión para realizar una compra',
            icon: 'warning',
            confirmButtonText: 'Ir a Login',
            background: '#1a202c',
            color: '#e2e8f0'
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }
    
    // Cargar resumen del carrito
    cargarResumenCarrito();
    
    // Inicializar eventos
    initPaymentMethods();
    initCardFormatting();
    initPaymentButton();
});

// ============================================
// CARGAR RESUMEN DEL CARRITO
// ============================================
async function cargarResumenCarrito() {
    const token = localStorage.getItem('userToken');
    
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
            const { items, resumen } = data.data;
            
            // Si el carrito está vacío, redirigir
            if (!items || items.length === 0) {
                Swal.fire({
                    title: 'Carrito Vacío',
                    text: 'No tienes productos en tu carrito',
                    icon: 'info',
                    confirmButtonText: 'Ver Productos',
                    background: '#1a202c',
                    color: '#e2e8f0'
                }).then(() => {
                    window.location.href = 'productos.html';
                });
                return;
            }
            
            renderizarItemsCheckout(items);
            actualizarTotalesCheckout(resumen);
            
            // Pre-llenar email si existe
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                const oxxoEmail = document.getElementById('oxxo-email');
                const transferEmail = document.getElementById('transfer-email');
                if (oxxoEmail) oxxoEmail.value = userEmail;
                if (transferEmail) transferEmail.value = userEmail;
            }
        } else {
            mostrarErrorCheckout('Error al cargar el carrito');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarErrorCheckout('Error de conexión');
    }
}

function renderizarItemsCheckout(items) {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
            <img src="${item.imagen || 'assets/images/placeholder.jpg'}" alt="${item.nombre}">
            <div class="checkout-item-info">
                <span class="checkout-item-name">${item.nombre}</span>
                <span class="checkout-item-qty">Cantidad: ${item.cantidad}</span>
            </div>
            <span class="checkout-item-price">$${(item.precio * item.cantidad).toFixed(2)}</span>
        `;
        container.appendChild(div);
    });
}

function actualizarTotalesCheckout(resumen) {
    document.getElementById('checkout-subtotal').textContent = `$${resumen.subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = resumen.envio === 0 ? '¡Gratis!' : `$${resumen.envio.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${resumen.total.toFixed(2)}`;
    
    // Mostrar descuento si existe
    if (resumen.descuento > 0) {
        document.getElementById('checkout-discount-line').style.display = 'flex';
        document.getElementById('checkout-discount').textContent = `-$${resumen.descuento.toFixed(2)}`;
    }
    
    // Generar referencia para transferencia
    const refElement = document.getElementById('transfer-reference');
    if (refElement) {
        refElement.textContent = `TU-${Date.now().toString().slice(-8)}`;
    }
}

// ============================================
// MÉTODOS DE PAGO
// ============================================
function initPaymentMethods() {
    const options = document.querySelectorAll('.payment-option');
    const forms = document.querySelectorAll('.payment-form');
    
    options.forEach(option => {
        option.addEventListener('click', () => {
            const method = option.dataset.method;
            
            // Actualizar selección visual
            options.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            
            // Mostrar formulario correspondiente
            forms.forEach(form => form.classList.remove('active'));
            document.getElementById(`form-${method}`).classList.add('active');
        });
    });
}

// ============================================
// FORMATEO DE TARJETA
// ============================================
function initCardFormatting() {
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');
    const cardName = document.getElementById('card-name');
    
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = value.substring(0, 19);
            
            // Detectar tipo de tarjeta
            detectCardType(value.replace(/\s/g, ''));
        });
    }
    
    if (cardExpiry) {
        cardExpiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cardCvv) {
        cardCvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
    
    if (cardName) {
        cardName.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
}

function detectCardType(number) {
    const icon = document.getElementById('card-type-icon');
    if (!icon) return;
    
    if (/^4/.test(number)) {
        icon.textContent = '💙 Visa';
    } else if (/^5[1-5]/.test(number)) {
        icon.textContent = '🔴 MasterCard';
    } else if (/^3[47]/.test(number)) {
        icon.textContent = '💚 Amex';
    } else {
        icon.textContent = '';
    }
}

// ============================================
// PROCESO DE PAGO
// ============================================
function initPaymentButton() {
    const btn = document.getElementById('btn-confirmar-pago');
    if (btn) {
        btn.addEventListener('click', procesarPago);
    }
}


async function procesarPago() {
    const token = localStorage.getItem('userToken');
    const btn = document.getElementById('btn-confirmar-pago');
    
    // 1. VALIDAR CAPTCHA
    if (typeof grecaptcha === 'undefined') { return; }
    const captchaResponse = grecaptcha.getResponse();
    
    if (!captchaResponse) {
        Swal.fire({
            title: 'Captcha requerido',
            text: 'Por favor valida que no eres un robot',
            icon: 'warning',
            background: '#1a202c', color: '#e2e8f0'
        });
        return;
    }

    // 2. RECUPERAR Y VALIDAR DATOS DE ENVÍO
    const nombre = document.getElementById('ship-name').value.trim();
    const email = document.getElementById('ship-email').value.trim();
    const telefono = document.getElementById('ship-phone').value.trim();
    const calle = document.getElementById('ship-address').value.trim();
    const colonia = document.getElementById('ship-colonia').value.trim();
    const cp = document.getElementById('ship-zip').value.trim();
    const ciudad = document.getElementById('ship-city').value.trim();
    const estado = document.getElementById('ship-state').value.trim();

    if (!nombre || !email || !telefono || !calle || !colonia || !cp || !ciudad || !estado) {
        Swal.fire({
            title: 'Datos Incompletos',
            text: 'Por favor llena todos los campos de envío para tu nota de compra.',
            icon: 'warning',
            background: '#1a202c', color: '#e2e8f0'
        });
        return;
    }

    // 3. OBTENER MÉTODO Y TOTAL VISUAL
    const metodoSeleccionado = document.querySelector('input[name="payment-method"]:checked').value;
    const totalTexto = document.getElementById('checkout-total').textContent.replace('$', '').replace(',', '');
    const total = parseFloat(totalTexto);

    // Feedback visual
    btn.disabled = true;
    btn.innerHTML = '⏳ Generando Orden...';

    try {
        // 4. OBTENER CARRITO DEL BACKEND (Tu ruta GET existente)
        const cartResponse = await fetch(CART_API, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const cartData = await cartResponse.json();

        // Validar que existan items antes de seguir
        if (!cartResponse.ok || !cartData.success || !cartData.data || !cartData.data.items || cartData.data.items.length === 0) {
            throw new Error('No se pudo recuperar el carrito o está vacío.');
        }

        // 5. ARMAR DATOS PARA EL CHECKOUT
        // Formatear la dirección bonita para el PDF
        const direccionCompleta = `${calle}, Col. ${colonia}, CP ${cp}, ${ciudad}, ${estado}. Tel: ${telefono}`;
        const itemsDelBackend = cartData.data.items; 
        const totalDelBackend = cartData.data.resumen.total;
        const metodoSeleccionado = document.querySelector('input[name="payment-method"]:checked').value;
        const orderData = {
            // Mapeamos los items
            items: itemsDelBackend.map(item => ({
                id: item.product_id || item.productId || item.id, 
                nombre: item.nombre,
                precio: parseFloat(item.precio),
                cantidad: parseInt(item.cantidad)
            })),
            total: parseFloat(totalDelBackend),
            metodoPago: metodoSeleccionado,
            shippingData: {
                nombre: nombre,
                email: email,
                direccion: direccionCompleta
            },
            captchaToken: captchaResponse
        };

        // console.log("Enviando orden:", orderData); // Debug

        // 6. ENVIAR A TU API DE PROCESAR PAGO (Tu ruta POST)
        const response = await fetch('http://localhost:3000/tech-up/procesar-pago', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData),
        });

        const json = await response.json();

        if (response.ok && json.success) {
            
            // 7. LIMPIAR CARRITO (Tu ruta DELETE existente)
            await fetch(`${CART_API}/clear`, { // Asumo que tu ruta es /clear o la que tengas configurada para borrar
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // 8. ÉXITO
            await Swal.fire({
                title: '¡Compra Exitosa!',
                html: `<p>Orden <strong>#${json.orderId}</strong> generada.</p>
                       <p>Hemos enviado la nota de compra en PDF a tu correo.</p>`,
                icon: 'success',
                confirmButtonText: 'Volver al Inicio',
                background: '#1a202c', color: '#e2e8f0'
            });

            window.location.href = 'index.html';

        } else {
            throw new Error(json.message || 'Error en el servidor');
        }

    } catch (error) {
        console.error(error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo procesar la compra',
            icon: 'error',
            background: '#1a202c', color: '#e2e8f0'
        });
        btn.disabled = false;
        btn.innerHTML = '🔒 Confirmar y Pagar';
        grecaptcha.reset();
    }
}

function validarFormularioPago(metodo) {
    switch (metodo) {
        case 'tarjeta':
            const cardName = document.getElementById('card-name').value.trim();
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvv = document.getElementById('card-cvv').value;
            
            if (!cardName) return { valid: false, message: 'Ingresa el nombre del titular' };
            if (cardNumber.length < 15) return { valid: false, message: 'Número de tarjeta inválido' };
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return { valid: false, message: 'Fecha de expiración inválida (MM/AA)' };
            if (cardCvv.length < 3) return { valid: false, message: 'CVV inválido' };
            
            // Validar fecha no expirada
            const [month, year] = cardExpiry.split('/');
            const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
            if (expDate < new Date()) return { valid: false, message: 'La tarjeta ha expirado' };
            
            return { valid: true };
            
        case 'oxxo':
            const oxxoEmail = document.getElementById('oxxo-email').value.trim();
            if (!oxxoEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(oxxoEmail)) {
                return { valid: false, message: 'Ingresa un correo válido para recibir la referencia' };
            }
            return { valid: true };
            
        case 'transferencia':
            const transferEmail = document.getElementById('transfer-email').value.trim();
            if (!transferEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(transferEmail)) {
                return { valid: false, message: 'Ingresa un correo válido para confirmar tu pago' };
            }
            return { valid: true };
            
        default:
            return { valid: false, message: 'Método de pago no válido' };
    }
}

function obtenerDatosPago(metodo) {
    switch (metodo) {
        case 'tarjeta':
            return {
                titular: document.getElementById('card-name').value,
                numero: document.getElementById('card-number').value.replace(/\s/g, '').slice(-4), // Solo últimos 4
                expiracion: document.getElementById('card-expiry').value
            };
        case 'oxxo':
            return {
                email: document.getElementById('oxxo-email').value
            };
        case 'transferencia':
            return {
                email: document.getElementById('transfer-email').value,
                referencia: document.getElementById('transfer-reference').textContent
            };
        default:
            return {};
    }
}

function mostrarConfirmacionPago(metodo, ordenId, total) {
    let contenidoExtra = '';
    
    switch (metodo) {
        case 'tarjeta':
            contenidoExtra = `
                <p>Tu pago con tarjeta terminada en ****${document.getElementById('card-number').value.slice(-4)} ha sido <strong style="color: #00e5ff;">aprobado</strong>.</p>
            `;
            break;
            
        case 'oxxo':
            const referencia = `OXXO-${ordenId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            contenidoExtra = `
                <p>Presenta este código en cualquier OXXO:</p>
                <div style="background: #1a202c; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px dashed #00e5ff;">
                    <p style="font-size: 1.5rem; font-weight: bold; color: #00e5ff; letter-spacing: 2px;">${referencia}</p>
                </div>
                <p style="font-size: 0.9rem; color: #a0aec0;">Tienes <strong>48 horas</strong> para realizar el pago.<br>
                Se enviará la referencia a: ${document.getElementById('oxxo-email').value}</p>
            `;
            break;
            
        case 'transferencia':
            const ref = document.getElementById('transfer-reference').textContent;
            contenidoExtra = `
                <p>Realiza la transferencia con los siguientes datos:</p>
                <div style="background: #1a202c; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                    <p><strong>Banco:</strong> BBVA México</p>
                    <p><strong>CLABE:</strong> 012180001234567890</p>
                    <p><strong>Referencia:</strong> <span style="color: #00e5ff;">${ref}</span></p>
                    <p><strong>Monto:</strong> $${total.toFixed(2)} MXN</p>
                </div>
                <p style="font-size: 0.9rem; color: #a0aec0;">Confirmaremos tu pago en un máximo de 24 hrs hábiles.</p>
            `;
            break;
    }
    
    Swal.fire({
        title: '¡Pedido Confirmado! 🎉',
        html: `
            <div style="text-align: center;">
                <p style="margin-bottom: 15px;">
                    <strong>Orden #${ordenId}</strong>
                </p>
                ${contenidoExtra}
                <p style="margin-top: 20px; font-size: 0.9rem;">
                    Recibirás un correo con los detalles de tu pedido.
                </p>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Volver a la Tienda',
        confirmButtonColor: '#00e5ff',
        background: '#0a0f18',
        color: '#e2e8f0',
        allowOutsideClick: false
    }).then(() => {
        window.location.href = 'productos.html';
    });
}

// ============================================
// UTILIDADES
// ============================================
function copiarClabe() {
    const clabe = document.getElementById('clabe-number').textContent;
    navigator.clipboard.writeText(clabe).then(() => {
        Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            background: '#1a202c',
            color: '#e2e8f0'
        }).fire({
            icon: 'success',
            title: 'CLABE copiada al portapapeles'
        });
    });
}

function mostrarErrorCheckout(mensaje) {
    const container = document.getElementById('checkout-items');
    if (container) {
        container.innerHTML = `<p style="color: #ff4d4d; text-align: center;">${mensaje}</p>`;
    }
}

console.log('✅ checkout.js cargado correctamente');