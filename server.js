const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Tambahkan ini

const app = express();
// Port 10000 wajib untuk Render Free Tier
const PORT = process.env.PORT || 10000;

// Konfigurasi CORS agar HANYA link GitHub Pages kamu yang bisa akses
app.use(cors());

// Inisialisasi Google AI (Gemini)
// Kamu harus memasukkan API Key di Dashboard Render (Environment Variable)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint untuk "Membangunkan" layar loading di HP
app.get('/wake', (req, res) => {
    res.json({ status: "online", message: "JustoCall is Ready!" });
});

const server = app.listen(PORT, () => {
    console.log(`Server JustoCall berjalan di port ${PORT}`);
});

// Setup WebSocket
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws) => {
    console.log('Koneksi Baru: User terhubung ke JustoCall');

    // Setup Model Gemini (1.5 Flash paling cepat untuk voice)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Kamu adalah JustoCall, asisten suara yang ramah dan membantu."
    });

    const chat = model.startChat();

    ws.on('message', async (msg) => {
        try {
            // Jika pesan berupa teks (untuk testing)
            const textMsg = msg.toString();
            console.log('User berbicara:', textMsg);

            // Kirim ke AI Gemini
            const result = await chat.sendMessage(textMsg);
            const response = await result.response;
            const responseText = response.text();

            // Kirim balik ke HP (Frontend)
            ws.send(JSON.stringify({
                type: 'text',
                content: responseText
            }));

        } catch (error) {
            console.error('AI Error:', error);
            ws.send(JSON.stringify({ type: 'error', content: 'AI sedang sibuk.' }));
        }
    });

    ws.on('close', () => {
        console.log('Koneksi JustoCall terputus');
    });

    // Kirim pesan sambutan otomatis saat pertama terhubung
    ws.send(JSON.stringify({ type: 'status', content: 'Terhubung ke AI JustoCall' }));
});
