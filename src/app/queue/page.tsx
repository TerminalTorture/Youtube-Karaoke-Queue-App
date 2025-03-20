"use client";

import React, { useState } from 'react';
import QueueYouTubeLinks from '../../components/QueueYouTubeLinks';

const QueuePage: React.FC = () => {
  const handlePlayVideo = (videoId: string) => {
    // This function is passed to QueueYouTubeLinks
    // The component handles storing the videoId in localStorage
    // so it will be available to the player page
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">🎤 Karaoke Queue Manager</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Queue</h2>
        <QueueYouTubeLinks onPlayVideo={handlePlayVideo} />
      </div>
      
      <div className="mt-6 p-4 text-center bg-blue-100 border border-blue-300 rounded-lg">
        <p className="text-blue-800">
          Use this page to manage the queue while the 
          <a href="/player" target="_blank" className="text-blue-600 font-bold px-1 underline">player screen</a>
          displays on another device
        </p>
      </div>
    </div>
  );
};

export default QueuePage;