// frontend/js/productos.js
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

// Función que dibuja los productos en el HTML
function renderProductos(productos) {
    const contenedorProductos = document.getElementById('contenedor-productos');
    if (!contenedorProductos) {
        console.error("No se encontró el contenedor de productos en el HTML.");
        return;
    }

    contenedorProductos.innerHTML = '';

    if (productos.length === 0) {
        contenedorProductos.innerHTML = '<p>No hay productos cargados en la base de datos.</p>';
        return;
    }

    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-card';

        productoDiv.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio.toFixed(2)}</p>
            <p>Categoría: ${producto.categoria}</p>
            <p>Stock: ${producto.stock}</p>
            <button onclick="agregarAlPedido(${producto.id})">Agregar</button>
        `;
        contenedorProductos.appendChild(productoDiv);
    });
}

// Función para llamar a la API y obtener los productos
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        const data = await response.json();

        if (data.success) {
            renderProductos(data.productos);
        } else {
            alert('Error al cargar los productos: ' + data.error);
        }
    } catch (error) {
        console.error('Error de conexión con el servidor:', error);
        alert('Error de conexión con el servidor. Intenta de nuevo.');
    }
}

// Función de ejemplo para el botón
function agregarAlPedido(productoId) {
    console.log(`Producto con ID ${productoId} agregado al pedido.`);
    // Aquí iría tu lógica de agregar al carrito
}