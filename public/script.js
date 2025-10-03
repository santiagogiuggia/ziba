document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();

    // --- Selectores del DOM ---
    const menuGridDiv = document.getElementById('menu-grid');
    // ... (El resto de tus selectores)

    // --- FUNCIONES (Definidas primero para evitar errores) ---
    async function initializeMenu() {
        try {
            const response = await fetch('/api/menu');
            const menuData = await response.json();
            renderMenuGrid(menuData);
        } catch (error) {
            console.error("Error al inicializar el menú:", error);
        }
    }

    function renderMenuGrid(menuData) {
        if (!menuGridDiv || !menuData) return;
        menuGridDiv.innerHTML = '';
        // ... (resto de la lógica para dibujar la grilla de productos)
    }

    // ... (El resto de tus funciones: onProductClick, addToOrder, processSale, etc.)

    // --- FUNCIÓN DE INICIALIZACIÓN PRINCIPAL ---
    async function start() {
        await initializeMenu();
        renderCategoryFilters();
        updateOrderSummary();
        updateCurrentOrderId();
    }

    // --- EVENT LISTENERS ---
    // ... (Todos tus event listeners)

    // --- INICIALIZACIÓN ---
    start();
});