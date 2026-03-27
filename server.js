const express = require('express');
const { WebSocketServer } = require('ws');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/wake', (req, res) => {
    res.json({ status: "online", message: "Server is Awake!" });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (msg) => console.log('Audio received'));
});
       
