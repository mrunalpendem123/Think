'use client';

import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import Lightbox, { VideoSlide } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

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
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slides: VideoSlide[] = videos.map((video) => ({
    type: 'video-slide',
    src: video.url,
    iframe_src: video.url,
  }));

  return (
    <div className="w-full">
      {query && (
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
          Videos: {query}
        </h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div
            key={index}
            className="relative cursor-pointer overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedIndex(index);
              setOpen(true);
            }}
          >
            <div className="relative aspect-video">
              <img
                src={video.thumbnail || video.img_src || video.url}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                <PlayCircle className="text-white" size={48} />
              </div>
            </div>
            <p className="mt-2 text-sm text-black dark:text-white line-clamp-2">
              {video.title}
            </p>
          </div>
        ))}
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={selectedIndex}
      />
    </div>
  );
};

export default VideoResultsTemplate;

