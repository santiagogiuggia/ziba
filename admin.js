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

        if (id) { // Editando
            productData.id = id;
            // Encontrar y actualizar el producto
            menuData.forEach(cat => {
                const itemIndex = cat.items.findIndex(item => item.id === id);
                if (itemIndex > -1) {
                    // Si la categoría cambió, hay que mover el item
                    if (cat.category !== productData.category) {
                        cat.items.splice(itemIndex, 1); // Remover del viejo
                        addProduct(productData); // Añadir al nuevo (o existente)
                    } else {
                        cat.items[itemIndex] = productData;
                    }
                }
            });
        } else { // Creando
            productData.id = Date.now(); // ID único
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

    function populateFormForEdit(id) {
        let itemToEdit;
        for (const category of menuData) {
            const foundItem = category.items.find(item => item.id === id);
            if (foundItem) {
                itemToEdit = { ...foundItem, category: category.category };
                break;
            }
        }

        if (itemToEdit) {
            formTitle.textContent = 'Editar Producto';
            productIdInput.value = itemToEdit.id;
            document.getElementById('product-name').value = itemToEdit.name;
            document.getElementById('product-category').value = itemToEdit.category;
            document.getElementById('product-stock').value = itemToEdit.stock;
            document.getElementById('price-pocillo').value = itemToEdit.pocillo || '';
            document.getElementById('price-jarro').value = itemToEdit.jarro || '';
            document.getElementById('price-mediano').value = itemToEdit.mediano || '';
            document.getElementById('price-grande').value = itemToEdit.grande || '';
            cancelBtn.style.display = 'inline-block';
            window.scrollTo(0, document.body.scrollHeight);
        }
    }

    function deleteProduct(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
        
        menuData.forEach((cat, index) => {
            cat.items = cat.items.filter(item => item.id !== id);
            // Si la categoría queda vacía, la eliminamos
            if (cat.items.length === 0) {
                menuData.splice(index, 1);
            }
        });
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
