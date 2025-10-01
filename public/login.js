// La forma más robusta de asegurar que el HTML está listo.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el elemento del formulario por su ID
    const loginForm = document.getElementById('login-form');
    
    // Si el elemento no es nulo, significa que el HTML se cargó y podemos añadir el evento
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Evita que la página se recargue

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                // 2. Enviar la petición al servidor
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                // Si la respuesta no es un 200/201 (ej. un 401 de error), maneja el error.
                if (!response.ok) {
                    const errorData = await response.json();
                    alert('Credenciales inválidas: ' + (errorData.message || 'Error desconocido'));
                    return;
                }

                // 3. Manejar la respuesta exitosa
                const data = await response.json();

                if (data.success) {
                    // El servidor envía la URL de redirección: /abrir-caja.html
                    const redirectUrl = data.redirect || '/abrir-caja.html'; 
                    window.location.href = redirectUrl; 
                } else {
                    alert('Error en el servidor: ' + (data.message || 'Intenta de nuevo'));
                }
            } catch (error) {
                console.error('Error de conexión con la API:', error);
                alert('No se pudo conectar con el servidor.');
            }
        });
    } else {
        // Este mensaje aparecerá en la consola si el ID 'login-form' es incorrecto o falta.
        console.error("CRÍTICO: El script de login no encontró el formulario con ID 'login-form'.");
    }
});