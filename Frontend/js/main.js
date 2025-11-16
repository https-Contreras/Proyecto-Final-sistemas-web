// 1. Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // Llama a la función principal para cargar y mostrar productos
    cargarProductos();
    
    
    // ##### INICIO DE LA SECCIÓN DE FILTROS #####
    
    // 1. Seleccionamos los filtros
    const filtroCategoria = document.getElementById('filter-categoria');
    const filtroPrecio = document.getElementById('filter-precio');
    const filtroOferta = document.getElementById('filter-oferta');

    // 2. Creamos una función para "escuchar" los cambios
    function handleFilterChange() {
        const filtrosSeleccionados = {
            categoria: filtroCategoria.value,
            precio: filtroPrecio.value,
            oferta: filtroOferta.checked // .checked nos da true o false
        };
        
        console.log("FILTROS CAMBIARON:", filtrosSeleccionados);
        
        // ¡PRÓXIMO PASO!
        // Aquí es donde llamaríamos de nuevo a la API o
        // filtraríamos los productos que ya tenemos.
        // Ej: cargarProductos(filtrosSeleccionados);
    }

    // 3. Agregamos los 'listeners'
    // (Nos aseguramos de que existan antes de agregar el listener,
    //  así este script no dará error en otras páginas como index.html)
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
 * 2. Carga los productos (simulando una llamada a la API)
 * * Usamos async/await para simular cómo funcionará 'fetch'
 * cuando conectemos el backend real.
 */
async function cargarProductos() {
    
    // Verificamos que el contenedor de productos exista en esta página
    const productListElement = document.getElementById('product-list');
    if (!productListElement) {
        // Si no existe (ej. estamos en index.html), no hacemos nada.
        return;
    }

    try {
        // --- SIMULACIÓN DE DATOS DEL BACKEND ---
        // Cuando tu backend esté listo, reemplazarás todo este bloque
        // por algo como:
        // const respuesta = await fetch('http://tu-api.com/api/productos');
        // const productos = await respuesta.json();

        // Por ahora, usamos datos "quemados" (hardcodeados)
        const productosSimulados = [
            {
                id: 1,
                nombre: "Laptop Gamer Avanzada",
                descripcion: "Core i9, 32GB RAM, SSD 2TB, RTX 4080",
                precio: 48500.00,
                imagen: "assets/images/laptop-gamer.jpg" // Asegúrate de tener esta imagen de prueba
            },
            {
                id: 2,
                nombre: "Estación de Trabajo (Desktop)",
                descripcion: "Threadripper, 64GB RAM, SSD 4TB, Quadro RTX A4000",
                precio: 89900.00,
                imagen: "assets/images/desktop-workstation.jpg"
            },
            {
                id: 3,
                nombre: "Monitor Curvo Ultrawide 49\"",
                descripcion: "Panel OLED, 240Hz, 1ms respuesta",
                precio: 21200.00,
                imagen: "assets/images/monitor-ultrawide.jpg"
            },
            {
                id: 4,
                nombre: "Teclado Mecánico RGB",
                descripcion: "Switches ópticos, layout completo, reposamuñecas",
                precio: 3100.00,
                imagen: "assets/images/teclado-mecanico.jpg"
            }
        ];
        // --- FIN DE LA SIMULACIÓN ---
        
        // 3. Llama a la función que "dibuja" los productos en el HTML
        mostrarProductos(productosSimulados);

    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}


/**
 * 4. Dibuja las tarjetas de producto en el DOM
 * @param {Array} productos - El listado de productos a mostrar
 */
function mostrarProductos(productos) {
    // 1. Obtenemos el contenedor donde irán los productos
    const productListElement = document.getElementById('product-list');
    
    // 2. Limpiamos cualquier contenido previo (como un "Cargando...")
    productListElement.innerHTML = '';

    // 3. Recorremos el arreglo de productos
    productos.forEach(producto => {
        
        // 4. Creamos un nuevo elemento 'article' por cada producto
        const card = document.createElement('article');
        card.classList.add('product-card'); // Le ponemos la clase CSS

        // 5. Generamos el HTML interno de la tarjeta (¡Esta es la magia!)
        // Usamos template literals (comillas ``) para insertar variables
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                
                <p class="product-price">$${producto.precio.toFixed(2)}</p>
                
                <button class="add-to-cart-btn" data-product-id="${producto.id}">
                    Agregar al carrito
                </button>
            </div>
        `;

        // 6. Añadimos la tarjeta recién creada al contenedor en el HTML
        productListElement.appendChild(card);
    });
}