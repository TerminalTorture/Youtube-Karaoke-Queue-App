import React, { useState, useEffect, useRef } from 'react';

interface QueueYouTubeLinksProps {
  onPlayVideo: (videoId: string) => void;
}

interface QueueItem {
  link: string;
  username: string;
}

const QueueYouTubeLinks: React.FC<QueueYouTubeLinksProps> = ({ onPlayVideo }) => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [newLink, setNewLink] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'queue') {
          setQueueItems(msg.queue);
        } else if (msg.type === 'play') {
          onPlayVideo(msg.videoId);
        }
      } catch (err) {
        console.error('WS message error', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [onPlayVideo]);

  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  // Extract YouTube video ID from various URL formats
  const extractVideoId = (url: string): string | null => {
    // Handle different YouTube URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,  // Standard youtube.com/watch?v=ID
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,              // Short youtu.be/ID
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,    // Embed youtube.com/embed/ID
      /^([a-zA-Z0-9_-]{11})$/                                       // Just the ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return url; // If no pattern matches, assume the input is already an ID
  };

  const handleAddLink = () => {
    if (newLink.trim() && username.trim()) {
      const updated = [...queueItems, { link: newLink, username }];
      setQueueItems(updated);
      sendMessage({ type: 'queue', queue: updated });
      setNewLink('');
    }
  };

  const handlePlayVideo = (link: string) => {
    const videoId = extractVideoId(link);
    
    // Call the local player function
    onPlayVideo(videoId || link);

    sendMessage({ type: 'play', videoId: videoId || link });
  };

  return (
    <div>
      <div className="mb-4 space-y-2">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label htmlFor="youtube-link" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube Link
          </label>
          <input
            id="youtube-link"
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Enter YouTube link or video ID"
            className="border p-2 w-full rounded"
          />
        </div>
        
        <button 
          onClick={handleAddLink} 
          className="bg-blue-500 text-white p-2 w-full rounded"
          disabled={!newLink.trim() || !username.trim()}
        >
          Add to Queue
        </button>
      </div>
      
      <div className="mt-4 mb-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-gray-700">
          Open the <a href="/player" target="_blank" className="text-blue-600 font-medium underline">player screen</a> on another device or window
        </p>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Queue ({queueItems.length})</h3>
        {queueItems.length === 0 ? (
          <p className="text-gray-500 italic">No songs in queue. Add some!</p>
        ) : (
          <ul className="space-y-2">
            {queueItems.map((item, index) => (
              <li key={index} className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center">
                <button 
                  onClick={() => handlePlayVideo(item.link)} 
                  className="bg-green-500 text-white px-3 py-1 mr-3 rounded flex-shrink-0"
                >
                  Play
                </button>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-gray-800">{item.link}</p>
                  <p className="text-sm text-gray-500">Added by: {item.username}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QueueYouTubeLinks;
