import React from 'react';
import YouTube from 'react-youtube';

interface PlayerProps {
  videoId: string;
}

const Player: React.FC<PlayerProps> = ({ videoId }) => {
  return (
    <div className="mt-4">
      <YouTube videoId={videoId} opts={{ width: '100%', height: '390' }} />
    </div>
  );
};

export default Player;
