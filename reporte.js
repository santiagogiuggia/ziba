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
        const sales = JSON.parse(localStorage.getItem('cafeSales')) || [];
        console.log("Ventas cargadas desde localStorage:", sales.length);
        return sales;
    }
    
    // =========================================================================
    // VERSIÓN FINAL Y ROBUSTA DEL FILTRO DE FECHAS
    // =========================================================================
    function filterSalesByDate(sales, startDateStr, endDateStr) {
        console.log(`Iniciando filtro. Desde: '${startDateStr}', Hasta: '${endDateStr}'`);
        
        if (!startDateStr && !endDateStr) {
            console.log("Filtros de fecha vacíos. Devolviendo todas las ventas.");
            return sales;
        }

        // Para filtrar un solo día, si la fecha de fin está vacía, usamos la de inicio.
        const effectiveEndDateStr = endDateStr || startDateStr;

        const filtered = sales.filter(sale => {
            const saleDateStr = sale.date.slice(0, 10); // Extraemos 'YYYY-MM-DD' de la venta
            
            // Comparamos los strings directamente, es el método más seguro contra zonas horarias.
            const isAfterStart = startDateStr ? saleDateStr >= startDateStr : true;
            const isBeforeEnd = effectiveEndDateStr ? saleDateStr <= effectiveEndDateStr : true;
            
            return isAfterStart && isBeforeEnd;
        });

        console.log(`Filtro completado. Se encontraron ${filtered.length} ventas.`);
        return filtered;
    }

    function generateDailySummary() {
        console.log("Generando resumen del día...");
        const allSales = getSalesFromStorage();
        const today = new Date().toISOString().slice(0, 10);
        
        const todaySales = filterSalesByDate(allSales, today, null); // Usamos null para que tome solo el día de hoy

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
        console.log("Cargando reportes históricos...");
        const allSales = getSalesFromStorage();
        const filteredSales = filterSalesByDate(allSales, startDateInput.value, endDateInput.value);
        
        if (filteredSales.length === 0) {
            renderEmptyState();
            return;
        }
        populateSalesTable(filteredSales);
        renderTopProductsChart(filteredSales);
        renderCategoryRevenueChart(filteredSales);
    }
    
    function renderEmptyState() {
        console.log("Renderizando estado vacío para reportes históricos.");
        salesDetailTableBody.innerHTML = '<tr><td colspan="4">No hay ventas para mostrar en este período.</td></tr>';
        if (topProductsChart) topProductsChart.destroy();
        if (categoryRevenueChart) categoryRevenueChart.destroy();
    }

    function populateSalesTable(sales) {
        salesDetailTableBody.innerHTML = '';
        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${sale.id}</td><td>${new Date(sale.date).toLocaleString('es-AR')}</td><td>${sale.items.length}</td><td>${formatCurrency(sale.total)}</td>`;
            salesDetailTableBody.appendChild(row);
        });
    }

    function renderTopProductsChart(sales) {
        const productCounts = sales.flatMap(sale => sale.items).reduce((acc, item) => {
            const key = `${item.name} (${item.size})`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const sortedProducts = Object.entries(productCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
        if (topProductsChart) topProductsChart.destroy();
        topProductsChart = new Chart(topProductsChartCanvas, {
            type: 'bar', data: { labels: sortedProducts.map(e => e[0]), datasets: [{ label: 'Cantidad Vendida', data: sortedProducts.map(e => e[1]), backgroundColor: 'rgba(111, 78, 55, 0.8)' }] },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
        });
    }

    function renderCategoryRevenueChart(sales) {
        const menuData = JSON.parse(localStorage.getItem('cafeMenu')) || [];
        const revenueByCategory = {};
        menuData.forEach(cat => { revenueByCategory[cat.category] = 0; });
        sales.flatMap(sale => sale.items).forEach(itemSold => {
            let categoryName = 'Desconocido';
            for (const category of menuData) {
                if (category.items.some(menuItem => menuItem.name === itemSold.name)) {
                    categoryName = category.category;
                    break;
                }
            }
            revenueByCategory[categoryName] += itemSold.price;
        });
        if (categoryRevenueChart) categoryRevenueChart.destroy();
        categoryRevenueChart = new Chart(categoryRevenueChartCanvas, {
            type: 'doughnut', data: { labels: Object.keys(revenueByCategory), datasets: [{ data: Object.values(revenueByCategory), backgroundColor: ['#6F4E37', '#A0522D', '#C4A484', '#D2B48C', '#E3C16F', '#B5651D', '#8B4513'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function formatCurrency(number) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number);
    }
    
    // --- EVENT LISTENERS ---
    filterBtn.addEventListener('click', loadAndProcessSales);
    resetBtn.addEventListener('click', () => {
        startDateInput.value = ''; endDateInput.value = '';
        loadAndProcessSales();
    });
    clearDataBtn.addEventListener('click', () => {
        if (confirm('¿ESTÁS SEGURO?')) {
            localStorage.removeItem('cafeSales');
            generateDailySummary();
            loadAndProcessSales();
        }
    });

    // --- INICIALIZACIÓN ---
    generateDailySummary();
    loadAndProcessSales();
});
