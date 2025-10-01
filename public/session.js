async function checkActiveSession() {
    try {
        const response = await fetch('/api/caja/activa');
        const data = await response.json();

        if (data.activa) {
            // Si hay una sesión activa, guardamos los datos y continuamos
            sessionStorage.setItem('cajaActiva', 'true');
            sessionStorage.setItem('cajero', data.sesion.cajero);
            sessionStorage.setItem('barista', data.sesion.barista);
            // Si estamos en la página de abrir caja, redirigimos al POS
            if (window.location.pathname.endsWith('abrir-caja.html')) {
                window.location.href = 'index.html';
            }
        } else {
            // Si NO hay sesión activa, redirigimos a la página de abrir caja
            sessionStorage.removeItem('cajaActiva');
            if (!window.location.pathname.endsWith('abrir-caja.html')) {
                window.location.href = 'abrir-caja.html';
            }
        }
    } catch (error) {
        console.error("Error al verificar la sesión de caja:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const abrirCajaForm = document.getElementById('abrir-caja-form');

    if (abrirCajaForm) {
        abrirCajaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const monto_inicial = document.getElementById('monto_inicial').value;
            const cajero = document.getElementById('cajero').value;
            const barista = document.getElementById('barista').value;
            const errorEl = document.getElementById('abrir-caja-error');

            try {
                const response = await fetch('/api/caja/abrir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ monto_inicial, cajero, barista }),
                });
                const result = await response.json();
                if (result.success) {
                    await checkActiveSession(); // Re-verificar para guardar datos y redirigir
                } else {
                    errorEl.textContent = result.error || "No se pudo abrir la caja.";
                }
            } catch (error) {
                errorEl.textContent = "Error de conexión con el servidor.";
            }
        });
    }

    // Ejecutar la verificación en cada carga de página
    checkActiveSession();
});