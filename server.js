const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/wake', (req, res) => {
    res.json({ status: "online", message: "JustoCall Llama is Ready!" });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server aktif di port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.on('message', async (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            const userText = data.text;
            // Menerima Nama & Peran dari pengaturan frontend
            const aiName = data.name || "Vira";
            const aiRole = data.role || "Asisten ramah";

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: `Nama kamu adalah ${aiName}. Karakter/Peran kamu: ${aiRole}. Bicara sangat singkat (maksimal 2 kalimat), santai, dan gunakan gaya bahasa telepon. Jangan gunakan format teks seperti bintang atau pagar.` 
                    },
                    { role: "user", content: userText }
                ],
                model: "llama-3.3-70b-versatile",
            });

            const aiResponse = chatCompletion.choices[0].message.content;

            ws.send(JSON.stringify({
                type: 'text',
                content: aiResponse
            }));

        } catch (error) {
            console.error('Error:', error);
        }
    });
});
