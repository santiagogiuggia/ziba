const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// --- Base de Datos ---
const dbPath = path.resolve(__dirname, 'cafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error("Error al abrir la base de datos:", err.message);
    }
    console.log("Conectado a la base de datos SQLite 'cafe.db'.");

    // Usamos serialize para ejecutar los comandos en orden
    db.serialize(() => {
        // Crear tabla de productos si no existe
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            stock INTEGER NOT NULL,
            price_pocillo TEXT,
            price_jarro TEXT,
            price_mediano TEXT,
            price_grande TEXT
        )`, (err) => {
            if (err) console.error("Error al crear la tabla products:", err.message);
        });

        // Poblar la base de datos con el menú inicial SOLO si está vacía
        db.get("SELECT count(*) as count FROM products", (err, row) => {
            if (row.count === 0) {
                console.log("La tabla de productos está vacía. Poblando con datos iniciales...");
                const baseMenu = [ /* ... Pega aquí tu baseMenu completo ... */ ];
                const stmt = db.prepare("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                baseMenu.forEach(category => {
                    category.items.forEach(item => {
                        stmt.run(item.id, item.name, category.category, item.stock || 99, item.pocillo || null, item.jarro || null, item.mediano || null, item.grande || null);
                    });
                });
                stmt.finalize();
                console.log("Base de datos poblada con el menú inicial.");
            } else {
                console.log("La tabla de productos ya tiene datos.");
            }
        });
    });
});

// --- API Endpoints ---

// NUEVO: Endpoint para obtener el menú completo
app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        
        // Reorganizamos los datos para que tengan el formato que espera el frontend
        // { category: 'NOMBRE', items: [...] }
        const menuOrganizado = rows.reduce((acc, item) => {
            let categoria = acc.find(c => c.category === item.category);
            if (!categoria) {
                categoria = { category: item.category, items: [] };
                acc.push(categoria);
            }
            // Mapeamos los nombres de columna de la DB a los que espera el JS
            categoria.items.push({
                id: item.id,
                name: item.name,
                stock: item.stock,
                pocillo: item.price_pocillo,
                jarro: item.price_jarro,
                mediano: item.price_mediano,
                grande: item.price_grande
            });
            return acc;
        }, []);

        res.json(menuOrganizado);
    });
});


// --- Servir archivos estáticos ---
app.use(express.static('public'));

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
