"use client";

import React from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">🎤 Karaoke Queue Manager</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/queue" className="block">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Queue Manager</h2>
            <p className="text-gray-700">Manage the karaoke queue from this page. Add YouTube links and control what plays next.</p>
            <div className="mt-4 text-center">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-md inline-block">Open Queue Manager</span>
            </div>
          </div>
        </Link>
        
        <Link href="/player" className="block">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Player Screen</h2>
            <p className="text-gray-700">Display this screen on your TV or projector to show the current karaoke video.</p>
            <div className="mt-4 text-center">
              <span className="bg-green-500 text-white px-4 py-2 rounded-md inline-block">Open Player Screen</span>
            </div>
          </div>
        </Link>
      </div>
      
      <div className="mt-8 p-4 bg-blue-100 border border-blue-300 rounded-lg">
        <h3 className="text-xl font-semibold mb-2 text-blue-800">How to use:</h3>
        <ol className="list-decimal pl-6 space-y-2 text-blue-900">
          <li><strong>Open the Player Screen</strong> on your TV or projector</li>
          <li><strong>Use the Queue Manager</strong> on your laptop or phone to add videos to the queue</li>
          <li><strong>Enter your name</strong> so everyone knows who added each song</li>
          <li><strong>Click "Play"</strong> on a video in the queue to send it to the player screen</li>
        </ol>
      </div>
    </div>
  );
};

export default HomePage;
