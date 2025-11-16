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
        } else {
            console.warn(`No se encontró el elemento con ID: ${elementId}`);
        }
    } catch (error) {
        console.error(`No se pudo cargar el componente: ${error}`);
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