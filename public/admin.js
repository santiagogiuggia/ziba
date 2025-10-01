document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    // --- Selectores del DOM ---
    const menuListContainer = document.getElementById('menu-list-container');
    // ... (El resto de tus selectores)

    // --- FUNCIONES (Definidas primero para evitar errores) ---
    async function loadMenu() {
        try {
            const response = await fetch('/api/menu');
            const menuData = await response.json();
            renderMenu(menuData);
        } catch (error) {
            console.error("Error al cargar menú:", error);
        }
    }
    
    function renderMenu(menuData) {
        if (!menuListContainer) return;
        menuListContainer.innerHTML = '';
        if (!menuData || menuData.length === 0) {
            menuListContainer.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }
        
        const groupedByCategory = menuData.reduce((acc, category) => {
            acc[category.category] = category.items;
            return acc;
        }, {});

        for (const categoryName in groupedByCategory) {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'admin-category';
            categoryEl.innerHTML = `<h3>${categoryName}</h3>`;
            const productListEl = document.createElement('ul');
            groupedByCategory[categoryName].forEach(item => {
                const itemEl = document.createElement('li');
                itemEl.className = 'admin-product-item';
                itemEl.innerHTML = `<span>${item.name} (Stock: ${item.stock})</span><div class="item-actions"><button class="edit-btn" data-id="${item.id}">Editar</button><button class="delete-btn" data-id="${item.id}">Eliminar</button></div>`;
                productListEl.appendChild(itemEl);
            });
            categoryEl.appendChild(productListEl);
            menuListContainer.appendChild(categoryEl);
        }
    }

    // ... (El resto de tus funciones: loadMpSettings, loadIngredients, etc.)

    // --- FUNCIÓN DE INICIALIZACIÓN PRINCIPAL ---
    async function initializeAdminPage() {
        await loadMenu();
        await loadMpSettings();
        await loadIngredients();
    }

    // --- EVENT LISTENERS ---
    // ... (Todos tus event listeners)

    // --- INICIALIZACIÓN ---
    initializeAdminPage();
});