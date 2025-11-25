'use client';

import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  location?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface TimelineTemplateProps {
  events: TimelineEvent[];
  title?: string;
  description?: string;
  layout?: 'vertical' | 'horizontal';
}

const TimelineTemplate: React.FC<TimelineTemplateProps> = ({
  events,
  title,
  description,
  layout = 'vertical',
}) => {
  const defaultColors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-orange-500',
  ];

  if (layout === 'horizontal') {
    return (
      <div className="w-full space-y-4">
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-xl font-semibold text-black dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-black/60 dark:text-white/60">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max px-4">
            {events.map((event, index) => {
              const color =
                event.color || defaultColors[index % defaultColors.length];
              return (
                <div key={index} className="flex flex-col items-center w-64">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white mb-4`}
                  >
                    {event.icon || <Calendar size={24} />}
                  </div>

                  {/* Line */}
                  {index < events.length - 1 && (
                    <div className="absolute w-64 h-0.5 bg-light-200 dark:bg-dark-200 mt-6 ml-64" />
                  )}

                  {/* Content */}
                  <div className="text-center space-y-2">
                    <div className="text-xs font-medium text-black/60 dark:text-white/60">
                      {event.date}
                    </div>
                    <h4 className="font-semibold text-black dark:text-white">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-black/60 dark:text-white/60">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <div className="flex items-center justify-center gap-1 text-xs text-black/50 dark:text-white/50">
                        <MapPin size={12} />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className="w-full space-y-4">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-xl font-semibold text-black dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-black/60 dark:text-white/60">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-light-200 dark:bg-dark-200" />

        <div className="space-y-8">
          {events.map((event, index) => {
            const color =
              event.color || defaultColors[index % defaultColors.length];
            return (
              <div key={index} className="relative">
                {/* Icon */}
                <div
                  className={`absolute -left-8 w-12 h-12 ${color} rounded-full flex items-center justify-center text-white`}
                >
                  {event.icon || <Calendar size={20} />}
                </div>

                {/* Content */}
                <div className="ml-8 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 p-6 space-y-2">
                  <div className="text-xs font-medium text-black/60 dark:text-white/60">
                    {event.date}
                  </div>
                  <h4 className="text-lg font-semibold text-black dark:text-white">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-black/50 dark:text-white/50">
                      <MapPin size={14} />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineTemplate;

