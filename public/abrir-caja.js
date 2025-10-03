// frontend/js/abrir-caja.js
document.addEventListener('DOMContentLoaded', () => {
    const abrirCajaForm = document.getElementById('abrir-caja-form');
    
    if (abrirCajaForm) {
        abrirCajaForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Aquí iría la lógica real de la API para registrar la apertura de caja
            
            console.log('Caja abierta. Redirigiendo a la carta...');
            // Redirige a la carta donde ya se pueden ver los productos
            window.location.href = '/carta.html';
        });
    }
});