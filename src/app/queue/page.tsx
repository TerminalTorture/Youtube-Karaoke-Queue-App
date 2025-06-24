"use client";

import React, { useState, useEffect, useRef } from 'react';
import QueueYouTubeLinks from '../../components/QueueYouTubeLinks';
import {
  makeStyles,
  shorthands,
  tokens,
  Title1,
  Card,
  CardHeader,
  Subtitle2,
  Link,
  Button,
  Body1,
} from '@fluentui/react-components';
import { NextRegular, ArrowShuffleRegular, DeleteRegular } from '@fluentui/react-icons';

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
  },
  card: {
    width: '100%',
    maxWidth: '1024px',
  },
  infoCard: {
    width: '100%',
    maxWidth: '1024px',
    marginTop: tokens.spacingVerticalXXL,
  },
  controlsContainer: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalM),
    marginTop: tokens.spacingVerticalL,
    flexWrap: 'wrap',
    justifyContent: 'center',
    ...shorthands.padding(tokens.spacingVerticalM),
  },
});

const QueuePage: React.FC = () => {
  const styles = useStyles();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
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

  const handlePlayVideo = (videoId: string) => {
    localStorage.setItem('currentVideoId', videoId);
    setCurrentVideoId(videoId);
    sendMessage({ type: 'play', videoId });
  };

  const handlePlayNext = () => {
    if (!currentVideoId || queue.length === 0) {
      // If no current video, play the first one
      if (queue.length > 0) {
        const firstVideoId = extractVideoId(queue[0].link);
        if (firstVideoId) {
          handlePlayVideo(firstVideoId);
        }
      }
      return;
    }

    const currentIndex = queue.findIndex(
      (item) => extractVideoId(item.link) === currentVideoId
    );

    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextItem = queue[currentIndex + 1];
      const nextVideoId = extractVideoId(nextItem.link);
      if (nextVideoId) {
        handlePlayVideo(nextVideoId);
      }
    }
  };

  const handleClearQueue = () => {
    setQueue([]);
    sendMessage({ type: 'queue', queue: [] });
    setCurrentVideoId(null);
    localStorage.removeItem('currentVideoId');
  };

  const handleShuffleQueue = () => {
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    sendMessage({ type: 'queue', queue: shuffled });
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
        console.log('Received WebSocket message:', msg);
        if (msg.type === 'queue') {
          console.log('Setting queue to:', msg.queue);
          setQueue(msg.queue);
        } else if (msg.type === 'play') {
          console.log('Setting current video to:', msg.videoId);
          setCurrentVideoId(msg.videoId);
          localStorage.setItem('currentVideoId', msg.videoId);
        }
      } catch (err) {
        console.error('WS message error', err);
      }
    };

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const hasNextVideo = () => {
    if (!currentVideoId || queue.length === 0) return queue.length > 0;
    const currentIndex = queue.findIndex(
      (item) => extractVideoId(item.link) === currentVideoId
    );
    return currentIndex < queue.length - 1;
  };

  console.log('Queue state:', { queue: queue.length, currentVideoId, hasNext: hasNextVideo() });

  return (
    <div className={styles.container}>
      <Title1 as="h1" align="center">
        🎤 Karaoke Queue Manager
      </Title1>

      <Card className={styles.card}>
        <CardHeader header={<Subtitle2>Queue Controls</Subtitle2>} />
        <div className={styles.controlsContainer}>
          <Button
            appearance="primary"
            icon={<NextRegular />}
            onClick={handlePlayNext}
            disabled={queue.length === 0}
          >
            {!currentVideoId && queue.length > 0 ? 'Play First' : 'Next Video'}
          </Button>
          <Button
            appearance="secondary"
            icon={<ArrowShuffleRegular />}
            onClick={handleShuffleQueue}
            disabled={queue.length < 2}
          >
            Shuffle Queue
          </Button>
          <Button
            appearance="secondary"
            icon={<DeleteRegular />}
            onClick={handleClearQueue}
            disabled={queue.length === 0}
          >
            Clear Queue
          </Button>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader header={<Subtitle2>Queue</Subtitle2>} />
        <QueueYouTubeLinks 
          onPlayVideo={handlePlayVideo} 
          queue={queue}
          onQueueUpdate={setQueue}
        />
      </Card>

      <Card className={styles.infoCard}>
        <Body1>
          Use this page to manage the queue while the{" "}
          <Link href="/player" target="_blank">
            player screen
          </Link>{" "}
          displays on another device
        </Body1>
      </Card>
    </div>
  );
};

export default QueuePage;