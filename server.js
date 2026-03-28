const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors'); // Tambahkan ini

const app = express();
// Render butuh port 10000 atau otomatis dari sistem
const PORT = process.env.PORT || 10000;

// IZINKAN akses dari GitHub Pages (CORS)
app.use(cors());

// Endpoint untuk "Membangunkan" layar loading di HP
app.get('/wake', (req, res) => {
    res.json({ status: "online", message: "JustoCall is Ready!" });
});

const server = app.listen(PORT, () => {
    console.log(`Server JustoCall berjalan di port ${PORT}`);
});

// Setup WebSocket untuk Suara
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Koneksi Baru: JustoCall terhubung');
    
    ws.on('message', (msg) => {
        // Logika pengolahan suara AI akan ada di sini
        console.log('Data suara diterima');
    });

    ws.on('close', () => console.log('Koneksi terputus'));
});
