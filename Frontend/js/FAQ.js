document.addEventListener('DOMContentLoaded', () => {

    const questions = document.querySelectorAll('.faq-question');

    // Si no hay preguntas en esta página, no hagas nada.
    if (!questions) return;

    questions.forEach(question => {
        
        question.addEventListener('click', () => {
            // 1. Busca el 'faq-item' padre
            const item = question.closest('.faq-item');
            
            // 2. Comprueba si ya está activo
            const isActive = item.classList.contains('active');
            
            // 3. (Opcional) Cierra todos los demás
            // Comenta esta línea si quieres que se puedan abrir varios
            closeAllAnswers(questions);

            // 4. Abre o cierra el actual
            if (!isActive) {
                // Si estaba cerrado, ábrelo
                item.classList.add('active');
            }
            // Si ya estaba activo, el 'closeAllAnswers' ya lo cerró
        });
    });
});

/**
 * Función (opcional) para cerrar todas las respuestas
 * Esto crea un acordeón donde solo 1 puede estar abierto.
 */
function closeAllAnswers(questions) {
    questions.forEach(q => {
        q.closest('.faq-item').classList.remove('active');
    });
}