// Reemplaza TODO el contenido de tu script.js
document.addEventListener('DOMContentLoaded', () => {
    // Selectores del DOM
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

    // Estado de la aplicación
    let currentOrder = [];
    let heldOrders = JSON.parse(localStorage.getItem('cafeHeldOrders')) || [];
    let salesCounter = parseInt(localStorage.getItem('salesCounter')) || 1;
    let menuData = [];

    // Función de inicialización del menú
    function initializeMenu() {
        const menuInStorage = localStorage.getItem('cafeMenu');
        if (menuInStorage) {
            menuData = JSON.parse(menuInStorage);
        } else {
            const baseMenu = [ /* ... Tu menú completo aquí ... */ ];
            baseMenu.forEach(cat => cat.items.forEach(item => item.stock = item.stock || 99));
            localStorage.setItem('cafeMenu', JSON.stringify(baseMenu));
            menuData = baseMenu;
            console.log('Menú inicial creado y guardado en localStorage.');
        }
    }

    // (Aquí van todas las demás funciones de script.js que ya teníamos: renderMenuGrid, onProductClick, etc.)

    // Función clave para procesar y GUARDAR la venta
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
        
        // Lógica para guardar la venta
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
    
    // (Asegúrate de tener todas tus funciones aquí)
    
    // Inicialización
    initializeMenu();
    // (El resto de la inicialización)
});
