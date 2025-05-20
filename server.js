
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Track connected users and emote usage
let onlineUsers = 0;
let commandsUsed = 0;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
    onlineUsers++;
    io.emit('stats', { onlineUsers, commandsUsed });
    
    socket.on('disconnect', () => {
        onlineUsers--;
        io.emit('stats', { onlineUsers, commandsUsed });
    });
});

// Add bot event emitter
global.emitBotEvent = (eventType, data) => {
    io.emit('botEvent', { type: eventType, data });
    if (eventType === 'command') commandsUsed++;
    io.emit('stats', { onlineUsers, commandsUsed });
};

http.listen(port, '0.0.0.0', () => {
    console.log(`Website running at http://0.0.0.0:${port}`);
});
