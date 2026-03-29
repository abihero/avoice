const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
// Railway akan mengisi process.env.PORT secara otomatis
const PORT = process.env.PORT || 3000;

app.use(cors());

// Inisialisasi Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/wake', (req, res) => {
    res.json({ status: "online", message: "JustoCall Llama is Ready on Railway!" });
});

// PENTING: Tambahkan '0.0.0.0' agar Railway bisa mengarahkan trafik ke sini
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server JustoCall berjalan di port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Koneksi Baru: User terhubung ke JustoCall');

    ws.on('message', async (msg) => {
        try {
            // Kita coba baca pesan sebagai JSON (sesuai index.html terbaru)
            const data = JSON.parse(msg.toString());
            const userText = data.text;
            const userRole = data.role || "asisten suara ramah";

            console.log('User berbicara:', userText);

            // Panggil Llama 3 via Groq
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        // Sekarang AI akan mengikuti peran yang kamu set di HP!
                        content: `Kamu adalah JustoCall, asisten suara ramah dari CV Inovindo Artheon. Peranmu saat ini adalah: ${userRole}. Bicara singkat, padat, dan to-the-point seperti orang teleponan. Jangan gunakan simbol markdown.` 
                    },
                    { role: "user", content: userText }
                ],
                model: "llama3-8b-8192", 
            });

            const aiResponse = chatCompletion.choices[0].message.content;

            ws.send(JSON.stringify({
                type: 'text',
                content: aiResponse
            }));

        } catch (error) {
            // Jika pesan bukan JSON (misal teks biasa saat testing), handle agar tidak crash
            console.error('Proses pesan error:', error);
            if (error instanceof SyntaxError) {
                // Handle jika kiriman hanya teks biasa
                ws.send(JSON.stringify({ type: 'error', content: 'Format pesan salah.' }));
            } else {
                ws.send(JSON.stringify({ type: 'error', content: 'JustoCall sedang sibuk.' }));
            }
        }
    });

    ws.on('close', () => {
        console.log('Koneksi JustoCall terputus');
    });

    ws.send(JSON.stringify({ type: 'status', content: 'Terhubung ke AI JustoCall' }));
});
