const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Base de Datos ---
// Usamos un archivo físico para que los datos sean permanentes
const dbPath = path.resolve(__dirname, 'cafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("FATAL: Error al abrir la base de datos:", err.message);
        process.exit(1);
    }
    console.log("Conectado a la base de datos SQLite 'cafe.db'.");
    initializeDatabase();
});

function initializeDatabase() {
    db.serialize(() => {
        // 1. Crear todas las tablas
        db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, stock INTEGER NOT NULL, price_pocillo TEXT, price_jarro TEXT, price_mediano TEXT, price_grande TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, date TEXT NOT NULL, total REAL NOT NULL, items TEXT NOT NULL, payment_method TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
        
        // 2. La última tabla llama a la siguiente función para asegurar el orden
        db.run(`CREATE TABLE IF NOT EXISTS caja_sesiones (id INTEGER PRIMARY KEY AUTOINCREMENT, fecha_apertura TEXT NOT NULL, monto_inicial REAL NOT NULL, cajero TEXT NOT NULL, barista TEXT, estado TEXT NOT NULL)`, (err) => {
            if (err) { return console.error("Error al crear tabla caja_sesiones:", err.message); }
            populateData();
        });
    });
}

function populateData() {
    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => { if (!row) { db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin')"); } });
    db.get("SELECT count(*) as count FROM products", (err, row) => {
        if (err) { return console.error("Error al verificar productos:", err.message); }
        if (row && row.count === 0) {
            console.log("Poblando base de datos con el menú completo...");
            const baseMenu = [
                { category: 'CAFE', items: [ { id: 1, name: 'Expresso', pocillo: '$2.800'}, { id: 2, name: 'Expreso doble o Doppio', mediano: '$3.200'}, { id: 3, name: 'Americano Long Black (filtro simple)', jarro: '$3.000', mediano: '$3.200', grande: '$3.500' }, { id: 4, name: 'Americano Long Black (filtro doble)', jarro: '$3.200', mediano: '$3.400', grande: '$3.500' }] },
                { category: 'CAFÉ MÁS LECHE', items: [ { id: 5, name: 'Expresso macchiato', pocillo: '$2.900'}, { id: 6, name: 'Cortado', jarro: '$3.300', mediano: '$3.500', grande: '$4.300' }, { id: 7, name: 'Apenas cortado', jarro: '$3.500', mediano: '$3.800', grande: '$4.400' }, { id: 8, name: 'Flat White', jarro: '$3.800', mediano: '$4.200' }, { id: 9, name: 'Latte/Latte Macchiato', jarro: '$3.300', mediano: '$3.500', grande: '$3.900' }, { id: 10, name: 'Latte/Latte Macchiato Saborizado', jarro: '$3.800', mediano: '$4.200' }, { id: 11, name: 'Capuccino', jarro: '$3.500', mediano: '$3.800' }, { id: 12, name: 'Latte Matcha', mediano: '$3.500', grande: '$3.800' } ] },
                { category: 'BEBIDAS FRIAS SIN ALCOHOL', items: [ { id: 13, name: 'Café Americano (frío)', mediano: '$3.400' }, { id: 14, name: 'Ice Latte', mediano: '$4.000' }, { id: 15, name: 'Ice Latte Saborizado', mediano: '$4.300' }, { id: 16, name: 'Espresso Tonic', mediano: '$3.600' }, { id: 17, name: 'Espresso Tonic con jugo de naranja', mediano: '$3.800' }, { id: 18, name: 'Licuado de Banana', mediano: '$3.800' }, { id: 19, name: 'Licuado de Durazno', mediano: '$4.000' }, { id: 20, name: 'Licuado de mango', mediano: '$4.100' }, { id: 21, name: 'Licuado de frutos rojos', mediano: '$4.500' }, { id: 22, name: 'Licuado de frutilla', mediano: '$4.500' }, { id: 23, name: 'Licuado de Melon', mediano: '$4.000' }, { id: 24, name: 'Jugo de Naranja', mediano: '$2.900' }, { id: 25, name: 'Agua mineral', mediano: '$1.600' }, { id: 26, name: 'Hoppy Tea Fermentum', mediano: '$2.900' } ] },
                { category: 'COMBOS', items: [ { id: 27, name: '1 medialuna y 1 criollo', mediano: '$4.800', grande: '$5.200' }, { id: 28, name: '2 medialunas', mediano: '$5.100', grande: '$5.400' }, { id: 29, name: '1 roll de canela o 1 pan de chocolate', mediano: '$6.200', grande: '$6.600' } ] },
                { category: 'ACOMPAÑAMIENTO', items: [ { id: 30, name: 'Medialuna', mediano: '$900' }, { id: 31, name: 'Criollo', mediano: '$600' }, { id: 32, name: 'Pasta frola', mediano: '$2.500' }, { id: 33, name: 'Budin de zanahoria especiado con nueces', mediano: '$2.600' }, { id: 34, name: 'Budin de limon y amapola', mediano: '$2.500' }, { id: 35, name: 'Brownie con nuez', mediano: '$3.400' }, { id: 36, name: 'Roll de canela', mediano: '$3.000' }, { id: 37, name: 'Pan de chocolate', mediano: '$3.000' }, { id: 38, name: 'Scon de queso', mediano: '$2.500' }, { id: 39, name: 'Croissant clasico', mediano: '$1.900' }, { id: 40, name: 'Croissant bicolor', mediano: '$2.100' }, { id: 41, name: 'Croissant bicolor de chocolate relleno marroc', mediano: '$4.000' }, { id: 42, name: 'Croissant bicolor red velver relleno', mediano: '$4.000' }, { id: 43, name: 'Sandwich de jamon y queso con pan arabe de salvado', mediano: '$3.300' }, { id: 44, name: 'Croissant clasico con jamon y queso', mediano: '$3.800' }, { id: 45, name: 'Alfajor de maicena', mediano: '$650' } ] },
                { category: 'BEBIDAS FRIAS CON ALCOHOL', items: [ { id: 46, name: 'Lager', mediano: '$3.000' }, { id: 47, name: 'Scotch', mediano: '$3.000' }, { id: 48, name: 'American Pale Ale APA', mediano: '$3.800' }, { id: 49, name: 'Session IPA', mediano: '$3.800' }, { id: 50, name: 'American IPA', mediano: '$4.500' }, { id: 51, name: 'American Amber Ale AAA', mediano: '$3.800' } ] },
                { category: 'EXTRAS', items: [ { id: 52, name: 'Shot Extra de café', mediano: '$1.700' }, { id: 53, name: 'Adicional por leche almendra', mediano: '$800' } ] }
            ];
            const sql = "INSERT INTO products (id, name, category, stock, price_pocillo, price_jarro, price_mediano, price_grande) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return console.error("Error al iniciar transacción:", err.message);
                const stmt = db.prepare(sql);
                baseMenu.forEach(cat => { cat.items.forEach(item => { stmt.run(item.id, item.name, cat.category, item.stock || 99, item.pocillo || null, item.jarro || null, item.mediano || null, item.grande || null); }); });
                stmt.finalize((err) => {
                    if (err) return console.error("Error al finalizar statement:", err.message);
                    db.run("COMMIT", (err) => { if (err) { console.error("Error al hacer COMMIT de productos:", err.message); } else { console.log("Base de datos poblada con el menú completo."); } });
                });
            });
        } else {
            console.log("La tabla de productos ya tiene datos.");
        }
    });
    loadMpToken();
}

const loadMpToken = () => { /* ... */ };

// --- API ---
app.post('/api/login', (req, res) => { /* ... */ });
app.get('/api/menu', (req, res) => { /* ... */ });
// ... (Y todas las demás rutas API que ya teníamos)

// --- SERVIR ARCHIVOS Y ARRANCAR SERVIDOR ---
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});