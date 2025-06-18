# Karaoke Queue Manager

This is a [Next.js](https://nextjs.org) application that helps you manage your karaoke party by providing a queue management system and YouTube video player.

## Features

- **Queue Management**: Add YouTube karaoke videos to a queue with your name
- **Dual-Screen Setup**: Run the player on your TV/projector while managing the queue from your phone or laptop
- **Simple Interface**: Easy-to-use controls for adding songs and playing videos
- **YouTube Integration**: Works with any YouTube karaoke video
  
- ![image](https://github.com/user-attachments/assets/3f660654-dcfe-43f6-a788-47f5ba37e6d0)
- ![image](https://github.com/user-attachments/assets/afa764a5-bb19-4fe9-8808-840de652f1fd)
- ![image](https://github.com/user-attachments/assets/3318c816-5a0d-41fa-977e-cfdf61ed1e70)
## Getting Started

First, run the development server:

```bash
npm install

### Start the WebSocket server

In a separate terminal, run:

```bash
npm run ws-server
```

This server broadcasts queue changes and the current video to all connected clients.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. **Open the Player Screen** on your TV or projector by navigating to http://localhost:3000/player
2. **Use the Queue Manager** on your laptop or phone by navigating to http://localhost:3000/queue
3. **Enter your name** so everyone knows who added each song
4. **Paste YouTube links** of karaoke videos to add them to the queue
5. **Click "Play"** on a video in the queue to send it to the player screen

The app supports various YouTube URL formats, including:
- Standard YouTube links (youtube.com/watch?v=ID)
- Short links (youtu.be/ID)
- Embed links (youtube.com/embed/ID)
- Just the video ID

## Technology

This project uses:
- Next.js 15
- React 19
- react-youtube
- TailwindCSS
- TypeScript

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
