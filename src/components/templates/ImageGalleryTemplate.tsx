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
  const [slides, setSlides] = useState<any[]>([]);

  // Convert to format expected by lightbox
  const formattedImages = images.map((img) => ({
    img_src: img.thumbnail || img.url,
    url: img.url,
    title: img.title,
  }));

  const lightboxSlides = formattedImages.map((img) => ({
    src: img.img_src,
  }));

  return (
    <div className="w-full">
      {query && (
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
          Images: {query}
        </h3>
      )}
      {formattedImages.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {formattedImages.length > 4
              ? formattedImages.slice(0, 3).map((image, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    onClick={() => {
                      setOpen(true);
                      setSlides([
                        lightboxSlides[i],
                        ...lightboxSlides.slice(0, i),
                        ...lightboxSlides.slice(i + 1),
                      ]);
                    }}
                    key={i}
                    src={image.img_src}
                    alt={image.title}
                    className="h-full w-full aspect-video object-cover rounded-lg transition duration-200 active:scale-95 hover:scale-[1.02] cursor-zoom-in"
                  />
                ))
              : formattedImages.map((image, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    onClick={() => {
                      setOpen(true);
                      setSlides([
                        lightboxSlides[i],
                        ...lightboxSlides.slice(0, i),
                        ...lightboxSlides.slice(i + 1),
                      ]);
                    }}
                    key={i}
                    src={image.img_src}
                    alt={image.title}
                    className="h-full w-full aspect-video object-cover rounded-lg transition duration-200 active:scale-95 hover:scale-[1.02] cursor-zoom-in"
                  />
                ))}
            {formattedImages.length > 4 && (
              <button
                onClick={() => setOpen(true)}
                className="bg-light-100 hover:bg-light-200 dark:bg-dark-100 dark:hover:bg-dark-200 transition duration-200 active:scale-95 hover:scale-[1.02] h-auto w-full rounded-lg flex flex-col justify-between text-white p-2"
              >
                <div className="flex flex-row items-center space-x-1">
                  {formattedImages.slice(3, 6).map((image, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={image.img_src}
                      alt={image.title}
                      className="h-6 w-12 rounded-md lg:h-3 lg:w-6 lg:rounded-sm aspect-video object-cover"
                    />
                  ))}
                </div>
                <p className="text-black/70 dark:text-white/70 text-xs">
                  View {formattedImages.length - 3} more
                </p>
              </button>
            )}
          </div>
          <Lightbox open={open} close={() => setOpen(false)} slides={slides} />
        </>
      )}
    </div>
  );
};

export default ImageGalleryTemplate;
