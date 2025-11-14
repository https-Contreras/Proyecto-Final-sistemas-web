document.addEventListener('DOMContentLoaded', () => {

    const cartListElement = document.getElementById('cart-items-list');
    
    // Si no estamos en la página del carrito, no hagas nada.
    if (!cartListElement) return;

    cargarCarrito();
});

async function cargarCarrito() {
    // --- SIMULACIÓN DE DATOS ---
    // En un futuro, esto vendría de localStorage o de la API
    const carritoSimulado = [
        {
            id: 1,
            nombre: "Laptop Gamer Avanzada",
            precio: 48500.00,
            imagen: "assets/images/laptop-gamer.jpg",
            cantidad: 1
        },
        {
            id: 4,
            nombre: "Teclado Mecánico RGB",
            precio: 3100.00,
            imagen: "assets/images/teclado-mecanico.jpg",
            cantidad: 2
        }
    ];
    // --- FIN DE SIMULACIÓN ---
    
    mostrarItemsCarrito(carritoSimulado);
    actualizarTotales(carritoSimulado);
}

function mostrarItemsCarrito(carrito) {
    const cartListElement = document.getElementById('cart-items-list');
    cartListElement.innerHTML = ''; // Limpiamos

    if (carrito.length === 0) {
        cartListElement.innerHTML = '<p>Tu carrito está vacío.</p>';
        return;
    }

    carrito.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        
        const subtotalItem = item.precio * item.cantidad;

        itemElement.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.nombre}</h4>
                <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
                <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
            </div>
            <div class="cart-item-controls">
                <label for="qty-${item.id}">Cantidad:</label>
                <input type."number" id="qty-${item.id}" class="cart-item-qty" value="${item.cantidad}" min="1" data-id="${item.id}">
                <p class="cart-item-subtotal">Subtotal: $${subtotalItem.toFixed(2)}</p>
            </div>
        `;
        cartListElement.appendChild(itemElement);
    });
}

function actualizarTotales(carrito) {
    // Calculamos el subtotal sumando los precios de los items
    const subtotal = carrito.reduce((acc, item) => {
        return acc + (item.precio * item.cantidad);
    }, 0);

    const total = subtotal; // (Aquí sumaríamos envío, impuestos, etc.)

    // Actualizamos el HTML del resumen
    document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
}