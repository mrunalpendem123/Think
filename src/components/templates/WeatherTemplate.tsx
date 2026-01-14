'use client';

import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  temperatureUnit?: string;
  windSpeedUnit?: string;
}

interface WeatherTemplateProps {
  data: WeatherData;
}

const WeatherTemplate: React.FC<WeatherTemplateProps> = ({ data }) => {
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return <CloudRain size={48} />;
    if (lowerCondition.includes('snow')) return <CloudSnow size={48} />;
    if (lowerCondition.includes('cloud')) return <Cloud size={48} />;
    if (lowerCondition.includes('wind')) return <Wind size={48} />;
    return <Sun size={48} />;
  };

  return (
    <div className="bg-light-secondary dark:bg-dark-secondary rounded-2xl border border-light-200 dark:border-dark-200 shadow-sm p-6 w-full max-w-md">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {data.location}
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60">
              {data.condition}
            </p>
          </div>
          <div className="text-black dark:text-white">
            {getWeatherIcon(data.condition)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-5xl font-bold text-black dark:text-white">
            {Math.round(data.temperature)}°{data.temperatureUnit || 'C'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-light-200 dark:border-dark-200">
          <div className="flex flex-col">
            <span className="text-xs text-black/60 dark:text-white/60">
              Humidity
            </span>
            <span className="text-lg font-semibold text-black dark:text-white">
              {data.humidity}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-black/60 dark:text-white/60">
              Wind Speed
            </span>
            <span className="text-lg font-semibold text-black dark:text-white">
              {data.windSpeed} {data.windSpeedUnit || 'm/s'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherTemplate;

