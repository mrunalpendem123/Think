'use client'

import { useEffect, useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { ToolInvocation } from 'ai'

import type { SearchResults as TypeSearchResults } from '@/lib/types'
import { extractLocation, fetchWeather, isWeatherQuery, WeatherData } from '@/lib/utils/weather-parser'

import { useArtifact } from '@/components/artifact/artifact-context'

import { CollapsibleMessage } from './collapsible-message'
import { SearchSkeleton } from './default-skeleton'
import { SearchResults } from './search-results'
import { SearchResultsImageSection } from './search-results-image'
import { Section, ToolArgsSection } from './section'
import { WeatherCard } from './weather-card'

interface SearchSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  chatId: string
}

export function SearchSection({
  tool,
  isOpen,
  onOpenChange,
  chatId
}: SearchSectionProps) {
  const { status } = useChat({
    id: chatId
  })
  const isLoading = status === 'submitted' || status === 'streaming'

  const isToolLoading = tool.state === 'call'
  const searchResults: TypeSearchResults =
    tool.state === 'result' ? tool.result : undefined
  const query = tool.args?.query as string | undefined
  const includeDomains = tool.args?.includeDomains as string[] | undefined
  const includeDomainsString = includeDomains
    ? ` [${includeDomains.join(', ')}]`
    : ''

  // Fetch weather data if this is a weather query
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  
  useEffect(() => {
    if (query && isWeatherQuery(query) && tool.state === 'result') {
      const location = extractLocation(query)
      console.log('🌤️ Weather: Detected weather query, fetching for:', location)
      fetchWeather(location).then(data => {
        if (data) {
          console.log('✅ Weather: Fetched successfully', data)
          setWeatherData(data)
        } else {
          console.log('❌ Weather: Failed to fetch')
        }
      })
    }
  }, [query, tool.state])

  const { open } = useArtifact()
  const header = (
    <button
      type="button"
      onClick={() => open({ type: 'tool-invocation', toolInvocation: tool })}
      className="flex items-center justify-between w-full text-left rounded-md p-1 -ml-1"
      title="Open details"
    >
      <ToolArgsSection
        tool="search"
        number={searchResults?.results?.length}
      >{`${query}${includeDomainsString}`}</ToolArgsSection>
    </button>
  )

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showIcon={false}
    >
      {/* Weather Card - Show if weather query detected */}
      {weatherData && <WeatherCard data={weatherData} />}

      {searchResults &&
        searchResults.images &&
        searchResults.images.length > 0 && (
          <Section>
            <SearchResultsImageSection
              images={searchResults.images}
              query={query}
            />
          </Section>
        )}
      {isLoading && isToolLoading ? (
        <SearchSkeleton />
      ) : searchResults?.results ? (
        <Section title="Sources">
          <SearchResults results={searchResults.results} />
        </Section>
      ) : null}
    </CollapsibleMessage>
  )
}
