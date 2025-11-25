'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  source?: string;
  publishedAt?: string;
}

interface NewsTemplateProps {
  articles: NewsArticle[];
  title?: string;
}

const NewsTemplate: React.FC<NewsTemplateProps> = ({ articles, title }) => {
  return (
    <div className="space-y-4 w-full">
      {title && (
        <h3 className="text-xl font-semibold text-black dark:text-white">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 hover:border-light-300 dark:hover:border-dark-300 shadow-sm overflow-hidden transition-all hover:shadow-md group"
          >
            {article.thumbnail && (
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm text-black dark:text-white line-clamp-2 flex-1">
                  {article.title}
                </h4>
                <ExternalLink className="w-4 h-4 text-black/40 dark:text-white/40 flex-shrink-0" />
              </div>
              {article.description && (
                <p className="text-xs text-black/60 dark:text-white/60 line-clamp-3">
                  {article.description}
                </p>
              )}
              {(article.source || article.publishedAt) && (
                <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40">
                  {article.source && <span>{article.source}</span>}
                  {article.source && article.publishedAt && <span>•</span>}
                  {article.publishedAt && (
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsTemplate;

