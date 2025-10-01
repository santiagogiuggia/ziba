document.addEventListener('DOMContentLoaded', () => {
    // Proteger la página
    checkLoginStatus();

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
    const checkoutCancelBtn = document.getElementById('checkout-cancel-btn');
    const holdOrderBtn = document.getElementById('hold-order-btn');
    const viewHeldOrdersBtn = document.getElementById('view-held-orders-btn');
    const heldOrdersModal = document.getElementById('held-orders-modal');
    const heldOrdersList = document.getElementById('held-orders-list');
    const heldOrdersCloseBtn = document.getElementById('held-orders-close-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const cashPaymentDiv = document.getElementById('cash-payment');
    const confirmCashBtn = document.getElementById('checkout-confirm-cash-btn');
    const mpPaymentBtn = document.querySelector('.mp-button');

    // --- ESTADO DE LA APLICACIÓN ---
    let menuData = [];
    let currentOrder = [];
    let salesCounter = parseInt(localStorage.getItem('salesCounter')) || 1;
    let heldOrders = JSON.parse(localStorage.getItem('cafeHeldOrders')) || [];
    
    // --- FUNCIONES ---
    async function initializeMenu() {
        try {
            console.log("Pidiendo menú al servidor...");
            const response = await fetch('/api/menu');
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.statusText}`);
            }
            menuData = await response.json();
            console.log("Menú cargado exitosamente desde el servidor.");
        } catch (error) {
            console.error("Error al inicializar el menú:", error);
            if (menuGridDiv) {
                menuGridDiv.innerHTML = "<p style='color: red; text-align: center; width: 100%;'>Error al cargar productos. Asegúrate de que el servidor esté funcionando.</p>";
            }
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
                const mainPrice = item.mediano || item.grande || item.jarro || item.pocillo;
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

    function closeSizeModal() { sizeModal.style.display = 'none'; }

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
                li.innerHTML = `<div><span>${item.name} (${item.size})</span>${noteHtml}</div><div class="item-actions-container"><span class="item-price">${formatCurrency(item.price)}</span><button data-index="${index}" class="remove-item-btn">X</button></div>`;
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

    async function processSale(paymentMethod) {
        if (currentOrder.length === 0) return;
        const sale = {
            id: salesCounter,
            date: new Date().toISOString(),
            items: currentOrder,
            total: currentOrder.reduce((sum, item) => sum + item.price, 0),
            paymentMethod: paymentMethod
        };
        try {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sale),
            });
            if (!response.ok) { throw new Error('El servidor no pudo guardar la venta.'); }
        } catch (error) {
            console.error("Error al guardar la venta:", error);
            alert("Hubo un error al guardar la venta.");
            return;
        }
        salesCounter++;
        localStorage.setItem('salesCounter', salesCounter);
        printTicket(sale);
        currentOrder = [];
        updateOrderSummary();
        updateCurrentOrderId();
        closeCheckoutModal();
        renderMenuGrid();
    }
    
    async function handleMercadoPagoPayment() {
        try {
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: currentOrder }),
            });
            if (!response.ok) { throw new Error('El servidor no pudo crear el pago.'); }
            const data = await response.json();
            // Guardamos la venta ANTES de redirigir
            await processSale('Mercado Pago');
            window.location.href = data.init_point;
        } catch (error) {
            console.error("Error al procesar pago con Mercado Pago:", error);
            alert("No se pudo generar el link de pago. Intenta de nuevo.");
        }
    }

    function startCheckout() {
        if (currentOrder.length === 0) { alert('El pedido está vacío.'); return; }
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        checkoutTotalAmountEl.textContent = formatCurrency(total);
        cashPaymentDiv.style.display = 'none';
        amountReceivedInput.value = '';
        checkoutModal.style.display = 'flex';
    }

    function handlePaymentMethodClick(method) {
        if (method === 'Efectivo') {
            cashPaymentDiv.style.display = 'block';
        } else if (method === 'Transferencia') {
            processSale(method);
        } else if (method === 'Mercado Pago') {
            handleMercadoPagoPayment();
        }
    }

    function closeCheckoutModal() { checkoutModal.style.display = 'none'; }
    function updateChange() {
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        const received = parseFloat(amountReceivedInput.value) || 0;
        const change = received - total;
        checkoutChangeAmountEl.textContent = formatCurrency(change < 0 ? 0 : change);
    }
    function holdOrder() { /* ... */ }
    function showHeldOrdersModal() { /* ... */ }
    function recallOrder(orderId) { /* ... */ }
    function closeHeldOrdersModal() { heldOrdersModal.style.display = 'none'; }
    function parsePrice(priceString) { if (!priceString) return 0; return parseFloat(String(priceString).replace('$', '').replace(/\./g, '')); }
    function formatCurrency(number) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number); }
    function updateCurrentOrderId() { if (currentOrderIdEl) currentOrderIdEl.textContent = salesCounter; }
    function showUpdateNotification() { /* ... */ }
    function printTicket(sale) { /* ... */ }

    // --- EVENT LISTENERS ---
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (processSaleBtn) processSaleBtn.addEventListener('click', startCheckout);
    if (checkoutCancelBtn) checkoutCancelBtn.addEventListener('click', closeCheckoutModal);
    if (checkoutModal) checkoutModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('payment-btn')) {
            handlePaymentMethodClick(e.target.dataset.method);
        }
    });
    if (confirmCashBtn) confirmCashBtn.addEventListener('click', () => processSale('Efectivo'));
    // ... (El resto de los listeners)

    // --- INICIALIZACIÓN ---
    async function start() {
        await initializeMenu();
        renderMenuGrid();
        renderCategoryFilters();
        updateOrderSummary();
        updateCurrentOrderId();
    }
    
    start();
});
