import React from 'react';
import YouTube from 'react-youtube';

interface PlayerProps {
  videoId: string;
  onEnd: () => void;
}

const Player: React.FC<PlayerProps> = ({ videoId, onEnd }) => {
  return (
    <div className="mt-4">
      <YouTube videoId={videoId} opts={{ width: '100%', height: '390' }} onEnd={onEnd} />
    </div>
  );
};

export default Player;
