document.addEventListener('DOMContentLoaded', () => {
    // Selectores del DOM
    const dailyMetricsContainer = document.getElementById('daily-metrics');
    const dailyProductsList = document.getElementById('daily-products-list');
    const weeklyReportTableBody = document.querySelector('#weekly-report-table tbody'); // <-- NUEVO SELECTOR
    const categoryRevenueChartCanvas = document.getElementById('categoryRevenueChart').getContext('2d');
    const topProductsChartCanvas = document.getElementById('topProductsChart').getContext('2d');
    const salesDetailTableBody = document.querySelector('#salesDetailTable tbody');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterBtn = document.getElementById('filterBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    let categoryRevenueChart, topProductsChart;

    async function initializeReports() {
        const sales = await getSalesFromServer();
        generateDailySummary(sales);
        generateDayOfWeekReport(sales); // <-- NUEVA LLAMADA
        loadAndProcessSales(sales);
    }

    async function getSalesFromServer() {
        try {
            const response = await fetch('/api/sales');
            if (!response.ok) { throw new Error('No se pudo cargar el historial de ventas.'); }
            const sales = await response.json();
            console.log(`Se cargaron ${sales.length} ventas desde el servidor.`);
            return sales;
        } catch (error) {
            console.error("Error al obtener ventas:", error);
            return [];
        }
    }
    
    // =============================================
    //      NUEVA FUNCIÓN PARA EL REPORTE SEMANAL
    // =============================================
    function generateDayOfWeekReport(allSales) {
        const productCounts = {};
        // Ej: { "Medialuna (mediano)": [0, 0, 0, 0, 0, 0, 0] } -> [Dom, Lun, Mar, Mie, Jue, Vie, Sab]

        allSales.forEach(sale => {
            const saleDate = new Date(sale.date);
            const dayOfWeek = saleDate.getDay(); // Domingo = 0, Lunes = 1, etc.

            sale.items.forEach(item => {
                const productName = `${item.name} (${item.size})`;
                if (!productCounts[productName]) {
                    productCounts[productName] = [0, 0, 0, 0, 0, 0, 0];
                }
                productCounts[productName][dayOfWeek]++;
            });
        });

        weeklyReportTableBody.innerHTML = '';
        if (Object.keys(productCounts).length === 0) {
            weeklyReportTableBody.innerHTML = '<tr><td colspan="8">No hay suficientes datos de ventas para generar este reporte.</td></tr>';
            return;
        }

        for (const productName in productCounts) {
            const counts = productCounts[productName];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${productName}</td>
                <td>${counts[0]}</td>
                <td>${counts[1]}</td>
                <td>${counts[2]}</td>
                <td>${counts[3]}</td>
                <td>${counts[4]}</td>
                <td>${counts[5]}</td>
                <td>${counts[6]}</td>
            `;
            weeklyReportTableBody.appendChild(row);
        }
    }

    function generateDailySummary(allSales) {
        const today = new Date().toISOString().slice(0, 10);
        const todaySales = filterSalesByDate(allSales, today, null);

        if (todaySales.length > 0) {
            const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
            const totalTickets = todaySales.length;
            const averageTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;
            dailyMetricsContainer.innerHTML = `<div class="summary-card card"><h3>Ventas de Hoy</h3><p>${formatCurrency(totalRevenue)}</p></div><div class="summary-card card"><h3>N° de Tickets Hoy</h3><p>${totalTickets}</p></div><div class="summary-card card"><h3>Ticket Promedio Hoy</h3><p>${formatCurrency(averageTicket)}</p></div>`;
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

    function loadAndProcessSales(allSales) {
        const filteredSales = filterSalesByDate(allSales, startDateInput.value, endDateInput.value);
        if (filteredSales.length === 0) {
            renderEmptyState();
            return;
        }
        populateSalesTable(filteredSales);
        renderTopProductsChart(filteredSales);
        renderCategoryRevenueChart(filteredSales);
    }
    
    function filterSalesByDate(sales, startDateStr, endDateStr) {
        if (!startDateStr && !endDateStr) { return sales; }
        const effectiveEndDateStr = endDateStr || startDateStr;
        return sales.filter(sale => {
            const saleDateStr = sale.date.slice(0, 10);
            const isAfterStart = startDateStr ? saleDateStr >= startDateStr : true;
            const isBeforeEnd = effectiveEndDateStr ? saleDateStr <= effectiveEndDateStr : true;
            return isAfterStart && isBeforeEnd;
        });
    }
    
    function renderEmptyState() {
        salesDetailTableBody.innerHTML = '<tr><td colspan="5">No hay ventas para mostrar en este período.</td></tr>';
        if (topProductsChart) topProductsChart.destroy();
        if (categoryRevenueChart) categoryRevenueChart.destroy();
    }

    function populateSalesTable(sales) {
        salesDetailTableBody.innerHTML = '';
        sales.sort((a, b) => new Date(b.date) - new Date(a.date));
        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${sale.id}</td><td>${new Date(sale.date).toLocaleString('es-AR')}</td><td>${sale.items.length}</td><td>${sale.payment_method}</td><td>${formatCurrency(sale.total)}</td>`;
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
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
        });
    }

    function renderCategoryRevenueChart(sales) {
        const menuData = JSON.parse(localStorage.getItem('cafeMenu')) || []; // Asumimos que el menú está en localStorage para encontrar categorías
        const revenueByCategory = {};
        if (menuData.length > 0) {
            menuData.forEach(cat => { revenueByCategory[cat.category] = 0; });
        }
        sales.flatMap(sale => sale.items).forEach(itemSold => {
            let categoryName = 'Desconocido';
            for (const category of menuData) {
                if (category.items.some(menuItem => menuItem.name === itemSold.name)) {
                    categoryName = category.category;
                    break;
                }
            }
            if (!revenueByCategory[categoryName]) { revenueByCategory[categoryName] = 0; }
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
    filterBtn.addEventListener('click', async () => {
        const sales = await getSalesFromServer();
        loadAndProcessSales(sales);
    });
    resetBtn.addEventListener('click', async () => {
        startDateInput.value = ''; endDateInput.value = '';
        const sales = await getSalesFromServer();
        loadAndProcessSales(sales);
    });
    clearDataBtn.addEventListener('click', () => {
        if (confirm('¿ESTÁS SEGURO?')) {
            // Aquí deberíamos llamar a una API para borrar ventas en el backend
            console.warn("La función de borrar ventas debe implementarse en el backend.");
        }
    });

    // --- INICIALIZACIÓN ---
    initializeReports();
});