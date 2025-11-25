/**
 * Weather fetcher using Open-Meteo API
 * Free, no API key required, privacy-friendly
 * Docs: https://open-meteo.com/en/docs
 */

export interface WeatherData {
  location: string
  current: {
    temp: number
    tempUnit: 'C' | 'F'
    condition: string
    high?: number
    low?: number
  }
  hourly?: Array<{
    time: string
    temp: number
    condition?: string
  }>
  sunrise?: string
  sunset?: string
}

/**
 * Detects if a query is weather-related
 * Comprehensive keyword matching to catch all weather questions
 */
export function isWeatherQuery(query: string): boolean {
  const weatherKeywords = [
    // Direct weather terms
    'weather',
    'temperature',
    'temp',
    'forecast',
    'climate',
    
    // Conditions
    'sunny',
    'cloudy',
    'rainy',
    'raining',
    'rain',
    'snowing',
    'snow',
    'stormy',
    'storm',
    'windy',
    'wind',
    'foggy',
    'fog',
    'humid',
    'humidity',
    
    // Temperature adjectives
    'hot',
    'cold',
    'warm',
    'cool',
    'freezing',
    'chilly',
    
    // Weather questions
    'will it rain',
    'is it raining',
    'is it sunny',
    'is it cold',
    'is it hot',
    'how cold',
    'how hot',
    'how warm',
    
    // Celsius/Fahrenheit
    'celsius',
    'fahrenheit',
    '°c',
    '°f'
  ]
  
  const lowerQuery = query.toLowerCase()
  return weatherKeywords.some(keyword => lowerQuery.includes(keyword))
}

/**
 * Extracts location from weather query
 * Removes all weather-related keywords to isolate the location
 */
export function extractLocation(query: string): string {
  // Comprehensive list of words to remove
  const wordsToRemove = [
    'what', 'is', 'it', 'the', 'a', 'an',
    'weather', 'temperature', 'temp', 'forecast', 'climate',
    'in', 'for', 'at', 'of', 'today', 'tomorrow', 'now', 'right now',
    'raining', 'rain', 'rainy', 'sunny', 'cloudy', 'snowing', 'snow',
    'hot', 'cold', 'warm', 'cool', 'freezing', 'chilly',
    'will', 'going to', 'gonna', 'like', 'there',
    'how', 'whats', "what's", 'hows', "how's",
    'current', 'todays', "today's", 'tonight',
    'degree', 'degrees', 'celsius', 'fahrenheit'
  ]
  
  let cleanQuery = query.toLowerCase()
  
  // Remove all weather keywords
  wordsToRemove.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    cleanQuery = cleanQuery.replace(regex, '')
  })
  
  // Clean up extra spaces
  cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim()
  
  // Capitalize first letter of each word
  const location = cleanQuery
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return location || 'Unknown Location'
}

/**
 * Weather condition codes from Open-Meteo
 */
function getWeatherCondition(code: number): string {
  const conditions: { [key: number]: string } = {
    0: 'Clear',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail'
  }
  return conditions[code] || 'Clear'
}

/**
 * Geocode location to get coordinates
 */
async function geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    )
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Fetch weather from Open-Meteo API
 */
export async function fetchWeather(location: string): Promise<WeatherData | null> {
  try {
    // First, geocode the location
    const coords = await geocodeLocation(location)
    if (!coords) {
      console.error('Could not geocode location:', location)
      return null
    }

    // Fetch weather data
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
    
    const response = await fetch(url)
    const data = await response.json()

    if (!data.current) {
      return null
    }

    // Parse hourly forecast (next 6 hours)
    const now = new Date()
    const hourly = data.hourly.time.slice(0, 6).map((time: string, i: number) => ({
      time: new Date(time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        hour12: true 
      }).replace(' ', ''),
      temp: Math.round(data.hourly.temperature_2m[i]),
      condition: getWeatherCondition(data.hourly.weather_code[i])
    }))

    // Format sunrise/sunset times
    const formatTime = (dateStr: string) => {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase()
    }

    return {
      location: location.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      current: {
        temp: Math.round(data.current.temperature_2m),
        tempUnit: 'F',
        condition: getWeatherCondition(data.current.weather_code),
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0])
      },
      hourly,
      sunrise: formatTime(data.daily.sunrise[0]),
      sunset: formatTime(data.daily.sunset[0])
    }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

