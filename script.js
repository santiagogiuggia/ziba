document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DEL DOM ---
    const menuFiltersDiv = document.getElementById('menu-filters');
    const menuGridDiv = document.getElementById('menu-grid');
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalEl = document.getElementById('order-total');
    const processSaleBtn = document.getElementById('process-sale-btn');
    const currentOrderIdEl = document.getElementById('current-order-id');

    // Modal de Tamaños
    const sizeModal = document.getElementById('size-modal');
    const sizeModalProductName = document.getElementById('size-modal-product-name');
    const sizeModalOptions = document.getElementById('size-modal-options');
    const sizeModalCloseBtn = document.getElementById('size-modal-close');

    // Modal de Cobro
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutTotalAmountEl = document.getElementById('checkout-total-amount');
    const amountReceivedInput = document.getElementById('amount-received');
    const checkoutChangeAmountEl = document.getElementById('checkout-change-amount');
    const checkoutConfirmBtn = document.getElementById('checkout-confirm-btn');
    const checkoutCancelBtn = document.getElementById('checkout-cancel-btn');

    // --- ESTADO DE LA APLICACIÓN ---
    let currentOrder = [];
    let salesCounter = parseInt(localStorage.getItem('salesCounter')) || 1;

    // --- BASE DE DATOS DEL MENÚ COMPLETO ---
    const menuData = [
        {
            category: 'CAFÉ',
            items: [
                { id: 1, name: 'Espresso', pocillo: '$2.500', jarro: '$2.900' },
                { id: 2, name: 'Doppio', pocillo: '$2.700', jarro: '$3.200' },
                { id: 3, name: 'Americano', jarro: '$3.000', mediano: '$2.800', grande: '$3.000' },
                { id: 4, name: 'Long Black', jarro: '$3.200', grande: '$3.000' }
            ]
        },
        {
            category: 'CAFÉ MÁS LECHE',
            items: [
                { id: 5, name: 'Espresso Macchiato', pocillo: '$2.100' },
                { id: 6, name: 'Cortado', pocillo: '$2.700', jarro: '$2.900', mediano: '$3.100', grande: '$3.400' },
                { id: 7, name: 'Flat White', jarro: '$3.300', mediano: '$3.600' },
                { id: 8, name: 'Latte / Latte Macchiato', jarro: '$3.000', mediano: '$3.200' },
                { id: 9, name: 'Capuccino', jarro: '$3.100', mediano: '$3.300' },
                { id: 10, name: 'Latte Saborizado', jarro: '$3.300', mediano: '$3.600' }
            ]
        },
        {
            category: 'BEBIDAS FRIAS',
            items: [
                { id: 11, name: 'Café Americano Frío', mediano: '$3.100' },
                { id: 12, name: 'Latte Frío', mediano: '$3.400' },
                { id: 13, name: 'Latte Saborizado Frío', mediano: '$3.700' },
                { id: 14, name: 'Licuado de Banana', mediano: '$3.400' },
                { id: 15, name: 'Licuado de Frutilla', mediano: '$3.800' },
                { id: 16, name: 'Licuado de Durazno', mediano: '$3.500' },
                { id: 17, name: 'Jugo de Naranja', mediano: '$2.800' },
                { id: 18, name: 'Café Tonic', mediano: '$3.600' },
                { id: 19, name: 'Café Tonic con Naranja', mediano: '$3.400' }
            ]
        },
        {
            category: 'PANADERÍA',
            items: [
                { id: 20, name: 'Medialuna', mediano: '$900' },
                { id: 21, name: 'Criollo', mediano: '$600' },
                { id: 22, name: 'Scon de Queso', mediano: '$1.400' },
                { id: 23, name: 'Croissant', mediano: '$1.500' },
                { id: 24, name: 'Croissant Bicolor', mediano: '$1.800' },
                { id: 25, name: 'Croissant Jamón y Queso', mediano: '$2.700' }
            ]
        },
        {
            category: 'PASTELERÍA',
            items: [
                { id: 26, name: 'Budín Naranja y Choco', mediano: '$2.000' },
                { id: 27, name: 'Budín Limón y Amapola', mediano: '$2.000' },
                { id: 28, name: 'Brownie con Nuez', mediano: '$2.200' },
                { id: 29, name: 'Alfajor de Fruta', mediano: '$1.800' },
                { id: 30, name: 'Alfajor DDL Chocolate', mediano: '$2.000' },
                { id: 31, name: 'Pasta Frola', mediano: '$2.200' },
                { id: 32, name: 'Roll de Canela', mediano: '$2.200' },
                { id: 33, name: 'Carrot Cake', mediano: '$2.500' }
            ]
        },
        {
            category: 'COMBOS',
            items: [
                { id: 34, name: 'Combo: 1 Medialuna + 1 Criollo', mediano: '$2.800', grande: '$3.200' },
                { id: 35, name: 'Combo: 2 Medialunas', mediano: '$3.100', grande: '$3.500' },
                { id: 36, name: 'Combo: Roll de Canela', mediano: '$3.800', grande: '$4.200' },
                { id: 37, name: 'Combo: Croissant', mediano: '$3.400', grande: '$3.800' }
            ]
        },
        {
            category: 'EXTRAS',
            items: [
                { id: 38, name: 'Shot Extra de Café', mediano: '$400' },
                { id: 39, name: 'Shot Extra de Syrup', mediano: '$400' },
                { id: 40, name: 'Syrup (Vainilla, Caramelo, etc)', mediano: '$400' }
            ]
        }
    ];


    // --- FUNCIONES DE RENDERIZADO Y UI ---
    
    function renderMenuGrid() {
        menuGridDiv.innerHTML = '';
        menuData.forEach(category => {
            category.items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.category = category.category;
                const mainPrice = item.mediano || item.jarro || item.pocillo || item.grande;

                card.innerHTML = `
                    <h4>${item.name}</h4>
                    <div class="price">${mainPrice}</div>
                `;
                card.addEventListener('click', () => onProductClick(item));
                menuGridDiv.appendChild(card);
            });
        });
    }

    function renderCategoryFilters() {
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

    function updateOrderSummary() {
        orderItemsList.innerHTML = '';
        if (currentOrder.length === 0) {
            orderItemsList.innerHTML = '<li>Agrega productos al pedido.</li>';
        } else {
            currentOrder.forEach((item, index) => {
                const li = document.createElement('li');
                li.classList.add('order-item');
                li.innerHTML = `
                    <span>${item.name} (${item.size})</span>
                    <span class="item-price">${formatCurrency(item.price)}</span>
                    <button data-index="${index}" class="remove-item-btn">X</button>
                `;
                orderItemsList.appendChild(li);
            });
        }
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        orderTotalEl.innerHTML = `<strong>Total: ${formatCurrency(total)}</strong>`;
    }

    // --- LÓGICA DE PEDIDOS Y MODALES ---

    function onProductClick(item) {
        const availableSizes = ['pocillo', 'jarro', 'mediano', 'grande'].filter(size => item[size]);
        if (availableSizes.length > 1) {
            openSizeModal(item, availableSizes);
        } else {
            addToOrder(item.name, availableSizes[0], parsePrice(item[availableSizes[0]]));
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
                addToOrder(item.name, size, parsePrice(price));
                closeSizeModal();
            });
            sizeModalOptions.appendChild(btn);
        });
        sizeModal.style.display = 'flex';
    }

    function closeSizeModal() {
        sizeModal.style.display = 'none';
    }

    function addToOrder(name, size, price) {
        currentOrder.push({ name, size, price });
        updateOrderSummary();
    }

    function removeFromOrder(index) {
        currentOrder.splice(index, 1);
        updateOrderSummary();
    }
    
    // --- LÓGICA DE COBRO Y VENTA ---

    function startCheckout() {
        if (currentOrder.length === 0) {
            alert('El pedido está vacío.');
            return;
        }
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        checkoutTotalAmountEl.textContent = formatCurrency(total);
        amountReceivedInput.value = '';
        checkoutChangeAmountEl.textContent = formatCurrency(0);
        checkoutModal.style.display = 'flex';
        amountReceivedInput.focus();
    }
    
    function processSale() {
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        const sale = {
            id: salesCounter,
            date: new Date().toISOString(),
            items: currentOrder,
            total: total
        };

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
    }
    
    function closeCheckoutModal() {
        checkoutModal.style.display = 'none';
    }
    
    function updateChange() {
        const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
        const received = parseFloat(amountReceivedInput.value) || 0;
        const change = received - total;
        checkoutChangeAmountEl.textContent = formatCurrency(change < 0 ? 0 : change);
    }

    // --- FUNCIÓN DE IMPRESIÓN DE TICKET ---

    function printTicket(sale) {
        const ticketWindow = window.open('', 'PRINT', 'height=600,width=400');
        ticketWindow.document.write('<html><head><title>Comanda</title>');
        ticketWindow.document.write(`
            <style>
                body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 5px; font-size: 10pt; }
                h2, h3 { text-align: center; margin: 5px 0; }
                p { margin: 2px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 2px 0; }
                .item-line td:first-child { text-align: left; }
                .item-line td:last-child { text-align: right; }
                .total-line { border-top: 1px dashed black; font-weight: bold; }
                hr { border: none; border-top: 1px dashed black; }
            </style>
        `);
        ticketWindow.document.write('</head><body>');
        ticketWindow.document.write('<h2>Café del Día</h2>');
        ticketWindow.document.write(`<h3>Comanda N°: ${sale.id}</h3>`);
        ticketWindow.document.write(`<p>Fecha: ${new Date(sale.date).toLocaleString('es-AR')}</p>`);
        ticketWindow.document.write('<hr>');
        ticketWindow.document.write('<table>');
        sale.items.forEach(item => {
            ticketWindow.document.write(`
                <tr class="item-line">
                    <td>${item.name} (${item.size})</td>
                    <td>${formatCurrency(item.price)}</td>
                </tr>
            `);
        });
        ticketWindow.document.write('</table>');
        ticketWindow.document.write('<hr>');
        ticketWindow.document.write(`
            <table>
                <tr class="total-line">
                    <td>TOTAL:</td>
                    <td>${formatCurrency(sale.total)}</td>
                </tr>
            </table>
        `);
        ticketWindow.document.write('</body></html>');
        ticketWindow.document.close();
        ticketWindow.focus();
        ticketWindow.print();
        ticketWindow.close();
    }

    // --- FUNCIONES UTILITARIAS Y DE INICIALIZACIÓN ---
    function updateCurrentOrderId() {
        currentOrderIdEl.textContent = salesCounter;
    }

    function parsePrice(priceString) {
        if (!priceString) return 0;
        return parseFloat(priceString.replace('$', '').replace(/\./g, ''));
    }

    function formatCurrency(number) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number);
    }
    
    // --- EVENT LISTENERS ---
    orderItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            removeFromOrder(e.target.dataset.index);
        }
    });
    sizeModalCloseBtn.addEventListener('click', closeSizeModal);
    processSaleBtn.addEventListener('click', startCheckout);
    checkoutCancelBtn.addEventListener('click', closeCheckoutModal);
    checkoutConfirmBtn.addEventListener('click', processSale);
    amountReceivedInput.addEventListener('input', updateChange);

    // --- INICIALIZACIÓN ---
    renderMenuGrid();
    renderCategoryFilters();
    updateOrderSummary();
    updateCurrentOrderId();
});
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES (añadimos el notificador) ---
    const updateNotification = document.getElementById('update-notification');
    // ... y todos los demás selectores que ya teníamos ...

    // --- (El resto de tu script.js se mantiene igual hasta la sección de Event Listeners) ---
    
    // --- EVENT LISTENERS ---
    
    // ... (los event listeners que ya teníamos: holdOrderBtn, viewHeldOrdersBtn, etc.) ...

    /**
     * NUEVO: Listener para sincronizar entre pestañas.
     * Este código "escucha" si otra pestaña (como admin.html) modifica el localStorage.
     */
    window.addEventListener('storage', (event) => {
        // Nos aseguramos de que el cambio fue en nuestro menú.
        if (event.key === 'cafeMenu') {
            console.log('Se detectó un cambio en el menú desde otra pestaña. Recargando...');
            
            // 1. Mostrar la notificación
            showUpdateNotification();
            
            // 2. Recargar los datos del menú desde localStorage
            initializeMenu();
            
            // 3. Volver a "dibujar" el grid de productos con los nuevos precios
            renderMenuGrid();
        }
    });

    // --- FUNCIONES UTILITARIAS (añadimos una nueva) ---

    // NUEVO: Función para mostrar y ocultar la notificación
    function showUpdateNotification() {
        updateNotification.classList.remove('hidden');
        updateNotification.classList.add('show');
        
        // Ocultar la notificación después de 3 segundos
        setTimeout(() => {
            updateNotification.classList.remove('show');
            // Usamos otro timeout para añadir la clase 'hidden' después de que la transición termine
            setTimeout(() => {
                updateNotification.classList.add('hidden');
            }, 500); // 500ms es la duración de la transición
        }, 3000);
    }

    // ... (el resto de funciones utilitarias y la inicialización se mantienen igual) ...

    // --- INICIALIZACIÓN ---
    initializeMenu(); 
    renderMenuGrid();
    renderCategoryFilters();
    updateOrderSummary();
    updateCurrentOrderId();
});
