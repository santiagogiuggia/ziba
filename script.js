document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DEL DOM ---
    const menuFiltersDiv = document.getElementById('menu-filters');
    const menuGridDiv = document.getElementById('menu-grid');
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalEl = document.getElementById('order-total');
    const processSaleBtn = document.getElementById('process-sale-btn');
    const currentOrderIdEl = document.getElementById('current-order-id');
    const updateNotification = document.getElementById('update-notification');
    // Modales
    const sizeModal = document.getElementById('size-modal');
    const sizeModalProductName = document.getElementById('size-modal-product-name');
    const sizeModalOptions = document.getElementById('size-modal-options');
    const sizeModalCloseBtn = document.getElementById('size-modal-close');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutTotalAmountEl = document.getElementById('checkout-total-amount');
    const amountReceivedInput = document.getElementById('amount-received');
    const checkoutChangeAmountEl = document.getElementById('checkout-change-amount');
    const checkoutConfirmBtn = document.getElementById('checkout-confirm-btn');
    const checkoutCancelBtn = document.getElementById('checkout-cancel-btn');
    const holdOrderBtn = document.getElementById('hold-order-btn');
    const viewHeldOrdersBtn = document.getElementById('view-held-orders-btn');
    const heldOrdersModal = document.getElementById('held-orders-modal');
    const heldOrdersList = document.getElementById('held-orders-list');
    const heldOrdersCloseBtn = document.getElementById('held-orders-close-btn');

    // --- ESTADO DE LA APLICACIÓN ---
    let currentOrder = [];
    let heldOrders = JSON.parse(localStorage.getItem('cafeHeldOrders')) || [];
    let salesCounter = parseInt(localStorage.getItem('salesCounter')) || 1;
    let menuData = [];

    // --- FUNCIONES ---

    function initializeMenu() {
        const menuInStorage = localStorage.getItem('cafeMenu');
        if (menuInStorage) {
            menuData = JSON.parse(menuInStorage);
        } else {
            const baseMenu = [ /* Tu menú completo va aquí. Asegúrate de que no esté vacío. */ ];
            if (baseMenu.length > 0) {
                baseMenu.forEach(cat => cat.items.forEach(item => item.stock = item.stock || 99));
                localStorage.setItem('cafeMenu', JSON.stringify(baseMenu));
                menuData = baseMenu;
                console.log('Menú inicial creado y guardado en localStorage.');
            }
        }
    }

    function renderMenuGrid() {
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
        if (item.stock <= 0) {
            return;
        }
        const availableSizes = ['pocillo', 'jarro', 'mediano', 'grande'].filter(size => item[size]);
        if (availableSizes.length > 1) {
            openSizeModal(item, availableSizes);
        } else {
            addToOrder(item.name, availableSizes[0], parsePrice(item[availableSizes[0]]), item.id);
        }
    }

    function openSizeModal(item, sizes) {
        sizeModalProductName.textContent = `Seleccionar tamaño para ${item.name}`;
        sizeModalOptions.innerHTML = '';
        sizes.forEach(size => {
            const btn = document.createElement('button');
            const price = item[size];
            btn.textContent = `${size.charAt(0).toUpperCase() + size.slice(1)} - ${price}`;
            btn.addEventListener('click', () => {
                addToOrder(item.name, size, parsePrice(price), item.id);
                closeSizeModal();
            });
            sizeModalOptions.appendChild(btn);
        });
        sizeModal.style.display = 'flex';
    }

    function closeSizeModal() {
        sizeModal.style.display = 'none';
    }

    function addToOrder(name, size, price, productId) {
        const note = prompt(`Añadir nota para ${name} (opcional):`);
        currentOrder.push({ name, size, price, productId, note: note || null });
        updateOrderSummary();
    }

    function updateOrderSummary() {
        orderItemsList.innerHTML = '';
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
    }

    function removeFromOrder(index) {
        currentOrder.splice(index, 1);
        updateOrderSummary();
    }
    
    // ... (Aquí van el resto de tus funciones: processSale, printTicket, holdOrder, etc.)

    // --- INICIALIZACIÓN ---
    initializeMenu();
    renderMenuGrid();
    // ... (resto de la inicialización)
});
