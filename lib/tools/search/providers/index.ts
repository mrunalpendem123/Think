import { SearchProvider } from './base'
import { ParallelSearchProvider } from './parallel'

export type SearchProviderType = 'parallel'
export const DEFAULT_PROVIDER: SearchProviderType = 'parallel'

export function createSearchProvider(
  type?: SearchProviderType
): SearchProvider {
  // Always return Parallel AI provider
  return new ParallelSearchProvider()
}

export { ParallelSearchProvider } from './parallel'
export type { SearchProvider }
