import configManager from './index';
import { ConfigModelProvider } from './types';

export const getConfiguredModelProviders = (): ConfigModelProvider[] => {
  return configManager.getConfig('modelProviders', []);
};

export const getConfiguredModelProviderById = (
  id: string,
): ConfigModelProvider | undefined => {
  return getConfiguredModelProviders().find((p) => p.id === id) ?? undefined;
};

export const getSearxngURL = () =>
  configManager.getConfig('search.searxngURL', '');

export const getSearxngFallbackURL = () =>
  configManager.getConfig('search.searxngFallbackURL', '');

export const getSearxngFallbackURLs = (): string[] => {
  const fallbackURL = configManager.getConfig('search.searxngFallbackURL', '');
  const fallbackURLs = configManager.getConfig('search.searxngFallbackURLs', []);
  
  // Support both single fallback URL (backward compatibility) and array
  const allFallbacks: string[] = [];
  if (fallbackURL) {
    allFallbacks.push(fallbackURL);
  }
  if (Array.isArray(fallbackURLs)) {
    allFallbacks.push(...fallbackURLs.filter(Boolean));
  }
  
  return allFallbacks;
};

export const getNewsAPIKey = () =>
  configManager.getConfig('search.newsAPIKey', process.env.NEWSAPI_KEY || '');

export const getBrightDataAPIKey = () =>
  configManager.getConfig('search.brightDataAPIKey', process.env.BRIGHTDATA_API_KEY || '');

export const getParallelAPIKey = () =>
  configManager.getConfig('search.parallelAPIKey', process.env.PARALLEL_API_KEY || '');
