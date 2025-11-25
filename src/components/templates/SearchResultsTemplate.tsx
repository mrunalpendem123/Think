'use client';

import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  description: string;
  favicon?: string;
}

interface SearchResultsTemplateProps {
  results: SearchResult[];
  query?: string;
}

const SearchResultsTemplate: React.FC<SearchResultsTemplateProps> = ({
  results,
  query,
}) => {
  return (
    <div className="space-y-4 w-full">
      {query && (
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Search Results: {query}
        </h3>
      )}
      <div className="space-y-3">
        {results.map((result, index) => (
          <a
            key={index}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 hover:border-light-300 dark:hover:border-dark-300 p-4 transition-all hover:shadow-md group"
          >
            <div className="flex items-start gap-3">
              {result.favicon ? (
                <img
                  src={result.favicon}
                  alt=""
                  className="w-5 h-5 mt-1 flex-shrink-0"
                />
              ) : (
                <Globe className="w-5 h-5 mt-1 text-black/40 dark:text-white/40 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-base text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                    {result.title}
                  </h4>
                  <ExternalLink className="w-4 h-4 text-black/40 dark:text-white/40 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-black/60 dark:text-white/60 mt-1 line-clamp-2">
                  {result.description}
                </p>
                <p className="text-xs text-black/40 dark:text-white/40 mt-2 truncate">
                  {result.url}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsTemplate;

