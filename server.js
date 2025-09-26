const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// --- Base de Datos ---
const dbPath = path.resolve(__dirname, 'cafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) { return console.error("Error al abrir la base de datos:", err.message); }
    console.log("Conectado a la base de datos SQLite 'cafe.db'.");
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, stock INTEGER NOT NULL, price_pocillo TEXT, price_jarro TEXT, price_mediano TEXT, price_grande TEXT
        )`, (err) => { if (err) console.error("Error al crear tabla:", err.message); });

        db.get("SELECT count(*) as count FROM products", (err, row) => {
            if (row && row.count === 0) {
                console.log("Base de datos vacía. Poblando con menú inicial...");
                const baseMenu = [
                    { category: 'CAFÉ', items: [ { id: 1, name: 'Espresso', pocillo: '$2.900', jarro: '$3.200' }, { id: 2, name: 'Doppio', pocillo: '$3.200', jarro: '$3.600' }, { id: 3, name: 'Americano', jarro: '$3.200', mediano: '$2.800', grande: '$3.000' }, { id: 4, name: 'Long Black', jarro: '$3.200', grande: '$3.200' } ] },
                    { category: 'CAFÉ MÁS LECHE', items: [ { id: 5, name: 'Espresso Macchiato', pocillo: '$2.100' }, { id: 6, name: 'Cortado', pocillo: '$2.700', jarro: '$2.900', mediano: '$3.100', grande: '$3.400' }, { id: 7, name: 'Flat White', jarro: '$3.300', mediano: '$3.600' }, { id: 8, name: 'Latte', jarro: '$3.000', mediano: '$3.200' }, { id: 9, name: 'Capuccino', jarro: '$3.100', mediano: '$3.300' }, { id: 10, name: 'Latte Saborizado', jarro: '$3.300', mediano: '$3.600' } ] },
                    { category: 'BEBIDAS FRIAS', items: [ { id: 11, name: 'Café Americano Frío', mediano: '$3.100' }, { id: 12, name: 'Latte Frío', mediano: '$3.400' }, { id: 13, name: 'Latte Saborizado Frío', mediano: '$3.700' }, { id: 14, name: 'Licuado de Banana', mediano: '$3.400' }, { id: 15, name: 'Licuado de Frutilla', mediano: '$3.800' }, { id: 16, name: 'Licuado de Durazno', mediano: '$3.500' }, { id: 17, name: 'Jugo de Naranja', mediano: '$2.800' }, { id: 18, name: 'Café Tonic', mediano: '$3.600' }, { id: 19, name: 'Café Tonic con Naranja', mediano: '$3.400' } ] },
                    { category: 'PANADERÍA', items: [ { id: 20, name: 'Medialuna', mediano: '$900' }, { id: 21, name: 'Criollo', mediano: '$600' }, { id: 22, name: 'Scon de Queso', mediano: '$1.400' }, { id: 23, name: 'Croissant', mediano: '$1.500' }, { id: 24, name: 'Croissant Bicolor', mediano: '$1.800' }, { id: 25, name: 'Croissant Jamón y Queso', mediano: '$2.700' } ] },
                    { category: 'PASTELERÍA', items: [ { id: 26, name: 'Budín Naranja y Choco', mediano: '$2.000' }, { id: 27, name: 'Budín Limón y Amapola', mediano: '$2.000' }, { id: 28, name: 'Brownie con Nuez', mediano: '$2.200' }, { id: 29, name: 'Alfajor de Fruta', mediano: '$1.800' }, { id: 30, name: 'Alfajor DDL Chocolate', mediano: '$2.000' }, { id: 31, name: 'Pasta Frola', mediano: '$2.200' }, { id: 32, name: 'Roll de Canela', mediano: '$2.200' }, { id: 33, name: 'Carrot Cake', mediano: '$2.500' } ] },
                    { category: 'COMBOS', items: [ { id: 34, name: 'Combo: 1 Medialuna + 1 Criollo', mediano: '$2.800', grande: '$3.200' }, { id: 35, name: 'Combo: 2 Medialunas', mediano: '$3.100', grande: '$3.500' }, { id: 36, name: 'Combo: Roll de Canela', mediano: '$3.800', grande: '$4.200' }, { id: 37, name: 'Combo: Croissant', mediano: '$3.400', grande: '$3.800' } ] },
                    { category: 'EXTRAS', items: [ { id: 38, name: 'Shot Extra de Café', mediano: '$400' }, { id: 39, name: 'Shot Extra de Syrup', mediano: '$400' }, { id: 40, name: 'Syrup (Vainilla, Caramelo, etc)', mediano: '$400' } ] }
                ];
                const stmt = db.prepare("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                baseMenu.forEach(category => {
                    category.items.forEach(item => {
                        stmt.run(item.id, item.name, category.category, item.stock || 99, item.pocillo || null, item.jarro || null, item.mediano || null, item.grande || null);
                    });
                });
                stmt.finalize();
            }
        });
    });
});

// --- API Endpoints ---
app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) { res.status(500).json({ "error": err.message }); return; }
        const menuOrganizado = rows.reduce((acc, item) => {
            let categoria = acc.find(c => c.category === item.category);
            if (!categoria) {
                categoria = { category: item.category, items: [] };
                acc.push(categoria);
            }
            categoria.items.push({ id: item.id, name: item.name, stock: item.stock, pocillo: item.price_pocillo, jarro: item.price_jarro, mediano: item.price_mediano, grande: item.price_grande });
            return acc;
        }, []);
        res.json(menuOrganizado);
    });
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
