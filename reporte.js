document.addEventListener('DOMContentLoaded', () => {
    // Selectores del DOM
    const dailyMetricsContainer = document.getElementById('daily-metrics');
    const dailyProductsList = document.getElementById('daily-products-list');
    const categoryRevenueChartCanvas = document.getElementById('categoryRevenueChart').getContext('2d');
    const topProductsChartCanvas = document.getElementById('topProductsChart').getContext('2d');
    const salesDetailTableBody = document.querySelector('#salesDetailTable tbody');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterBtn = document.getElementById('filterBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    let categoryRevenueChart, topProductsChart;

    // Función principal que se ejecuta al cargar la página
    function initializeReports() {
        generateDailySummary();
        loadAndProcessSales();
    }

    // ---- ESTA ES LA PARTE CLAVE PARA LEER LAS VENTAS ----
    function getSalesFromStorage() {
        return JSON.parse(localStorage.getItem('cafeSales')) || [];
    }
    // ----------------------------------------------------

    function generateDailySummary() {
        const allSales = getSalesFromStorage();
        // ... (resto del código de resumen diario)
    }

    function loadAndProcessSales() {
        const allSales = getSalesFromStorage();
        // ... (resto del código de reportes históricos)
    }

    // (Asegúrate de tener todas tus funciones aquí: filterSalesByDate, renderTopProductsChart, etc.)

    // --- EVENT LISTENERS ---
    filterBtn.addEventListener('click', loadAndProcessSales);
    resetBtn.addEventListener('click', () => {
        startDateInput.value = '';
        endDateInput.value = '';
        loadAndProcessSales();
    });
    clearDataBtn.addEventListener('click', () => {
        if (confirm('¿ESTÁS SEGURO? Esta acción borrará permanentemente todo el historial de ventas.')) {
            localStorage.removeItem('cafeSales');
            initializeReports();
        }
    });

    // --- INICIALIZACIÓN ---
    initializeReports();
});
