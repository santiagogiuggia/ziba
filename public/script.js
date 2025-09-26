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
                menuGridDiv.innerHTML = "<p style='color: red; text-align: center; width: 100%;'>Error al cargar productos. Asegúrate de que el servidor esté funcionando ejecutando 'npm start' en la terminal.</p>";
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
    
    function printTicket(sale) {
        const ticketWindow = window.open('', 'PRINT', 'height=600,width=400');
        ticketWindow.document.write('<html><head><title>Comanda</title>');
        ticketWindow.document.write(`<style>body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 5px; font-size: 10pt; } h2, h3 { text-align: center; margin: 5px 0; } p { margin: 2px 0; } table { width: 100%; border-collapse: collapse; } th, td { padding: 2px 0; } .item-line td:first-child { text-align: left; } .item-line td:last-child { text-align: right; } .total-line { border-top: 1px dashed black; font-weight: bold; } hr { border: none; border-top: 1px dashed black; }</style>`);
        ticketWindow.document.write('</head><body>');
        ticketWindow.document.write('<h2>Café del Día</h2>');
        ticketWindow.document.write(`<h3>Comanda N°: ${sale.id}</h3>`);
        ticketWindow.document.write(`<p>Fecha: ${new Date(sale.date).toLocaleString('es-AR')}</p>`);
        ticketWindow.document.write('<hr>');
        ticketWindow.document.write('<table>');
        sale.items.forEach(item => {
            ticketWindow.document.write(`<tr class="item-line"><td>${item.name} (${item.size})</td><td>${formatCurrency(item.price)}</td></tr>`);
            if (item.note) { ticketWindow.document.write(`<tr class="item-line"><td colspan="2" style="font-style:italic;padding-left:10px;">Nota: ${item.note}</td></tr>`);}
        });
        ticketWindow.document.write('</table><hr>');
        ticketWindow.document.write(`<table><tr class="total-line"><td>TOTAL:</td><td>${formatCurrency(sale.total)}</td></tr></table>`);
        ticketWindow.document.write('</body></html>');
        ticketWindow.document.close();
        ticketWindow.focus();
        ticketWindow.print();
        ticketWindow.close();
    }
    
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
    processSaleBtn.addEventListener('click', startCheckout);
    checkoutConfirmBtn.addEventListener('click', processSale);
    checkoutCancelBtn.addEventListener('click', closeCheckoutModal);
    amountReceivedInput.addEventListener('input', updateChange);
    sizeModalCloseBtn.addEventListener('click', closeSizeModal);
    holdOrderBtn.addEventListener('click', holdOrder);
    viewHeldOrdersBtn.addEventListener('click', showHeldOrdersModal);
    heldOrdersCloseBtn.addEventListener('click', closeHeldOrdersModal);
    heldOrdersList.addEventListener('click', (e) => { if (e.target.classList.contains('recall-btn')) { recallOrder(parseInt(e.target.closest('li').dataset.orderId)); } });
    window.addEventListener('storage', (event) => { if (event.key === 'cafeMenu') { showUpdateNotification(); initializeMenu(); renderMenuGrid(); } });

    // --- INICIALIZACIÓN ---
    async function start() {
        await initializeMenu();
        renderMenuGrid();
        renderCategoryFilters();
        updateOrderSummary();
        updateCurrentOrderId();
    }
    start();

}); // <-- ESTA LLAVE Y PARÉNTESIS FINAL ES LA QUE PROBABLEMENTE FALTABA