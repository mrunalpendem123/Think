/**
 * Weather data parser from search results
 * Extracts weather information from Parallel AI search content
 */

import { SearchResults } from '@/lib/types'

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
 */
export function isWeatherQuery(query: string): boolean {
  const weatherKeywords = [
    'weather',
    'temperature',
    'forecast',
    'temp',
    'climate',
    'sunny',
    'cloudy',
    'rainy',
    'raining',
    'snow',
    'hot',
    'cold',
    'warm'
  ]
  
  const lowerQuery = query.toLowerCase()
  return weatherKeywords.some(keyword => lowerQuery.includes(keyword))
}

/**
 * Extracts location from weather query
 */
function extractLocation(query: string): string {
  // Remove weather keywords to get location
  const cleanQuery = query
    .toLowerCase()
    .replace(/weather|temperature|temp|forecast|in|for|at|the/gi, '')
    .trim()
  
  // Capitalize first letter of each word
  return cleanQuery
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Unknown Location'
}

/**
 * Parses temperature from text
 */
function parseTemperature(text: string): { temp: number; unit: 'C' | 'F' } | null {
  // Match patterns like: "72°F", "22°C", "Temperature: 15°", "15 degrees"
  const patterns = [
    /(\d+)°?\s*([CF])/i,
    /(\d+)\s*degrees?\s*([CF])/i,
    /temperature:?\s*(\d+)°?/i,
    /(\d+)°/
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const temp = parseInt(match[1])
      const unit = match[2]?.toUpperCase() as 'C' | 'F' || 'F'
      return { temp, unit }
    }
  }
  
  return null
}

/**
 * Parses high/low temperatures
 */
function parseHighLow(text: string): { high?: number; low?: number } {
  const result: { high?: number; low?: number } = {}
  
  // Match "High: 75° Low: 60°" or "H: 25° L: 11°"
  const highMatch = text.match(/(?:high|h):\s*(\d+)°?/i)
  const lowMatch = text.match(/(?:low|l):\s*(\d+)°?/i)
  
  if (highMatch) result.high = parseInt(highMatch[1])
  if (lowMatch) result.low = parseInt(lowMatch[1])
  
  return result
}

/**
 * Parses weather condition
 */
function parseCondition(text: string): string {
  const conditions = ['sunny', 'clear', 'cloudy', 'partly cloudy', 'overcast', 
                     'rainy', 'rain', 'showers', 'thunderstorm', 'snow', 'fog', 'windy']
  
  const lowerText = text.toLowerCase()
  for (const condition of conditions) {
    if (lowerText.includes(condition)) {
      return condition.charAt(0).toUpperCase() + condition.slice(1)
    }
  }
  
  return 'Clear'
}

/**
 * Parses sunrise/sunset times
 */
function parseSunTimes(text: string): { sunrise?: string; sunset?: string } {
  const result: { sunrise?: string; sunset?: string } = {}
  
  const sunriseMatch = text.match(/sunrise:?\s*([\d:]+\s*[AP]M)/i)
  const sunsetMatch = text.match(/sunset:?\s*([\d:]+\s*[AP]M)/i)
  
  if (sunriseMatch) result.sunrise = sunriseMatch[1]
  if (sunsetMatch) result.sunset = sunsetMatch[1]
  
  return result
}

/**
 * Main function to parse weather from search results
 */
export function parseWeatherFromSearch(
  searchResults: SearchResults,
  query: string
): WeatherData | null {
  if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
    return null
  }
  
  // Combine all search result content
  const allContent = searchResults.results
    .map(r => `${r.title} ${r.content}`)
    .join(' ')
  
  // Parse temperature
  const tempData = parseTemperature(allContent)
  if (!tempData) {
    return null // No temperature found, probably not weather data
  }
  
  // Parse other data
  const highLow = parseHighLow(allContent)
  const condition = parseCondition(allContent)
  const sunTimes = parseSunTimes(allContent)
  const location = extractLocation(query)
  
  return {
    location,
    current: {
      temp: tempData.temp,
      tempUnit: tempData.unit,
      condition,
      high: highLow.high,
      low: highLow.low
    },
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset
  }
}

