import { ICacheManager } from "./interface";
import { NoOpCacheManager } from "./noOpCache";

let cacheManager: ICacheManager;

/**
 * Initializes the cache manager.
 * For server-side API routes, uses a no-op cache manager.
 * Note: IndexedDB is only available in the browser, so it cannot be used in API routes.
 * @returns An instance of a class that implements the ICacheManager interface.
 */
const initializeCacheManager = (): ICacheManager => {
  // API routes run on the server where IndexedDB is not available
  // Using no-op cache manager for server-side
  console.log("Using no-op cache manager (server-side API routes).");
  return new NoOpCacheManager();
};

/**
 * Returns a singleton instance of the cache manager.
 * This function ensures that the cache manager is initialized only once.
 * @returns An instance of a class that implements the ICacheManager interface.
 */
export const getCacheManager = (): ICacheManager => {
  if (!cacheManager) {
    cacheManager = initializeCacheManager();
  }
  return cacheManager;
};
