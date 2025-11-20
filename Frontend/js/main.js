// 📁 Frontend/js/main.js

// ============================================
// 🔐 FUNCIONES DE AUTENTICACIÓN
// ============================================

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function isUserLoggedIn() {
    const token = getAuthToken();
    return token !== null && token !== '';
}

// ============================================
// 🛒 FUNCIONES DEL CARRITO
// ============================================

function getLocalCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], cupon_aplicado: null, descuento: 0 };
}

function saveLocalCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToLocalCart(producto) {
    const cart = getLocalCart();
    
    const existingIndex = cart.items.findIndex(item => item.product_id === producto.product_id);
    
    if (existingIndex !== -1) {
        cart.items[existingIndex].cantidad += producto.cantidad;
    } else {
        cart.items.push(producto);
    }
    
    saveLocalCart(cart);
}

/**
 * Agregar producto al carrito (con validación del backend)
 */
async function agregarAlCarrito(productId, productData) {
    // Verificar que el usuario esté logueado
    if (!isUserLoggedIn()) {
        alert('⚠️ Debes iniciar sesión para agregar productos al carrito');
        window.location.href = '/Frontend/login.html';
        return;
    }
    
    try {
        // Validar con el backend
        const response = await fetch('http://localhost:3000/tech-up/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                product_id: productId,
                cantidad: 1
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Agregar al localStorage
            addToLocalCart(data.producto);
            
            alert(`✅ ${data.producto.nombre} agregado al carrito`);
        } else {
            alert('⚠️ ' + data.message);
        }
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        alert('❌ Error al agregar el producto. Por favor, intenta de nuevo.');
    }
}

// ============================================
// 📦 FUNCIONES DE PRODUCTOS
// ============================================

// 1. Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // Llama a la función principal para cargar y mostrar productos
    cargarProductos();
    
    // ##### INICIO DE LA SECCIÓN DE FILTROS #####
    
    const filtroCategoria = document.getElementById('filter-categoria');
    const filtroPrecio = document.getElementById('filter-precio');
    const filtroOferta = document.getElementById('filter-oferta');

    function handleFilterChange() {
        const filtrosSeleccionados = {
            categoria: filtroCategoria.value,
            precio: filtroPrecio.value,
            oferta: filtroOferta.checked
        };
        
        console.log("FILTROS CAMBIARON:", filtrosSeleccionados);
        
        cargarProductos(filtrosSeleccionados);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', handleFilterChange);
    }
    if (filtroPrecio) {
        filtroPrecio.addEventListener('change', handleFilterChange);
    }
    if (filtroOferta) {
        filtroOferta.addEventListener('change', handleFilterChange);
    }
    
    // ##### FIN DE LA SECCIÓN DE FILTROS #####
});

/**
 * 2. Carga los productos desde el backend
 */
async function cargarProductos(filtros = {}) {
    
    const productListElement = document.getElementById('product-list');
    if (!productListElement) {
        return;
    }

    try {
        // Construir query params para los filtros
        let queryParams = '';
        if (filtros.categoria && filtros.categoria !== 'all') {
            queryParams += `?categoria=${filtros.categoria}`;
        }
        if (filtros.oferta) {
            queryParams += queryParams ? '&oferta=1' : '?oferta=1';
        }
        
        // 🔄 LLAMAR A LA API REAL DEL BACKEND
        const response = await fetch(`http://localhost:3000/tech-up/api/productos${queryParams}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            let productos = data.productos;
            
            // Filtrar por precio en el frontend (opcional)
            if (filtros.precio && filtros.precio !== 'all') {
                productos = filtrarPorPrecio(productos, filtros.precio);
            }
            
            mostrarProductos(productos);
        } else {
            console.error('Error al cargar productos:', data.message);
            productListElement.innerHTML = '<p>Error al cargar productos</p>';
        }

    } catch (error) {
        console.error("Error al cargar los productos:", error);
        productListElement.innerHTML = '<p>Error de conexión. Intenta de nuevo más tarde.</p>';
    }
}

/**
 * Filtrar productos por rango de precio
 */
function filtrarPorPrecio(productos, rangoPrecio) {
    if (rangoPrecio === '0-10000') {
        return productos.filter(p => p.precio <= 10000);
    } else if (rangoPrecio === '10001-30000') {
        return productos.filter(p => p.precio > 10000 && p.precio <= 30000);
    } else if (rangoPrecio === '30001+') {
        return productos.filter(p => p.precio > 30000);
    }
    return productos;
}

/**
 * 4. Dibuja las tarjetas de producto en el DOM
 */
function mostrarProductos(productos) {
    const productListElement = document.getElementById('product-list');
    
    productListElement.innerHTML = '';

    if (productos.length === 0) {
        productListElement.innerHTML = '<p>No se encontraron productos con los filtros seleccionados.</p>';
        return;
    }

    productos.forEach(producto => {
        
        const card = document.createElement('article');
        card.classList.add('product-card');

        // Badge de oferta si aplica
        const badgeOferta = producto.en_oferta ? '<span class="badge-oferta">🔥 OFERTA</span>' : '';
        
        // Stock disponible
        const stockInfo = producto.stock > 0 
            ? `<p class="product-stock">Stock: ${producto.stock}</p>` 
            : '<p class="product-stock out-of-stock">Agotado</p>';

        card.innerHTML = `
            ${badgeOferta}
            <div class="product-image-container">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion || ''}</p>
                
                <p class="product-price">$${parseFloat(producto.precio).toFixed(2)}</p>
                ${stockInfo}
                
                <button class="add-to-cart-btn" 
                        data-product-id="${producto.product_id}"
                        data-product-name="${producto.nombre}"
                        data-product-price="${producto.precio}"
                        data-product-image="${producto.imagen}"
                        data-product-stock="${producto.stock}"
                        ${producto.stock === 0 ? 'disabled' : ''}>
                    ${producto.stock === 0 ? 'Sin Stock' : 'Agregar al carrito'}
                </button>
            </div>
        `;

        productListElement.appendChild(card);
    });
    
    // ⭐ AGREGAR EVENT LISTENERS A LOS BOTONES DE AGREGAR AL CARRITO
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.dataset.productId;
            const productData = {
                product_id: productId,
                nombre: e.target.dataset.productName,
                precio: parseFloat(e.target.dataset.productPrice),
                imagen: e.target.dataset.productImage,
                stock_disponible: parseInt(e.target.dataset.productStock)
            };
            
            await agregarAlCarrito(productId, productData);
        });
    });
}