const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const Groq = require('groq-sdk'); // Ganti library ke Groq

const app = express();
// Tetap pakai port 10000 untuk Render
const PORT = process.env.PORT || 10000;

app.use(cors());

// Gunakan API Key Groq yang diatur di Dashboard Render
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Endpoint bangunkan server
app.get('/wake', (req, res) => {
    res.json({ status: "online", message: "JustoCall (OpenSource) is Ready!" });
});

const server = app.listen(PORT, () => {
    console.log(`Server JustoCall berjalan di port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Koneksi Baru: User terhubung ke JustoCall');

    ws.on('message', async (msg) => {
        try {
            const userText = msg.toString();
            console.log('User berbicara:', userText);

            // Panggil Llama 3 (Open Source - Sangat Cepat)
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: "Kamu adalah JustoCall, asisten suara ramah dari CV Inovindo Artheon. Bicara singkat, padat, dan to-the-point seperti orang teleponan." 
                    },
                    { role: "user", content: userText }
                ],
                model: "llama3-8b-8192", // Model Open Source paling stabil & gratis
            });

            const aiResponse = chatCompletion.choices[0].message.content;

            // Kirim balik ke HP
            ws.send(JSON.stringify({
                type: 'text',
                content: aiResponse
            }));

        } catch (error) {
            console.error('Groq AI Error:', error);
            ws.send(JSON.stringify({ type: 'error', content: 'JustoCall sedang sibuk.' }));
        }
    });

    ws.on('close', () => {
        console.log('Koneksi JustoCall terputus');
    });

    ws.send(JSON.stringify({ type: 'status', content: 'Terhubung ke AI JustoCall' }));
});
