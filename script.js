document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DEL DOM (Sin cambios) ---
    const menuFiltersDiv = document.getElementById('menu-filters');
    const menuGridDiv = document.getElementById('menu-grid');
    const orderItemsList = document.getElementById('order-items-list');
    // ... y todos los demás ...

    // --- ESTADO DE LA APLICACIÓN (Sin cambios) ---
    let currentOrder = [];
    let heldOrders = JSON.parse(localStorage.getItem('cafeHeldOrders')) || [];
    let salesCounter = parseInt(localStorage.getItem('salesCounter')) || 1;
    let menuData = [];

    // --- FUNCIONES CON DIAGNÓSTICO ---

    function initializeMenu() {
        console.log("Iniciando sistema...");
        const menuInStorage = localStorage.getItem('cafeMenu');
        if (menuInStorage) {
            menuData = JSON.parse(menuInStorage);
            console.log("Menú cargado desde localStorage.");
        } else {
            console.error("ERROR: No se encontró el menú en localStorage. Por favor, asegúrate de que exista.");
        }
    }

    function renderMenuGrid() {
        // ... (esta función se mantiene igual, ya que la grilla se ve bien) ...
        menuGridDiv.innerHTML = '';
        if (!menuData) return;
        menuData.forEach(category => {
            category.items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.category = category.category;
                const mainPrice = item.mediano || item.jarro || item.pocillo || item.grande;
                card.innerHTML = `<div class="stock-badge-container"></div><h4>${item.name}</h4><div class="price">${mainPrice}</div>`;
                if (item.stock <= 0) {
                    card.classList.add('out-of-stock');
                    card.querySelector('.stock-badge-container').innerHTML = `<span class="stock-badge">Agotado</span>`;
                } else if (item.stock <= 5) {
                    card.classList.add('low-stock');
                    card.querySelector('.stock-badge-container').innerHTML = `<span class="stock-badge">Quedan ${item.stock}</span>`;
                }
                card.addEventListener('click', () => onProductClick(item));
                menuGridDiv.appendChild(card);
            });
        });
    }

    function onProductClick(item) {
        // RASTREADOR 1
        console.log(`1. Clic detectado en producto: ${item.name} (Stock: ${item.stock})`);

        if (item.stock <= 0) {
            console.warn("Acción detenida: El producto no tiene stock.");
            return;
        }
        const availableSizes = ['pocillo', 'jarro', 'mediano', 'grande'].filter(size => item[size]);
        if (availableSizes.length > 1) {
            openSizeModal(item, availableSizes);
        } else if (availableSizes.length === 1) {
            addToOrder(item.name, availableSizes[0], parsePrice(item[availableSizes[0]]), item.id);
        } else {
            console.error("Error: El producto no tiene precios/tamaños definidos.", item);
        }
    }

    function addToOrder(name, size, price, productId) {
        // RASTREADOR 2
        console.log(`2. Añadiendo al pedido: ${name} (${size}) - $${price}`);
        
        const note = prompt(`Añadir nota para ${name} (opcional):`);
        currentOrder.push({ name, size, price, productId, note: note || null });
        
        updateOrderSummary();
    }

    function updateOrderSummary() {
        // RASTREADOR 3
        console.log("3. Actualizando la lista visual del pedido.");
        console.log("Estado actual del pedido:", currentOrder);

        orderItemsList.innerHTML = ''; // Limpia la lista

        if (currentOrder.length === 0) {
            orderItemsList.innerHTML = '<li>Agrega productos al pedido.</li>';
        } else {
            currentOrder.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'order-item';
                const noteHtml = item.note ? `<span class="item-note">Nota: ${item.note}</span>` : '';
                li.innerHTML = `
                    <div>
                        <span>${item.name} (${item.size})</span>
                        ${noteHtml}
                    </div>
                    <div class="item-actions-container">
                        <span class="item-price">${formatCurrency(item.price)}</span>
                        <button data-index="${index}" class="remove-item-btn">X</button>
                    </div>`;
                orderItemsList.appendChild(li);
            });
        }
        
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        orderTotalEl.innerHTML = `<strong>Total: ${formatCurrency(total)}</strong>`;
        
        // RASTREADOR 4
        console.log("4. Lista visual actualizada correctamente.");
    }
    
    // El resto de funciones (parsePrice, formatCurrency, processSale, etc.) se mantienen igual.
    // Asegúrate de tener todas las funciones completas en tu archivo.
    function parsePrice(priceString) { if (!priceString) return 0; return parseFloat(priceString.replace('$', '').replace(/\./g, '')); }
    function formatCurrency(number) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number); }

    // --- INICIALIZACIÓN ---
    initializeMenu();
    renderMenuGrid();
    // ... (asegúrate de que todas las llamadas a funciones de inicialización estén aquí)
});
