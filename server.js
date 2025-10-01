const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
// Asegúrate de tener mercadopago instalado: npm install mercadopago
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Lógica de la Base de Datos y API ---
// (Aquí va todo el código de server.js que hemos desarrollado, incluyendo
// la conexión a la base de datos, la inicialización de tablas, y todas las rutas API)

// --- ORDEN CORRECTO DE RUTAS ---
// 1. Rutas API (todas las que empiezan con /api/...)
app.post('/api/login', (req, res) => { /* ... */ });
app.get('/api/menu', (req, res) => { /* ... */ });
// ... (y así con todas las demás rutas API)

// 2. Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 3. Ruta comodín (DEBE IR AL FINAL)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en el puerto ${PORT}`);
});