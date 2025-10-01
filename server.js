const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let mpAccessToken = null;
const loadMpToken = () => {
    db.get("SELECT value FROM settings WHERE key = 'mp_access_token'", (err, row) => {
        if (row && row.value) {
            mpAccessToken = row.value;
            console.log("Token de Mercado Pago cargado.");
        } else {
            console.warn("ADVERTENCIA: El Access Token de Mercado Pago no está configurado.");
        }
    });
};

const dbPath = path.resolve(__dirname, 'cafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) { return console.error("Error al abrir la base de datos:", err.message); }
    console.log("Conectado a la base de datos SQLite 'cafe.db'.");

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, stock INTEGER NOT NULL, price_pocillo TEXT, price_jarro TEXT, price_mediano TEXT, price_grande TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY, date TEXT NOT NULL, total REAL NOT NULL, items TEXT NOT NULL, payment_method TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);

        db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
            if (!row) {
                db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin')");
                console.log("Usuario 'admin' con contraseña 'admin' creado.");
            }
        });
        
        db.get("SELECT count(*) as count FROM products", (err, row) => {
            if (err) { return console.error("Error al verificar productos:", err.message); }
            if (row && row.count === 0) {
                console.log("Poblando base de datos de productos...");
                const baseMenu = [ { category: 'COMBOS', items: [ { id: 1, name: '1 medialuna y 1 criollo', mediano: '$4.800', grande: '$5.200' }, { id: 2, name: '2 medialunas', mediano: '$5.100', grande: '$5.400' }, { id: 3, name: '1 roll de canela o 1 pan de chocolate', mediano: '$6.200', grande: '$6.600' } ] }, { category: 'ACOMPAÑAMIENTO', items: [ { id: 4, name: 'Medialuna', mediano: '$900' }, { id: 5, name: 'Criollo', mediano: '$600' }, { id: 6, name: 'Pasta Frola', mediano: '$2.200' }, { id: 7, name: 'Budín de zanahoria especiado con nueces', mediano: '$2.600' }, { id: 8, name: 'Budín de limón y amapola', mediano: '$2.500' }, { id: 9, name: 'Brownie con nuez', mediano: '$3.400' }, { id: 10, name: 'Roll de canela', mediano: '$3.000' }, { id: 11, name: 'Pan de chocolate', mediano: '$3.000' }, { id: 12, name: 'Scon de queso', mediano: '$2.500' }, { id: 13, name: 'Croissant clasico', mediano: '$1.900' }, { id: 14, name: 'Croissant bicolor', mediano: '$2.000' }, { id: 15, name: 'Croissant bicolor de chocolate relleno marroc', mediano: '$4.000' }, { id: 16, name: 'Croissant bicolor red velver relleno', mediano: '$4.000' }, { id: 17, name: 'Sandwich de jamon y queso con pan arabe de salvado', mediano: '$3.300' }, { id: 18, name: 'Croissant clasico con jamon y queso', mediano: '$3.800' }, { id: 19, name: 'Alfajor de maicena', mediano: '$650' } ] }, { category: 'BEBIDAS FRIAS CON ALCOHOL', items: [ { id: 20, name: 'Lager', mediano: '$3.000' }, { id: 21, name: 'Scotch', mediano: '$3.000' }, { id: 22, name: 'American Pale Ale APA', mediano: '$3.800' }, { id: 23, name: 'Session IPA', mediano: '$3.800' }, { id: 24, name: 'American IPA', mediano: '$4.500' }, { id: 25, name: 'American Amber Ale AAA', mediano: '$3.800' } ] } ];
                const sql = "INSERT INTO products (id, name, category, stock, price_pocillo, price_jarro, price_mediano, price_grande) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                const stmt = db.prepare(sql);
                db.run("BEGIN TRANSACTION");
                baseMenu.forEach(cat => { cat.items.forEach(item => { stmt.run(item.id, item.name, cat.category, item.stock || 99, item.pocillo || null, item.jarro || null, item.mediano || null, item.grande || null); }); });
                stmt.finalize();
                db.run("COMMIT", (err) => { if(err) { console.error("Error al hacer COMMIT de productos:", err.message); } else { console.log("Base de datos poblada con el menú inicial."); } });
            }
        });
        loadMpToken();
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) { return res.status(500).json({ error: err.message }); }
        if (row) {
            res.json({ success: true, message: 'Login exitoso' });
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    });
});

app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM products ORDER BY category, id", [], (err, rows) => {
        if (err) { res.status(500).json({ "error": err.message }); return; }
        const menuOrganizado = rows.reduce((acc, item) => {
            let categoria = acc.find(c => c.category === item.category);
            if (!categoria) { categoria = { category: item.category, items: [] }; acc.push(categoria); }
            categoria.items.push({ id: item.id, name: item.name, stock: item.stock, pocillo: item.price_pocillo, jarro: item.price_jarro, mediano: item.price_mediano, grande: item.price_grande });
            return acc;
        }, []);
        res.json(menuOrganizado);
    });
});

app.post('/api/sales', (req, res) => {
    const { id, date, total, items, paymentMethod } = req.body;
    if (!id || !date || !total || !items || !paymentMethod) { return res.status(400).json({ "error": "Datos incompletos." }); }
    const itemsJson = JSON.stringify(items);
    const sql = `INSERT INTO sales (id, date, total, items, payment_method) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [id, date, total, itemsJson, paymentMethod], function(err) {
        if (err) { console.error("ERROR AL INSERTAR VENTA:", err.message); return res.status(400).json({ "error": err.message }); }
        res.json({ message: "¡Venta guardada con éxito!", saleId: this.lastID });
    });
});

app.get('/api/sales', (req, res) => {
    db.all("SELECT * FROM sales ORDER BY date DESC", [], (err, rows) => {
        if (err) { res.status(500).json({ "error": err.message }); return; }
        const sales = rows.map(sale => ({ ...sale, items: JSON.parse(sale.items) }));
        res.json(sales);
    });
});

app.get('/api/settings/mp-token', (req, res) => {
    db.get("SELECT value FROM settings WHERE key = 'mp_access_token'", (err, row) => {
        if (err) { return res.status(500).json({ error: err.message }); }
        res.json({ token: row ? row.value : '' });
    });
});

app.post('/api/settings/mp-token', (req, res) => {
    const { token } = req.body;
    const sql = "INSERT OR REPLACE INTO settings (key, value) VALUES ('mp_access_token', ?)";
    db.run(sql, [token], (err) => {
        if (err) { return res.status(500).json({ error: err.message }); }
        loadMpToken();
        res.json({ message: 'Token de Mercado Pago guardado.' });
    });
});

app.post('/api/create-payment', async (req, res) => {
    if (!mpAccessToken) {
        return res.status(500).json({ error: 'El token de Mercado Pago no está configurado en el panel de administración.' });
    }
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const orderItems = req.body.items;
    if (!orderItems || orderItems.length === 0) { return res.status(400).json({ error: 'La orden está vacía' }); }
    const items = orderItems.map(item => ({ title: `${item.name} (${item.size})`, quantity: 1, currency_id: 'ARS', unit_price: item.price }));
    const preferenceBody = { items: items, back_urls: { success: req.headers.referer, failure: req.headers.referer, pending: req.headers.referer }, auto_return: 'approved' };
    try {
        const preference = new Preference(client);
        const result = await preference.create({ body: preferenceBody });
        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error("Error al crear la preferencia de MP:", error);
        res.status(500).json({ error: 'No se pudo generar el link de pago' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en el puerto ${PORT}`);
});