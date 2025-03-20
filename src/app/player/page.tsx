"use client";

import React, { useState, useEffect } from 'react';
import Player from '../../components/Player';

const PlayerPage: React.FC = () => {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Setup event listener to receive video ID from another page/window
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentKaraokeVideo' && e.newValue) {
        setCurrentVideoId(e.newValue);
      }
    };

    // Check if there's already a video ID in local storage
    const storedVideoId = localStorage.getItem('currentKaraokeVideo');
    if (storedVideoId) {
      setCurrentVideoId(storedVideoId);
    }

    // Listen for changes in local storage (from the queue page)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="container mx-auto p-4 bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-white text-center">🎤 Karaoke Player</h1>
      
      {currentVideoId ? (
        <div className="rounded-lg overflow-hidden shadow-2xl">
          <Player videoId={currentVideoId} />
        </div>
      ) : (
        <div className="bg-gray-900 p-12 rounded-lg text-center shadow-xl">
          <h2 className="text-white text-2xl mb-4">Waiting for video selection...</h2>
          <p className="text-gray-400">Use the Queue Manager to select a video to play</p>
        </div>
      )}
      
      <div className="mt-6 p-4 text-center bg-gray-800 border border-gray-700 rounded-lg">
        <p className="text-gray-300">
          This screen shows the currently playing video. Control it from the
          <a href="/queue" target="_blank" className="text-blue-400 font-bold px-1 underline">queue manager</a>
        </p>
      </div>
    </div>
  );
};

export default PlayerPage;