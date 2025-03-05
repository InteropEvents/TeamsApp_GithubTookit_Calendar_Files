const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Handle React routing (frontend routing fallback mechanism)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.post('/resourceNotifications', (req, res) => {
    if (req.query && req.query.validationToken) {
        res.set('Content-Type', 'text/plain');
        res.send(req.query.validationToken);
        return;
    }
    const changeType = req.body.value[0].changeType;
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(req.body));
      }
    });
  
    res.sendStatus(202);
});

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

