function checkLoginStatus() {
    if (sessionStorage.getItem('userLoggedIn') !== 'true') {
        if (!window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

function logout() {
    sessionStorage.removeItem('userLoggedIn');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (sessionStorage.getItem('userLoggedIn') === 'true' && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('login-error');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            errorEl.textContent = 'Verificando...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    sessionStorage.setItem('userLoggedIn', 'true');
                    window.location.href = 'index.html';
                } else {
                    errorEl.textContent = result.message || 'Error al iniciar sesión.';
                }
            } catch (error) {
                errorEl.textContent = 'Error de conexión con el servidor. Intenta de nuevo.';
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
    
    if (!window.location.pathname.endsWith('login.html')) {
        checkLoginStatus();
    }
});