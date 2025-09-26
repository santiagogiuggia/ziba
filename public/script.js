document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DEL DOM ---
    const menuFiltersDiv = document.getElementById('menu-filters');
    const menuGridDiv = document.getElementById('menu-grid');
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalEl = document.getElementById('order-total');
    const processSaleBtn = document.getElementById('process-sale-btn');
    const currentOrderIdEl = document.getElementById('current-order-id');
    const updateNotification = document.getElementById('update-notification');
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
            const baseMenu = [
                {
                    category: 'CAFÉ',
                    items: [
                        { id: 1, name: 'Espresso', pocillo: '$2.900', jarro: '$3.200' }, { id: 2, name: 'Doppio', pocillo: '$3.200', jarro: '$3.600' }, { id: 3, name: 'Americano', jarro: '$3.200', mediano: '$2.800', grande: '$3.000' }, { id: 4, name: 'Long Black', jarro: '$3.200', grande: '$3.200' }
                    ]
                },
                {
                    category: 'CAFÉ MÁS LECHE',
                    items: [
                        { id: 5, name: 'Espresso Macchiato', pocillo: '$2.100' }, { id: 6, name: 'Cortado', pocillo: '$2.700', jarro: '$2.900', mediano: '$3.100', grande: '$3.400' }, { id: 7, name: 'Flat White', jarro: '$3.300', mediano: '$3.600' }, { id: 8, name: 'Latte', jarro: '$3.000', mediano: '$3.200' }, { id: 9, name: 'Capuccino', jarro: '$3.100', mediano: '$3.300' }, { id: 10, name: 'Latte Saborizado', jarro: '$3.300', mediano: '$3.600' }
                    ]
                },
                {
                    category: 'BEBIDAS FRIAS',
                    items: [
                        { id: 11, name: 'Café Americano Frío', mediano: '$3.100' }, { id: 12, name: 'Latte Frío', mediano: '$3.400' }, { id: 13, name: 'Latte Saborizado Frío', mediano: '$3.700' }, { id: 14, name: 'Licuado de Banana', mediano: '$3.400' }, { id: 15, name: 'Licuado de Frutilla', mediano: '$3.800' }, { id: 16, name: 'Licuado de Durazno', mediano: '$3.500' }, { id: 17, name: 'Jugo de Naranja', mediano: '$2.800' }, { id: 18, name: 'Café Tonic', mediano: '$3.600' }, { id: 19, name: 'Café Tonic con Naranja', mediano: '$3.400' }
                    ]
                },
                {
                    category: 'PANADERÍA',
                    items: [
                        { id: 20, name: 'Medialuna', mediano: '$900' }, { id: 21, name: 'Criollo', mediano: '$600' }, { id: 22, name: 'Scon de Queso', mediano: '$1.400' }, { id: 23, name: 'Croissant', mediano: '$1.500' }, { id: 24, name: 'Croissant Bicolor', mediano: '$1.800' }, { id: 25, name: 'Croissant Jamón y Queso', mediano: '$2.700' }
                    ]
                },
                {
                    category: 'PASTELERÍA',
                    items: [
                        { id: 26, name: 'Budín Naranja y Choco', mediano: '$2.000' }, { id: 27, name: 'Budín Limón y Amapola', mediano: '$2.000' }, { id: 28, name: 'Brownie con Nuez', mediano: '$2.200' }, { id: 29, name: 'Alfajor de Fruta', mediano: '$1.800' }, { id: 30, name: 'Alfajor DDL Chocolate', mediano: '$2.000' }, { id: 31, name: 'Pasta Frola', mediano: '$2.200' }, { id: 32, name: 'Roll de Canela', mediano: '$2.200' }, { id: 33, name: 'Carrot Cake', mediano: '$2.500' }
                    ]
                },
                {
                    category: 'COMBOS',
                    items: [
                        { id: 34, name: 'Combo: 1 Medialuna + 1 Criollo', mediano: '$2.800', grande: '$3.200' }, { id: 35, name: 'Combo: 2 Medialunas', mediano: '$3.100', grande: '$3.500' }, { id: 36, name: 'Combo: Roll de Canela', mediano: '$3.800', grande: '$4.200' }, { id: 37, name: 'Combo: Croissant', mediano: '$3.400', grande: '$3.800' }
                    ]
                },
                {
                    category: 'EXTRAS',
                    items: [
                        { id: 38, name: 'Shot Extra de Café', mediano: '$400' }, { id: 39, name: 'Shot Extra de Syrup', mediano: '$400' }, { id: 40, name: 'Syrup (Vainilla, Caramelo, etc)', mediano: '$400' }
                    ]
                }
            ];
            baseMenu.forEach(cat => cat.items.forEach(item => item.stock = item.stock || 99));
            localStorage.setItem('cafeMenu', JSON.stringify(baseMenu));
            menuData = baseMenu;
        }
    }

    function renderMenuGrid() {
        if (!menuGridDiv) return;
        menuGridDiv.innerHTML = '';
        if (!menuData) return;
        menuData.forEach(category => {
            if (!category.items) return;
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

    function renderCategoryFilters() {
        if (!menuFiltersDiv || !menuData) return;
        const categories = ['Todos', ...new Set(menuData.map(c => c.category))];
        menuFiltersDiv.innerHTML = '';
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.textContent = category;
            btn.dataset.category = category;
            if (category === 'Todos') btn.classList.add('active');
            btn.addEventListener('click', () => filterMenu(category));
            menuFiltersDiv.appendChild(btn);
        });
    }

    function filterMenu(category) {
        document.querySelectorAll('#menu-filters button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`#menu-filters button[data-category="${category}"]`).classList.add('active');
        document.querySelectorAll('.product-card').forEach(card => {
            if (category === 'Todos' || card.dataset.category === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    function onProductClick(item) {
        if (item.stock <= 0) return;
        const availableSizes = ['pocillo', 'jarro', 'mediano', 'grande'].filter(size => item[size]);
        if (availableSizes.length > 1) {
            openSizeModal(item, availableSizes);
        } else if (availableSizes.length === 1) {
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
        if (!orderItemsList || !orderTotalEl) return;
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

    function processSale() {
        if (currentOrder.length === 0) return;
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        currentOrder.forEach(orderItem => {
            for (const category of menuData) {
                const product = category.items.find(p => p.id === orderItem.productId);
                if (product) {
                    product.stock -= 1;
                    break;
                }
            }
        });
        saveMenuData();
        const sale = { id: salesCounter, date: new Date().toISOString(), items: currentOrder, total: total };
        const salesHistory = JSON.parse(localStorage.getItem('cafeSales')) || [];
        salesHistory.push(sale);
        localStorage.setItem('cafeSales', JSON.stringify(salesHistory));
        salesCounter++;
        localStorage.setItem('salesCounter', salesCounter);
        printTicket(sale);
        currentOrder = [];
        updateOrderSummary();
        updateCurrentOrderId();
        closeCheckoutModal();
        renderMenuGrid();
    }
    
    function saveMenuData() { localStorage.setItem('cafeMenu', JSON.stringify(menuData)); }
    function printTicket(sale) { /* Lógica de impresión */ }
    function startCheckout() {
        if (currentOrder.length === 0) { alert('El pedido está vacío.'); return; }
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        checkoutTotalAmountEl.textContent = formatCurrency(total);
        amountReceivedInput.value = '';
        checkoutChangeAmountEl.textContent = formatCurrency(0);
        checkoutModal.style.display = 'flex';
        amountReceivedInput.focus();
    }
    function closeCheckoutModal() { checkoutModal.style.display = 'none'; }
    function updateChange() {
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        const received = parseFloat(amountReceivedInput.value) || 0;
        const change = received - total;
        checkoutChangeAmountEl.textContent = formatCurrency(change < 0 ? 0 : change);
    }
    function holdOrder() {
        if (currentOrder.length === 0) { alert('No hay ningún producto para guardar.'); return; }
        const heldOrder = { id: Date.now(), time: new Date().toLocaleTimeString('es-AR'), items: currentOrder };
        heldOrders.push(heldOrder);
        localStorage.setItem('cafeHeldOrders', JSON.stringify(heldOrders));
        alert(`Pedido guardado a las ${heldOrder.time}.`);
        currentOrder = [];
        updateOrderSummary();
    }
    function showHeldOrdersModal() {
        heldOrdersList.innerHTML = '';
        if (heldOrders.length === 0) {
            heldOrdersList.innerHTML = '<li>No hay pedidos en espera.</li>';
        } else {
            heldOrders.forEach(order => {
                const total = order.items.reduce((sum, item) => sum + item.price, 0);
                const li = document.createElement('li');
                li.dataset.orderId = order.id;
                li.innerHTML = `<div><div class="held-order-info">Pedido de las ${order.time}</div><div class="held-order-details">${order.items.length} productos - ${formatCurrency(total)}</div></div><button class="recall-btn">Recuperar</button>`;
                heldOrdersList.appendChild(li);
            });
        }
        heldOrdersModal.style.display = 'flex';
    }
    function recallOrder(orderId) {
        if (currentOrder.length > 0 && !confirm('Tienes un pedido activo. ¿Quieres descartarlo para recuperar el pedido guardado?')) { return; }
        const orderIndex = heldOrders.findIndex(order => order.id === orderId);
        if (orderIndex > -1) {
            currentOrder = heldOrders[orderIndex].items;
            heldOrders.splice(orderIndex, 1);
            localStorage.setItem('cafeHeldOrders', JSON.stringify(heldOrders));
            updateOrderSummary();
            closeHeldOrdersModal();
        }
    }
    function closeHeldOrdersModal() { heldOrdersModal.style.display = 'none'; }
    function parsePrice(priceString) { if (!priceString) return 0; return parseFloat(String(priceString).replace('$', '').replace(/\./g, '')); }
    function formatCurrency(number) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number); }
    function updateCurrentOrderId() { if (currentOrderIdEl) currentOrderIdEl.textContent = salesCounter; }
    function showUpdateNotification() {
        updateNotification.classList.remove('hidden');
        updateNotification.classList.add('show');
        setTimeout(() => {
            updateNotification.classList.remove('show');
            setTimeout(() => { updateNotification.classList.add('hidden'); }, 500);
        }, 3000);
    }

    // --- EVENT LISTENERS ---
    orderItemsList.addEventListener('click', (e) => { if (e.target.classList.contains('remove-item-btn')) { removeFromOrder(e.target.dataset.index); } });
    if(processSaleBtn) processSaleBtn.addEventListener('click', startCheckout);
    if(checkoutConfirmBtn) checkoutConfirmBtn.addEventListener('click', processSale);
    if(checkoutCancelBtn) checkoutCancelBtn.addEventListener('click', closeCheckoutModal);
    if(amountReceivedInput) amountReceivedInput.addEventListener('input', updateChange);
    if(sizeModalCloseBtn) sizeModalCloseBtn.addEventListener('click', closeSizeModal);
    if(holdOrderBtn) holdOrderBtn.addEventListener('click', holdOrder);
    if(viewHeldOrdersBtn) viewHeldOrdersBtn.addEventListener('click', showHeldOrdersModal);
    if(heldOrdersCloseBtn) heldOrdersCloseBtn.addEventListener('click', closeHeldOrdersModal);
    if(heldOrdersList) heldOrdersList.addEventListener('click', (e) => { if (e.target.classList.contains('recall-btn')) { recallOrder(parseInt(e.target.closest('li').dataset.orderId)); } });
    window.addEventListener('storage', (event) => { if (event.key === 'cafeMenu') { showUpdateNotification(); initializeMenu(); renderMenuGrid(); } });

    // --- INICIALIZACIÓN ---
    initializeMenu();
    renderMenuGrid();
    renderCategoryFilters();
    updateOrderSummary();
    updateCurrentOrderId();
});

// En /public/script.js

document.addEventListener('DOMContentLoaded', () => {
    // ... (Todos tus selectores se mantienen igual) ...

    let currentOrder = [];
    let salesCounter = parseInt(localStorage.getItem('salesCounter')) || 1; // Las ventas pueden seguir en localStorage por ahora
    let menuData = [];

    // ==================================================================
    // FUNCIÓN initializeMenu MODIFICADA PARA USAR EL BACKEND
    // ==================================================================
    async function initializeMenu() {
        try {
            // Hacemos una petición a nuestro servidor para obtener el menú
            const response = await fetch('/api/menu');
            if (!response.ok) {
                throw new Error('No se pudo cargar el menú desde el servidor.');
            }
            // Convertimos la respuesta a JSON y la guardamos en nuestra variable
            menuData = await response.json();
            console.log("Menú cargado exitosamente desde el servidor.");
        } catch (error) {
            console.error("Error al inicializar el menú:", error);
            // Aquí podríamos mostrar un mensaje de error en la pantalla
            menuGridDiv.innerHTML = "<p>Error al cargar productos. Asegúrate de que el servidor esté funcionando.</p>";
        }
    }

    // El resto de tus funciones (renderMenuGrid, onProductClick, etc.)
    // se mantienen exactamente igual, ya que siguen trabajando con la variable `menuData`.

    // --- INICIALIZACIÓN ---
    // Usamos async/await aquí para asegurarnos de que el menú se carga ANTES de intentar dibujarlo
    async function start() {
        await initializeMenu(); // Espera a que el menú se cargue
        renderMenuGrid();
        renderCategoryFilters();
        updateOrderSummary();
        updateCurrentOrderId();
    }

    start(); // Ejecutamos la nueva función de inicio
});
