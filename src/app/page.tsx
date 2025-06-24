"use client";

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  makeStyles,
  shorthands,
  tokens,
  List,
  ListItem,
  Title3,
  Title1,
  Body1,
  Subtitle2,
} from '@fluentui/react-components';
import { MusicNote2Regular, TvRegular } from '@fluentui/react-icons';

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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    ...shorthands.gap(tokens.spacingHorizontalXXL),
    width: '100%',
    maxWidth: '1024px',
  },
  card: {
    width: '100%',
  },
  howToUseCard: {
    width: '100%',
    maxWidth: '1024px',
    marginTop: tokens.spacingVerticalXXL,
  },
});

const HomePage: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Title1 as="h1" align="center">
        🎤 Karaoke Queue Manager
      </Title1>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <CardHeader
            image={<MusicNote2Regular />}
            header={<Subtitle2>Queue Manager</Subtitle2>}
          />
          <Body1>
            Manage the karaoke queue from this page. Add YouTube links and
            control what plays next.
          </Body1>
          <CardFooter>
            <Link href="/queue" passHref>
              <Button appearance="primary">Open Queue Manager</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className={styles.card}>
          <CardHeader
            image={<TvRegular />}
            header={<Subtitle2>Player Screen</Subtitle2>}
          />
          <Body1>
            Display this screen on your TV or projector to show the current
            karaoke video.
          </Body1>
          <CardFooter>
            <Link href="/player" passHref>
              <Button>Open Player Screen</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card className={styles.howToUseCard}>
        <CardHeader header={<Title3>How to use:</Title3>} />
        <List>
          <ListItem>
            <strong>Open the Player Screen</strong> on your TV or projector
          </ListItem>
          <ListItem>
            <strong>Use the Queue Manager</strong> on your laptop or phone to
            add videos to the queue
          </ListItem>
          <ListItem>
            <strong>Enter your name</strong> so everyone knows who added each
            song
          </ListItem>
          <ListItem>
            <strong>Click "Play"</strong> on a video in the queue to send it
            to the player screen
          </ListItem>
        </List>
      </Card>
    </div>
  );
};

export default HomePage;
