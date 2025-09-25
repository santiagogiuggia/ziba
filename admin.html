document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORES DEL DOM ---
    const menuListContainer = document.getElementById('menu-list-container');
    const form = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const productIdInput = document.getElementById('product-id');
    const categoryList = document.getElementById('category-list');
    const cancelBtn = document.getElementById('cancel-btn');

    let menuData = [];

    // --- FUNCIONES PRINCIPALES ---

    function loadMenu() {
        const menuInStorage = localStorage.getItem('cafeMenu');
        menuData = menuInStorage ? JSON.parse(menuInStorage) : [];
        renderMenu();
        updateCategoryDatalist();
    }

    function saveMenu() {
        localStorage.setItem('cafeMenu', JSON.stringify(menuData));
        loadMenu(); // Recargar y re-renderizar todo
    }

    function renderMenu() {
        menuListContainer.innerHTML = '';
        const groupedByCategory = menuData.reduce((acc, category) => {
            acc[category.category] = category.items;
            return acc;
        }, {});

        for (const categoryName in groupedByCategory) {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'admin-category';
            categoryEl.innerHTML = `<h3>${categoryName}</h3>`;
            
            const productListEl = document.createElement('ul');
            groupedByCategory[categoryName].forEach(item => {
                const itemEl = document.createElement('li');
                itemEl.className = 'admin-product-item';
                itemEl.innerHTML = `
                    <span>${item.name} (Stock: ${item.stock})</span>
                    <div class="item-actions">
                        <button class="edit-btn" data-id="${item.id}">Editar</button>
                        <button class="delete-btn" data-id="${item.id}">Eliminar</button>
                    </div>
                `;
                productListEl.appendChild(itemEl);
            });
            categoryEl.appendChild(productListEl);
            menuListContainer.appendChild(categoryEl);
        }
    }
    
    function updateCategoryDatalist() {
        categoryList.innerHTML = '';
        const uniqueCategories = [...new Set(menuData.map(cat => cat.category))];
        uniqueCategories.forEach(catName => {
            const option = document.createElement('option');
            option.value = catName;
            categoryList.appendChild(option);
        });
    }

    // Esta función se encarga de procesar tanto la creación como la edición.
    function handleFormSubmit(e) {
        e.preventDefault();
        const id = parseInt(productIdInput.value);
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value.trim(),
            stock: parseInt(document.getElementById('product-stock').value),
            pocillo: document.getElementById('price-pocillo').value || null,
            jarro: document.getElementById('price-jarro').value || null,
            mediano: document.getElementById('price-mediano').value || null,
            grande: document.getElementById('price-grande').value || null,
        };

        // Si hay un ID, significa que estamos EDITANDO.
        if (id) {
            productData.id = id;
            let foundAndUpdated = false;
            
            // Recorremos el menú para encontrar y actualizar el producto.
            menuData.forEach(cat => {
                const itemIndex = cat.items.findIndex(item => item.id === id);
                if (itemIndex > -1) {
                    // Si la categoría cambió, debemos mover el producto de una categoría a otra.
                    if (cat.category !== productData.category) {
                        cat.items.splice(itemIndex, 1); // Remover del array de la categoría vieja.
                        addProduct(productData); // Añadir al array de la categoría nueva (o existente).
                    } else {
                        // Si la categoría no cambió, simplemente actualizamos el producto en su lugar.
                        cat.items[itemIndex] = { ...cat.items[itemIndex], ...productData };
                    }
                    foundAndUpdated = true;
                }
            });

        } else { // Si no hay ID, estamos CREANDO un producto nuevo.
            productData.id = Date.now(); // ID único basado en la fecha.
            addProduct(productData);
        }
        
        saveMenu();
        resetForm();
    }
    
    function addProduct(product) {
        let categoryExists = menuData.find(cat => cat.category === product.category);
        if (categoryExists) {
            categoryExists.items.push(product);
        } else {
            menuData.push({ category: product.category, items: [product] });
        }
    }

    // Esta es la función clave que se activa al presionar "Editar".
    // Rellena el formulario con los datos del producto seleccionado.
    function populateFormForEdit(id) {
        let itemToEdit;
        let categoryOfItem = '';
        
        for (const category of menuData) {
            const foundItem = category.items.find(item => item.id === id);
            if (foundItem) {
                itemToEdit = foundItem;
                categoryOfItem = category.category;
                break;
            }
        }

        if (itemToEdit) {
            formTitle.textContent = 'Editar Producto';
            productIdInput.value = itemToEdit.id;
            document.getElementById('product-name').value = itemToEdit.name;
            document.getElementById('product-category').value = categoryOfItem;
            document.getElementById('product-stock').value = itemToEdit.stock;
            document.getElementById('price-pocillo').value = itemToEdit.pocillo || '';
            document.getElementById('price-jarro').value = itemToEdit.jarro || '';
            document.getElementById('price-mediano').value = itemToEdit.mediano || '';
            document.getElementById('price-grande').value = itemToEdit.grande || '';
            cancelBtn.style.display = 'inline-block';
            window.scrollTo(0, 0); // Llevar la vista al tope de la página para ver el formulario.
        }
    }

    function deleteProduct(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
        
        let categoriesToDelete = [];
        menuData.forEach((cat, index) => {
            cat.items = cat.items.filter(item => item.id !== id);
            if (cat.items.length === 0) {
                categoriesToDelete.push(cat.category);
            }
        });

        // Eliminar categorías que quedaron vacías
        menuData = menuData.filter(cat => cat.items.length > 0);
        
        saveMenu();
    }

    function resetForm() {
        form.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Añadir Nuevo Producto';
        cancelBtn.style.display = 'none';
    }

    // --- EVENT LISTENERS ---
    form.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    menuListContainer.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('edit-btn')) {
            populateFormForEdit(id);
        }
        if (e.target.classList.contains('delete-btn')) {
            deleteProduct(id);
        }
    });

    // --- INICIALIZACIÓN ---
    loadMenu();
});
