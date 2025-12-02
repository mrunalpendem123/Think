'use client';

import React from 'react';
import SearchImages from '../SearchImages';

interface ImageResult {
  url: string;
  title: string;
  thumbnail?: string;
}

interface ImageGalleryTemplateProps {
  images: ImageResult[];
  query?: string;
}

const ImageGalleryTemplate: React.FC<ImageGalleryTemplateProps> = ({
  images,
  query,
}) => {
  // Convert to format expected by SearchImages component
  const formattedImages = images.map((img) => ({
    img_src: img.thumbnail || img.url,
    url: img.url,
    title: img.title,
  }));

  return (
    <div className="w-full">
      {query && (
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
          Images: {query}
        </h3>
      )}
      <SearchImages
        images={formattedImages}
        query={query || ''}
      />
    </div>
  );
};

export default ImageGalleryTemplate;

