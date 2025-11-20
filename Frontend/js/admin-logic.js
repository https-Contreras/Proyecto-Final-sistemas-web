document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Manejo de Pestañas (Tabs) ---
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

    // --- 2. Cargar Productos al iniciar ---
    cargarTablaProductos();

    // --- 3. Lógica del Modal (Abrir/Cerrar) ---
    const modal = document.getElementById('product-modal');
    const btnAdd = document.getElementById('btn-add-product');
    const btnClose = document.getElementById('close-modal');
    const form = document.getElementById('product-form');

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            form.reset();
            document.getElementById('modal-title').textContent = "Nuevo Producto";
            document.getElementById('prod-id').value = ""; 
            modal.classList.remove('hidden');
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // --- 4. Guardar Producto (Crear/Editar) ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const productData = {
                nombre: document.getElementById('prod-nombre').value,
                precio: parseFloat(document.getElementById('prod-precio').value),
                stock: parseInt(document.getElementById('prod-stock').value),
                categoria: document.getElementById('prod-categoria').value,
                descripcion: document.getElementById('prod-descripcion').value,
                imagen: document.getElementById('prod-imagen').value,
                oferta: document.getElementById('prod-oferta').checked
            };
    
            const prodId = document.getElementById('prod-id').value;
            const method = prodId ? 'PUT' : 'POST';
            // Ajusta la URL a tu estructura de rutas (/api o /tech-up/api)
            const url = prodId 
                ? `http://localhost:3000/tech-up/api/admin/products/${prodId}`
                : 'http://localhost:3000/tech-up/api/admin/products';
    
            try {
                const token = localStorage.getItem('userToken');
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(productData)
                });
    
                if (response.ok) {
                    Swal.fire('¡Éxito!', 'Producto guardado correctamente', 'success');
                    modal.classList.add('hidden');
                    cargarTablaProductos();
                } else {
                    Swal.fire('Error', 'No se pudo guardar el producto', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Fallo de conexión', 'error');
            }
        });
    }
});

// --- FUNCIONES AUXILIARES ---

async function cargarTablaProductos() {
    const tbody = document.getElementById('admin-products-list');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando...</td></tr>';

    try {
        const response = await fetch('http://localhost:3000/tech-up/api/products');
        const json = await response.json();

        if (json.success) {
            tbody.innerHTML = ''; 

            json.data.forEach(prod => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${prod.id}</td>
                    <td><img src="${prod.imagen || 'assets/images/placeholder.jpg'}" alt="img"></td>
                    <td>${prod.nombre}</td>
                    <td>${prod.categoria}</td>
                    <td>$${parseFloat(prod.precio).toFixed(2)}</td>
                    <td>${prod.stock || 0}</td>
                    <td>
                        <button class="action-btn btn-edit" onclick="editarProducto(${prod.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="eliminarProducto(${prod.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error al cargar datos</td></tr>';
    }
}

window.eliminarProducto = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
        try {
            const token = localStorage.getItem('userToken');
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
        }
    }
};

// Falta lógica completa de editar (fetch single product -> fill inputs)
window.editarProducto = async (id) => {
    console.log("Editar", id);
    Swal.fire('Pendiente', 'Lógica de edición en construcción', 'info');
};