document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DEL DOM ---
    const menuFiltersDiv = document.getElementById('menu-filters');
    const menuGridDiv = document.getElementById('menu-grid');
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalEl = document.getElementById('order-total');
    const processSaleBtn = document.getElementById('process-sale-btn');
    const currentOrderIdEl = document.getElementById('current-order-id');

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

    // **** FUNCIÓN CRÍTICA DE INICIALIZACIÓN DEL MENÚ ****
    function initializeMenu() {
        const menuInStorage = localStorage.getItem('cafeMenu');
        if (menuInStorage) {
            menuData = JSON.parse(menuInStorage);
        } else {
            // Si es la primera vez, cargamos el menú base y lo guardamos
            const baseMenu = [
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
            // Añadimos el campo "stock" a cada item
            baseMenu.forEach(category => {
                category.items.forEach(item => {
                    item.stock = item.stock || 99; // Asignamos un stock por defecto
                });
            });
            localStorage.setItem('cafeMenu', JSON.stringify(baseMenu));
            menuData = baseMenu;
            console.log('Menú inicial creado y guardado en localStorage.');
        }
    }

    // --- (Aquí va el resto completo de tu script.js: renderMenuGrid, processSale, printTicket, etc.) ---
    // (Asegúrate de que todas las demás funciones que ya teníamos estén presentes aquí)
    
    // --- INICIALIZACIÓN ---
    initializeMenu();
    renderMenuGrid();
    renderCategoryFilters();
    updateOrderSummary();
    updateCurrentOrderId();
});
