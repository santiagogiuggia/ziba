// 1. Importar las herramientas
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 2. Configuración inicial
const app = express();
const PORT = 3000; // El puerto donde se ejecutará el servidor

// 3. Conexión a la Base de Datos
// Esto crea (si no existe) un archivo 'cafe.db' que guardará todos los datos.
const dbPath = path.resolve(__dirname, 'cafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error al abrir la base de datos:", err.message);
    } else {
        console.log("Conectado a la base de datos SQLite 'cafe.db'.");
        // Aquí crearemos las tablas necesarias cuando el servidor inicie
        db.exec(`
            CREATE TABLE IF NOT EXISTS ventas (
                id INTEGER PRIMARY KEY,
                fecha TEXT NOT NULL,
                total REAL NOT NULL,
                items TEXT NOT NULL
            );
            -- Podemos añadir más tablas como 'productos' o 'ingredientes' más adelante
        `, (err) => {
            if (err) {
                console.error("Error al crear tablas:", err.message);
            } else {
                console.log("Tablas aseguradas en la base de datos.");
            }
        });
    }
});

// 4. Servir los archivos estáticos del frontend
// Le decimos a Express que todos los archivos de la carpeta 'public' son accesibles desde el navegador.
app.use(express.static('public'));

// 5. Ruta de prueba de la API
// Una API es cómo se comunicará nuestro frontend con este servidor.
app.get('/api/test', (req, res) => {
    res.json({ message: "¡El backend del café está funcionando correctamente!" });
});

// 6. Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
