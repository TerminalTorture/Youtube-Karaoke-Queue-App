"use client";

import React, { useState, useEffect, useRef } from 'react';
import Player from '../../components/Player';
import {
  makeStyles,
  shorthands,
  tokens,
  Title1,
  Card,
  Body1,
  Link,
  Button,
} from '@fluentui/react-components';
import { NextRegular } from '@fluentui/react-icons';

interface QueueItem {
  link: string;
  username: string;
  title?: string;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalXXL),
    ...shorthands.padding(
      tokens.spacingVerticalXXL,
      tokens.spacingHorizontalXXL
    ),
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
  playerContainer: {
    width: '100%',
    maxWidth: '1024px',
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.overflow('hidden'),
    boxShadow: tokens.shadow64,
  },
  waitingContainer: {
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalXXL),
  },
  infoCard: {
    width: '100%',
    maxWidth: '1024px',
    marginTop: tokens.spacingVerticalXXL,
    textAlign: 'center',
  },
  controlsContainer: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalM),
    marginTop: tokens.spacingVerticalL,
    justifyContent: 'center',
  },
});

const PlayerPage: React.FC = () => {
  const styles = useStyles();
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return url;
  };

  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  const handlePlayNext = () => {
    if (!currentVideoId || queue.length === 0) {
      return;
    }

    const currentIndex = queue.findIndex(
      (item) => extractVideoId(item.link) === currentVideoId
    );

    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextItem = queue[currentIndex + 1];
      const nextVideoId = extractVideoId(nextItem.link);
      if (nextVideoId) {
        setCurrentVideoId(nextVideoId);
        localStorage.setItem('currentVideoId', nextVideoId);
        sendMessage({ type: 'play', videoId: nextVideoId });
      }
    } else {
      // End of queue
      setCurrentVideoId(null);
      localStorage.removeItem('currentVideoId');
    }
  };

  const hasNextVideo = () => {
    if (!currentVideoId || queue.length === 0) return false;
    const currentIndex = queue.findIndex(
      (item) => extractVideoId(item.link) === currentVideoId
    );
    return currentIndex !== -1 && currentIndex < queue.length - 1;
  };

  const getCurrentVideoTitle = () => {
    if (!currentVideoId || queue.length === 0) return null;
    const currentItem = queue.find(
      (item) => extractVideoId(item.link) === currentVideoId
    );
    return currentItem?.title || null;
  };

  useEffect(() => {
    const storedVideoId = localStorage.getItem('currentVideoId');
    if (storedVideoId) {
      setCurrentVideoId(storedVideoId);
    }

    const ws = new WebSocket('ws://localhost:3003');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'play') {
          setCurrentVideoId(msg.videoId);
          localStorage.setItem('currentVideoId', msg.videoId);
        } else if (msg.type === 'queue') {
          setQueue(msg.queue);
        }
      } catch (err) {
        console.error('WS message error', err);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentVideoId' && e.newValue) {
        setCurrentVideoId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Title1 as="h1" className={styles.title}>
        🎤 Karaoke Player
      </Title1>
      
      {currentVideoId ? (
        <div className={styles.playerContainer}>
          <Player videoId={currentVideoId} onEnd={handlePlayNext} />
          <div className={styles.controlsContainer}>
            <Button 
              appearance="primary" 
              icon={<NextRegular />}
              onClick={handlePlayNext}
              disabled={queue.length <= 1}
            >
              Next Video
            </Button>
          </div>
          {getCurrentVideoTitle() && (
            <Card style={{ margin: tokens.spacingVerticalM, textAlign: 'center' }}>
              <Body1>Now Playing: {getCurrentVideoTitle()}</Body1>
            </Card>
          )}
        </div>
      ) : (
        <Card className={styles.waitingContainer}>
          <Title1 as="h2">Waiting for video selection...</Title1>
          <Body1>Use the Queue Manager to select a video to play</Body1>
        </Card>
      )}
      
      <Card className={styles.infoCard}>
        <Body1>
          This screen shows the currently playing video. Control it from the{' '}
          <Link href="/queue" target="_blank">
            queue manager
          </Link>
        </Body1>
      </Card>
    </div>
  );
};

export default PlayerPage;