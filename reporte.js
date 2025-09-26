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

    function getSalesFromStorage() {
        return JSON.parse(localStorage.getItem('cafeSales')) || [];
    }
    
    // =========================================================================
    // FUNCIÓN CORREGIDA PARA EL FILTRADO DE FECHAS
    // =========================================================================
    function filterSalesByDate(sales, startDate, endDate) {
        if (!startDate && !endDate) {
            return sales;
        }
        // Si solo hay fecha de inicio, la fecha de fin es la misma (para filtrar un solo día)
        const effectiveEndDate = endDate || startDate;

        return sales.filter(sale => {
            // Extraemos solo la parte de la fecha (YYYY-MM-DD) del string guardado
            const saleDate = sale.date.slice(0, 10);
            
            // Comparamos directamente los strings de fecha
            if (startDate && saleDate < startDate) {
                return false;
            }
            if (effectiveEndDate && saleDate > effectiveEndDate) {
                return false;
            }
            return true;
        });
    }

    function generateDailySummary() {
        const allSales = getSalesFromStorage();
        const today = new Date().toISOString().slice(0, 10);
        
        // Ponemos la fecha de hoy en los filtros por defecto
        startDateInput.value = today;
        endDateInput.value = today;

        const todaySales = filterSalesByDate(allSales, today, today);

        if (todaySales.length > 0) {
            const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
            const totalTickets = todaySales.length;
            const averageTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;
            dailyMetricsContainer.innerHTML = `
                <div class="summary-card card"><h3>Ventas de Hoy</h3><p>${formatCurrency(totalRevenue)}</p></div>
                <div class="summary-card card"><h3>N° de Tickets Hoy</h3><p>${totalTickets}</p></div>
                <div class="summary-card card"><h3>Ticket Promedio Hoy</h3><p>${formatCurrency(averageTicket)}</p></div>`;
        } else {
            dailyMetricsContainer.innerHTML = '<p>No se han registrado ventas hoy.</p>';
        }

        dailyProductsList.innerHTML = '';
        const productCounts = todaySales.flatMap(sale => sale.items).reduce((acc, item) => {
            const key = `${item.name} (${item.size})`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        if (Object.keys(productCounts).length > 0) {
            for (const [product, count] of Object.entries(productCounts)) {
                const li = document.createElement('li');
                li.textContent = `${count}x ${product}`;
                dailyProductsList.appendChild(li);
            }
        } else {
            dailyProductsList.innerHTML = '<li>Ningún producto vendido hoy.</li>';
        }
    }

    function loadAndProcessSales() {
        const allSales = getSalesFromStorage();
        const filteredSales = filterSalesByDate(allSales, startDateInput.value, endDateInput.value);
        if (filteredSales.length === 0) {
            renderEmptyState();
            return;
        }
        updateSummaryCards(filteredSales);
        populateSalesTable(filteredSales);
        renderTopProductsChart(filteredSales);
        renderCategoryRevenueChart(filteredSales);
    }
    
    function renderEmptyState() {
        // ... (código para mostrar estado vacío)
    }
    function updateSummaryCards(sales) {
        // ... (código para actualizar tarjetas de resumen histórico)
    }
    function populateSalesTable(sales) {
        // ... (código para llenar la tabla)
    }
    function renderTopProductsChart(sales) {
        // ... (código para el gráfico de productos)
    }
    function renderCategoryRevenueChart(sales) {
        // ... (código para el gráfico de categorías)
    }
    function formatCurrency(number) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number);
    }
    
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
            generateDailySummary();
            loadAndProcessSales();
        }
    });

    // --- INICIALIZACIÓN ---
    generateDailySummary();
    loadAndProcessSales();
});
