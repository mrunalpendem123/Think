/**
 * Beautiful weather card UI component
 * Displays current weather with blue gradient background
 */

import { Cloud, CloudRain, CloudSnow, Sun, Sunrise, Sunset, Wind } from 'lucide-react'

import { WeatherData } from '@/lib/utils/weather-parser'

interface WeatherCardProps {
  data: WeatherData
}

function getWeatherIcon(condition: string, size: number = 48) {
  const lowerCondition = condition.toLowerCase()
  const iconClass = 'text-yellow-200'
  
  if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
    return <CloudRain size={size} className="text-blue-200" />
  }
  if (lowerCondition.includes('snow')) {
    return <CloudSnow size={size} className="text-blue-100" />
  }
  if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    return <Cloud size={size} className="text-gray-200" />
  }
  if (lowerCondition.includes('wind')) {
    return <Wind size={size} className="text-gray-300" />
  }
  // Default to sunny/clear
  return <Sun size={size} className={iconClass} />
}

export function WeatherCard({ data }: WeatherCardProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        {/* Header: Location and Date */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{data.location}</h3>
            <p className="text-sm text-blue-100">{currentDate}</p>
          </div>
          {data.current.high && data.current.low && (
            <div className="text-sm text-right">
              <div>H: {data.current.high}°</div>
              <div>L: {data.current.low}°</div>
            </div>
          )}
        </div>

        {/* Current Weather */}
        <div className="flex items-center gap-4 mb-6">
          {getWeatherIcon(data.current.condition, 64)}
          <div>
            <div className="text-5xl font-bold">
              {data.current.temp}°{data.current.tempUnit}
            </div>
            <div className="text-lg text-blue-100 capitalize">
              {data.current.condition}
            </div>
          </div>
        </div>

        {/* Hourly Forecast (if available) */}
        {data.hourly && data.hourly.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <h4 className="text-sm font-semibold mb-3">Hourly Forecast</h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {data.hourly.slice(0, 6).map((hour, index) => (
                <div key={index} className="flex flex-col items-center min-w-[60px]">
                  <div className="text-xs mb-1">{hour.time}</div>
                  {hour.condition && getWeatherIcon(hour.condition, 24)}
                  <div className="text-sm font-semibold mt-1">{hour.temp}°</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sunrise and Sunset */}
        {(data.sunrise || data.sunset) && (
          <div className="flex justify-between text-sm">
            {data.sunrise && (
              <div className="flex items-center gap-2">
                <Sunrise size={16} />
                <span>Sunrise: {data.sunrise}</span>
              </div>
            )}
            {data.sunset && (
              <div className="flex items-center gap-2">
                <Sunset size={16} />
                <span>Sunset: {data.sunset}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

