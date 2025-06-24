const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3003 });

let queue = [];

wss.on('connection', (ws) => {
  // Send the current queue to the newly connected client
  ws.send(JSON.stringify({ type: 'queue', queue }));

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if (message.type === 'queue') {
      queue = message.queue;
      // Broadcast the updated queue to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'queue', queue }));
        }
      });
    } else {
      // Broadcast all other messages to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data.toString());
        }
      });
    }
  });
});

console.log('WebSocket server running on ws://localhost:3003');
