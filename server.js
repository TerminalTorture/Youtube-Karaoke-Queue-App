const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

let queue = [];
let currentVideo = null;

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'init', queue, currentVideo }));

  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case 'add':
          if (data.item) {
            queue.push(data.item);
            broadcast({ type: 'queue', queue });
          }
          break;
        case 'play':
          if (data.videoId) {
            currentVideo = data.videoId;
            broadcast({ type: 'currentVideo', videoId: currentVideo });
          }
          break;
        case 'clear':
          queue = [];
          broadcast({ type: 'queue', queue });
          break;
      }
    } catch (err) {
      console.error('Invalid message', err);
    }
  });
});

console.log('WebSocket server running on ws://localhost:3001');
