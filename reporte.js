document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES (añadimos los nuevos) ---
    const dailyMetricsContainer = document.getElementById('daily-metrics');
    const dailyProductsList = document.getElementById('daily-products-list');
    const categoryRevenueChartCanvas = document.getElementById('categoryRevenueChart').getContext('2d');
    // ... (resto de selectores sin cambios) ...
    let categoryRevenueChart;

    // --- LÓGICA PRINCIPAL ---
    
    // MODIFICADO: Ahora también genera el resumen del día al cargar
    function initializeReports() {
        generateDailySummary(); // NUEVO
        loadAndProcessSales(); // Carga los reportes históricos
    }
    
    // NUEVO: Función para generar el Cierre de Caja del día actual
    function generateDailySummary() {
        const allSales = JSON.parse(localStorage.getItem('cafeSales')) || [];
        const today = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
        const todaySales = filterSalesByDate(allSales, today, today);

        // Renderizar métricas del día
        if (todaySales.length > 0) {
            const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
            const totalTickets = todaySales.length;
            const averageTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;
            
            dailyMetricsContainer.innerHTML = `
                <div class="summary-card card">
                    <h3>Ventas de Hoy</h3>
                    <p>${formatCurrency(totalRevenue)}</p>
                </div>
                <div class="summary-card card">
                    <h3>N° de Tickets Hoy</h3>
                    <p>${totalTickets}</p>
                </div>
                <div class="summary-card card">
                    <h3>Ticket Promedio Hoy</h3>
                    <p>${formatCurrency(averageTicket)}</p>
                </div>
            `;
        } else {
            dailyMetricsContainer.innerHTML = '<p>No se han registrado ventas hoy.</p>';
        }

        // Renderizar lista de productos vendidos hoy
        dailyProductsList.innerHTML = '';
        const productCounts = todaySales
            .flatMap(sale => sale.items)
            .reduce((acc, item) => {
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

    // MODIFICADO: Ahora también renderiza el nuevo gráfico
    function loadAndProcessSales() {
        const allSales = JSON.parse(localStorage.getItem('cafeSales')) || [];
        const filteredSales = filterSalesByDate(allSales, startDateInput.value, endDateInput.value);
        
        // ... (renderEmptyState y updateSummaryCards para el histórico se mantienen igual) ...

        renderTopProductsChart(filteredSales);
        renderCategoryRevenueChart(filteredSales); // NUEVO
    }

    // NUEVO: Función para renderizar el gráfico de ingresos por categoría
    function renderCategoryRevenueChart(sales) {
        const menuData = JSON.parse(localStorage.getItem('cafeMenu')) || [];
        const revenueByCategory = {};

        // Inicializar todas las categorías con 0
        menuData.forEach(cat => {
            revenueByCategory[cat.category] = 0;
        });

        // Calcular ingresos
        sales.flatMap(sale => sale.items).forEach(itemSold => {
            // Encontrar la categoría del producto vendido
            let categoryName = 'Desconocido';
            for (const category of menuData) {
                if (category.items.some(menuItem => menuItem.name === itemSold.name)) {
                    categoryName = category.category;
                    break;
                }
            }
            revenueByCategory[categoryName] += itemSold.price;
        });

        const chartLabels = Object.keys(revenueByCategory);
        const chartData = Object.values(revenueByCategory);
        
        if (categoryRevenueChart) {
            categoryRevenueChart.destroy();
        }

        categoryRevenueChart = new Chart(categoryRevenueChartCanvas, {
            type: 'doughnut', // Usamos un gráfico de dona/pastel
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Ingresos',
                    data: chartData,
                    backgroundColor: [
                        '#6F4E37', '#A0522D', '#C4A484', '#D2B48C',
                        '#E3C16F', '#B5651D', '#8B4513'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // --- (El resto de funciones como filterSalesByDate, populateSalesTable, renderTopProductsChart, etc., se mantienen igual) ---

    // --- INICIALIZACIÓN ---
    initializeReports(); // Llamamos a la función principal que ahora hace todo
});
