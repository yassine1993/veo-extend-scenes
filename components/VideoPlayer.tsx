
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { VideoCameraIcon } from './icons';

interface VideoPlayerProps {
  title: string;
  src: string | null;
  isLoading: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ title, src, isLoading }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-gray-300">{title}</h3>
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center w-full flex-grow relative overflow-hidden">
        {isLoading && <LoadingSpinner />}
        {!isLoading && src && (
          <video
            key={src}
            controls
            autoPlay
            loop
            muted
            className="w-full h-full object-contain"
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        {!isLoading && !src && (
          <div className="text-center text-gray-500">
            <VideoCameraIcon className="w-16 h-16 mx-auto mb-2" />
            <p>Your video will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
