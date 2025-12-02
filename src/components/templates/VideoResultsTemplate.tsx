'use client';

import React from 'react';
import SearchVideos from '../SearchVideos';

interface VideoResult {
  url: string;
  title: string;
  thumbnail?: string;
  img_src?: string;
}

interface VideoResultsTemplateProps {
  videos: VideoResult[];
  query?: string;
}

const VideoResultsTemplate: React.FC<VideoResultsTemplateProps> = ({
  videos,
  query,
}) => {
  // Ensure videos have img_src for SearchVideos component
  const formattedVideos = videos.map((video) => ({
    ...video,
    img_src: video.img_src || video.thumbnail || '',
  }));

  return (
    <div className="w-full">
      {query && (
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
          Videos: {query}
        </h3>
      )}
      <SearchVideos
        videos={formattedVideos}
        query={query || ''}
      />
    </div>
  );
};

export default VideoResultsTemplate;

