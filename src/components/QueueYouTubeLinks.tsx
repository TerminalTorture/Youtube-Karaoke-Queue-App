import React, { useState, useEffect, useRef } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Input,
  Label,
  Button,
  Card,
  Body1,
  Body2,
  Link,
  Subtitle2,
  Skeleton,
  SkeletonItem,
} from '@fluentui/react-components';
import { 
  PlayRegular, 
  ArrowUpRegular, 
  ArrowDownRegular, 
  DismissRegular,
  AddRegular 
} from '@fluentui/react-icons';

interface QueueYouTubeLinksProps {
  onPlayVideo: (videoId: string) => void;
  queue: QueueItem[];
  onQueueUpdate: (queue: QueueItem[]) => void;
}

interface QueueItem {
  link: string;
  username: string;
  title?: string;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalL),
    ...shorthands.padding(tokens.spacingVerticalM),
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalM),
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  queueItemContent: {
    flex: 1,
    minWidth: 0,
  },
  queueControls: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  infoCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
});

const QueueYouTubeLinks: React.FC<QueueYouTubeLinksProps> = ({ onPlayVideo, queue = [], onQueueUpdate }) => {
  const styles = useStyles();
  const [queueItems, setQueueItems] = useState<QueueItem[]>(queue || []);
  const [newLink, setNewLink] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loadingTitles, setLoadingTitles] = useState<Set<number>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);

  // Sync with parent queue
  useEffect(() => {
    setQueueItems(queue || []);
  }, [queue]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3003');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'queue') {
          setQueueItems(msg.queue);
          if (onQueueUpdate) {
            onQueueUpdate(msg.queue);
          }
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
  }, [onPlayVideo, onQueueUpdate]);

  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  // Extract YouTube video ID from various URL formats
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return url;
  };

  // Fetch video title using YouTube oEmbed API
  const fetchVideoTitle = async (videoId: string): Promise<string> => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title || 'Unknown Title';
      }
    } catch (error) {
      console.error('Error fetching video title:', error);
    }
    return 'Unknown Title';
  };

  const handleAddLink = async () => {
    if (newLink.trim()) {
      const linkToAdd = newLink;
      const wasQueueEmpty = queueItems.length === 0;
      const videoId = extractVideoId(linkToAdd);

      // Add item with loading title
      const newItem: QueueItem = { 
        link: linkToAdd, 
        username: username.trim() || 'Anonymous',
        title: 'Loading...'
      };

      const updated = [...queueItems, newItem];
      setQueueItems(updated);
      if (onQueueUpdate) {
        onQueueUpdate(updated);
      }
      sendMessage({ type: 'queue', queue: updated });
      setNewLink('');

      // Fetch video title
      if (videoId) {
        setLoadingTitles(prev => new Set(prev).add(updated.length - 1));
        const title = await fetchVideoTitle(videoId);
        
        setQueueItems(currentItems => {
          const updatedItems = currentItems.map((item, index) => 
            index === updated.length - 1 ? { ...item, title } : item
          );
          if (onQueueUpdate) {
            onQueueUpdate(updatedItems);
          }
          sendMessage({ type: 'queue', queue: updatedItems });
          return updatedItems;
        });
        
        setLoadingTitles(prev => {
          const newSet = new Set(prev);
          newSet.delete(updated.length - 1);
          return newSet;
        });
      }

      if (wasQueueEmpty) {
        handlePlayVideo(linkToAdd);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    const updated = queueItems.filter((_, i) => i !== index);
    setQueueItems(updated);
    if (onQueueUpdate) {
      onQueueUpdate(updated);
    }
    sendMessage({ type: 'queue', queue: updated });
  };

  const handleMoveItemUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...queueItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setQueueItems(newItems);
    if (onQueueUpdate) {
      onQueueUpdate(newItems);
    }
    sendMessage({ type: 'queue', queue: newItems });
  };

  const handleMoveItemDown = (index: number) => {
    if (index >= queueItems.length - 1) return;
    const newItems = [...queueItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setQueueItems(newItems);
    if (onQueueUpdate) {
      onQueueUpdate(newItems);
    }
    sendMessage({ type: 'queue', queue: newItems });
  };

  const handlePlayVideo = (link: string) => {
    const videoId = extractVideoId(link);
    onPlayVideo(videoId || link);
    sendMessage({ type: 'play', videoId: videoId || link });
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputSection}>
        <div>
          <Label htmlFor="username">Your Name</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name (optional)"
          />
        </div>
        
        <div>
          <Label htmlFor="youtube-link">YouTube Link</Label>
          <Input
            id="youtube-link"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Enter YouTube link or video ID"
          />
        </div>
        
        <Button 
          appearance="primary"
          icon={<AddRegular />}
          onClick={handleAddLink} 
          disabled={!newLink.trim()}
        >
          Add to Queue
        </Button>
      </div>
      
      <Card className={styles.infoCard}>
        <Body2>
          Open the <Link href="/player" target="_blank">player screen</Link> on another device or window
        </Body2>
      </Card>
      
      <div>
        <Subtitle2>Queue ({queueItems.length})</Subtitle2>
        {queueItems.length === 0 ? (
          <Body1 style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>
            No songs in queue. Add some!
          </Body1>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS, marginTop: tokens.spacingVerticalM }}>
            {queueItems.map((item, index) => (
              <div key={index} className={styles.queueItem}>
                <Button
                  appearance="primary"
                  icon={<PlayRegular />}
                  onClick={() => handlePlayVideo(item.link)}
                  size="small"
                >
                  Play
                </Button>
                <div className={styles.queueItemContent}>
                  {loadingTitles.has(index) ? (
                    <Skeleton>
                      <SkeletonItem size={16} />
                    </Skeleton>
                  ) : (
                    <Body1 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title || item.link}
                    </Body1>
                  )}
                  <Body2 style={{ color: tokens.colorNeutralForeground3 }}>
                    Added by: {item.username}
                  </Body2>
                </div>
                <div className={styles.queueControls}>
                  <Button
                    appearance="subtle"
                    icon={<ArrowUpRegular />}
                    onClick={() => handleMoveItemUp(index)}
                    size="small"
                    disabled={index === 0}
                    aria-label="Move up"
                  />
                  <Button
                    appearance="subtle"
                    icon={<ArrowDownRegular />}
                    onClick={() => handleMoveItemDown(index)}
                    size="small"
                    disabled={index === queueItems.length - 1}
                    aria-label="Move down"
                  />
                  <Button
                    appearance="subtle"
                    icon={<DismissRegular />}
                    onClick={() => handleRemoveItem(index)}
                    size="small"
                    aria-label="Remove"
                    style={{ color: tokens.colorPaletteRedForeground1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueYouTubeLinks;
