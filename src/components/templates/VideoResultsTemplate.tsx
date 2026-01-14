'use client';

import { PlayCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Lightbox, { GenericSlide, VideoSlide } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface VideoResult {
  url: string;
  title: string;
  thumbnail?: string;
  img_src?: string;
  iframe_src?: string;
}

interface VideoResultsTemplateProps {
  videos: VideoResult[];
  query?: string;
}

declare module 'yet-another-react-lightbox' {
  export interface VideoSlide extends GenericSlide {
    type: 'video-slide';
    src: string;
    iframe_src: string;
  }

  interface SlideTypes {
    'video-slide': VideoSlide;
  }
}

const VideoResultsTemplate: React.FC<VideoResultsTemplateProps> = ({
  videos,
  query,
}) => {
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<VideoSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // Ensure videos have img_src
  const formattedVideos = videos.map((video) => ({
    ...video,
    img_src: video.img_src || video.thumbnail || '',
    iframe_src: video.iframe_src || video.url.replace('watch?v=', 'embed/'),
  }));

  const lightboxSlides = formattedVideos.map((video) => ({
    type: 'video-slide' as const,
    iframe_src: video.iframe_src,
    src: video.img_src,
  }));

  return (
    <div className="w-full">
      {query && (
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
          Videos: {query}
        </h3>
      )}
      {formattedVideos.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {formattedVideos.length > 4
              ? formattedVideos.slice(0, 3).map((video, i) => (
                  <div
                    onClick={() => {
                      setOpen(true);
                      setSlides([
                        lightboxSlides[i],
                        ...lightboxSlides.slice(0, i),
                        ...lightboxSlides.slice(i + 1),
                      ]);
                    }}
                    className="relative transition duration-200 active:scale-95 hover:scale-[1.02] cursor-pointer"
                    key={i}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.img_src}
                      alt={video.title}
                      className="relative h-full w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="absolute bg-white/70 dark:bg-black/70 text-black/70 dark:text-white/70 px-2 py-1 flex flex-row items-center space-x-1 bottom-1 right-1 rounded-md">
                      <PlayCircle size={15} />
                      <p className="text-xs">Video</p>
                    </div>
                  </div>
                ))
              : formattedVideos.map((video, i) => (
                  <div
                    onClick={() => {
                      setOpen(true);
                      setSlides([
                        lightboxSlides[i],
                        ...lightboxSlides.slice(0, i),
                        ...lightboxSlides.slice(i + 1),
                      ]);
                    }}
                    className="relative transition duration-200 active:scale-95 hover:scale-[1.02] cursor-pointer"
                    key={i}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.img_src}
                      alt={video.title}
                      className="relative h-full w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="absolute bg-white/70 dark:bg-black/70 text-black/70 dark:text-white/70 px-2 py-1 flex flex-row items-center space-x-1 bottom-1 right-1 rounded-md">
                      <PlayCircle size={15} />
                      <p className="text-xs">Video</p>
                    </div>
                  </div>
                ))}
            {formattedVideos.length > 4 && (
              <button
                onClick={() => setOpen(true)}
                className="bg-light-100 hover:bg-light-200 dark:bg-dark-100 dark:hover:bg-dark-200 transition duration-200 active:scale-95 hover:scale-[1.02] h-auto w-full rounded-lg flex flex-col justify-between text-white p-2"
              >
                <div className="flex flex-row items-center space-x-1">
                  {formattedVideos.slice(3, 6).map((video, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={video.img_src}
                      alt={video.title}
                      className="h-6 w-12 rounded-md lg:h-3 lg:w-6 lg:rounded-sm aspect-video object-cover"
                    />
                  ))}
                </div>
                <p className="text-black/70 dark:text-white/70 text-xs">
                  View {formattedVideos.length - 3} more
                </p>
              </button>
            )}
          </div>
          <Lightbox
            open={open}
            close={() => setOpen(false)}
            slides={slides}
            index={currentIndex}
            on={{
              view: ({ index }) => {
                const previousIframe = videoRefs.current[currentIndex];
                if (previousIframe?.contentWindow) {
                  previousIframe.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}',
                    '*',
                  );
                }

                setCurrentIndex(index);
              },
            }}
            render={{
              slide: ({ slide }) => {
                const index = slides.findIndex((s) => s === slide);
                return slide.type === 'video-slide' ? (
                  <div className="h-full w-full flex flex-row items-center justify-center">
                    <iframe
                      src={`${slide.iframe_src}${slide.iframe_src.includes('?') ? '&' : '?'}enablejsapi=1`}
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[index] = el;
                        }
                      }}
                      className="aspect-video max-h-[95vh] w-[95vw] rounded-2xl md:w-[80vw]"
                      allowFullScreen
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : null;
              },
            }}
          />
        </>
      )}
    </div>
  );
};

export default VideoResultsTemplate;
