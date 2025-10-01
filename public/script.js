document.addEventListener('DOMContentLoaded', () => {
    // Proteger la página
    checkLoginStatus();

    // --- SELECTORES DEL DOM ---
    const menuFiltersDiv = document.getElementById('menu-filters');
    const menuGridDiv = document.getElementById('menu-grid');
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalEl = document.getElementById('order-total');
    // ... (El resto de tus selectores)

    // --- ESTADO DE LA APLICACIÓN ---
    let menuData = [];
    let currentOrder = [];
    
    // --- FUNCIONES ---
    async function initializeMenu() {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) { throw new Error('Error del servidor'); }
            menuData = await response.json();
        } catch (error) {
            console.error("Error al inicializar el menú:", error);
            if (menuGridDiv) {
                menuGridDiv.innerHTML = "<p style='color: red;'>Error al cargar productos. Revisa la consola y el servidor.</p>";
            }
        }
    }

    function renderMenuGrid() {
        if (!menuGridDiv || !menuData) return;
        menuGridDiv.innerHTML = '';
        menuData.forEach(category => {
            if (!category.items) return;
            category.items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.category = category.category;
                const mainPrice = item.mediano || item.grande || item.jarro || item.pocillo;
                card.innerHTML = `<div class="stock-badge-container"></div><h4>${item.name}</h4><div class="price">${mainPrice}</div>`;
                if (item.stock <= 0) {
                    card.classList.add('out-of-stock');
                } else if (item.stock <= 5) {
                    card.classList.add('low-stock');
                }
                card.addEventListener('click', () => onProductClick(item));
                menuGridDiv.appendChild(card);
            });
        });
    }

    // ... (El resto de tus funciones como onProductClick, addToOrder, processSale, etc., van aquí)

    // --- FUNCIÓN DE INICIALIZACIÓN PRINCIPAL ---
    async function start() {
        await initializeMenu(); // ESPERA a que el menú se cargue
        
        // SOLO DESPUÉS, dibuja la interfaz
        renderMenuGrid();
        renderCategoryFilters();
        updateOrderSummary();
        updateCurrentOrderId();
    }
    
    // --- INICIALIZACIÓN ---
    start();
});