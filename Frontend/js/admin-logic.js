document.addEventListener('DOMContentLoaded', () => {

    // --- FILTROS PARA LA TABLA DE PRODUCTOS ---
    const filterSelect = document.getElementById('admin-filter-cat');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const categoria = e.target.value;
            cargarTablaProductos(categoria); // Recargamos con el filtro
        });
    }
    
    // --- 1. PESTAÑAS DEL PANEL ---
    const tabs = document.querySelectorAll('.admin-tab');
    const sections = document.querySelectorAll('.admin-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            const targetId = tab.dataset.target;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 2. CARGAR INVENTARIO AL INICIAR ---
    cargarTablaProductos();

    // --- 3. CONTROL DEL MODAL ---
    const modal = document.getElementById('product-modal');
    const btnAdd = document.getElementById('btn-add-product');
    const btnClose = document.getElementById('close-modal');
    const form = document.getElementById('product-form');

    // Abrir para NUEVO producto
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            form.reset();
            document.getElementById('modal-title').textContent = "Nuevo Producto";
            document.getElementById('prod-id').value = ""; // ID vacío = CREAR
            modal.classList.remove('hidden');
        });
    }

    // Cerrar modal
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Cerrar si clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // --- 4. GUARDAR (CREAR O EDITAR) ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Recolectar datos
            const productData = {
                nombre: document.getElementById('prod-nombre').value,
                precio: parseFloat(document.getElementById('prod-precio').value),
                stock: parseInt(document.getElementById('prod-stock').value),
                categoria: document.getElementById('prod-categoria').value,
                descripcion: document.getElementById('prod-descripcion').value,
                imagen: document.getElementById('prod-imagen').value,
                // IMPORTANTE: Usamos 'en_oferta' como espera tu BD
                en_oferta: document.getElementById('prod-oferta').checked,
                // Generar ID si es nuevo (solo para cumplir requisito de BD si es string)
                product_id: document.getElementById('prod-id').value || `PROD-${Math.floor(Math.random()*10000)}`
            };
    
            const prodId = document.getElementById('prod-id').value;
            
            // LÓGICA DE URLS:
            // Si hay ID -> Es EDITAR (PUT) a la ruta específica
            // Si no hay ID -> Es CREAR (POST) a la ruta base de admin
            let url, method;

            if (prodId) {
                method = 'PUT';
                url = `http://localhost:3000/tech-up/api/admin/products/${prodId}`;
            } else {
                method = 'POST';
                url = 'http://localhost:3000/tech-up/api/admin/products';
            }
    
            try {
                const token = localStorage.getItem('userToken');
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Seguridad Admin
                    },
                    body: JSON.stringify(productData)
                });
    
                const json = await response.json();

                if (response.ok) {
                    Swal.fire('¡Éxito!', 'Producto guardado correctamente', 'success');
                    modal.classList.add('hidden');
                    cargarTablaProductos(); // Refrescar la tabla
                } else {
                    Swal.fire('Error', json.message || 'No se pudo guardar', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Fallo de conexión', 'error');
            }
        });
    }
});
// --- FUNCIONES AUXILIARES ---

// Cargar la tabla (Usa la ruta PÚBLICA porque es solo lectura)
async function cargarTablaProductos(categoria = 'all') {
    const tbody = document.getElementById('admin-products-list');
    const countLabel = document.getElementById('inventory-count'); // Opcional
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Cargando inventario...</td></tr>';

    try {
        // Construimos la URL con el filtro si es necesario
        let url = 'http://localhost:3000/tech-up/api/products';
        if (categoria !== 'all') {
            url += `?categoria=${categoria}`;
        }

        const response = await fetch(url);
        const json = await response.json();

        if (json.success) {
            tbody.innerHTML = ''; 
            
            // Actualizar contador visual (Opcional)
            if (countLabel) countLabel.textContent = `Mostrando: ${json.total} productos`;

            if (json.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">No hay productos en esta categoría.</td></tr>';
                return;
            }

            json.data.forEach(prod => {
                const tr = document.createElement('tr');
                const esOferta = (prod.en_oferta === 1 || prod.en_oferta === true);
                
                tr.innerHTML = `
                    <td><span style="color:var(--color-primary)">#${prod.id}</span></td>
                    <td><img src="${prod.imagen || 'assets/images/placeholder.jpg'}" alt="img" style="width:40px; height:40px; object-fit:cover; border-radius:4px; border:1px solid var(--color-border);"></td>
                    <td>
                        <div style="font-weight:600;">${prod.nombre}</div>
                        ${esOferta ? '<span style="color:#00e5ff; font-size:0.75rem; background:rgba(0,229,255,0.1); padding:2px 6px; border-radius:4px;">OFERTA</span>' : ''}
                    </td>
                    <td><span style="background:var(--color-background); padding:4px 8px; border-radius:4px; font-size:0.85rem;">${prod.categoria}</span></td>
                    <td style="font-family:monospace; font-size:1rem;">$${parseFloat(prod.precio).toFixed(2)}</td>
                    <td>
                        <span style="color:${prod.stock < 5 ? '#ff4d4d' : 'inherit'}; font-weight:${prod.stock < 5 ? 'bold' : 'normal'}">
                            ${prod.stock}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn btn-edit" onclick="editarProducto(${prod.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="eliminarProducto(${prod.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#ff4d4d;">Error de conexión con el servidor</td></tr>';
    }
};


// Eliminar Producto (Usa ruta ADMIN)
window.eliminarProducto = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        background: '#1a202c', color: '#e2e8f0'
    });

    if (result.isConfirmed) {
        try {
            const token = localStorage.getItem('userToken');
            // Ruta de Admin para borrar
            const response = await fetch(`http://localhost:3000/tech-up/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                Swal.fire('Eliminado', 'Producto eliminado.', 'success');
                cargarTablaProductos();
            } else {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Fallo de red', 'error');
        }
    }
};

// Editar Producto (Carga datos de ruta PÚBLICA, prepara form para PUT)
window.editarProducto = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/tech-up/api/products/${id}`);
        const json = await response.json();

        if (json.success) {
            const prod = json.data;
            
            // Llenar el formulario
            document.getElementById('prod-id').value = prod.id; // Guardamos el ID numérico
            document.getElementById('prod-nombre').value = prod.nombre;
            document.getElementById('prod-precio').value = prod.precio;
            document.getElementById('prod-stock').value = prod.stock;
            document.getElementById('prod-categoria').value = prod.categoria;
            document.getElementById('prod-descripcion').value = prod.descripcion;
            document.getElementById('prod-imagen').value = prod.imagen;
            
            // Checkbox de oferta
            document.getElementById('prod-oferta').checked = (prod.en_oferta === 1 || prod.en_oferta === true);

            // Cambiar título y mostrar modal
            document.getElementById('modal-title').textContent = "Editar Producto";
            document.getElementById('product-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar el producto', 'error');
    }
};