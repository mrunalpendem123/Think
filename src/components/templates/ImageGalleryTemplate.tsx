'use client';

import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

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
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slides = images.map((img) => ({
    src: img.url,
    alt: img.title,
  }));

  return (
    <div className="w-full">
      {query && (
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
          Images: {query}
        </h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedIndex(index);
              setOpen(true);
            }}
          >
            <img
              src={img.thumbnail || img.url}
              alt={img.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
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

export default ImageGalleryTemplate;

