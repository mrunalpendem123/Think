'use client';

import React from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';

export interface CardData {
  id: string;
  title: string;
  description?: string;
  image?: string;
  badge?: string;
  metadata?: Record<string, string>;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export interface CardGridTemplateProps {
  cards: CardData[];
  columns?: 1 | 2 | 3 | 4;
  title?: string;
  description?: string;
  onCardClick?: (card: CardData) => void;
}

const CardGridTemplate: React.FC<CardGridTemplateProps> = ({
  cards,
  columns = 3,
  title,
  description,
  onCardClick,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const handleCardClick = (card: CardData) => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleActionClick = (
    e: React.MouseEvent,
    action: CardData['action']
  ) => {
    e.stopPropagation();
    if (action?.onClick) {
      action.onClick();
    } else if (action?.url) {
      window.open(action.url, '_blank');
    }
  };

  return (
    <div className="w-full space-y-6">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-xl font-semibold text-black dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-black/60 dark:text-white/60">
              {description}
            </p>
          )}
        </div>
      )}

      <div className={`grid ${gridCols[columns]} gap-6`}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 overflow-hidden transition-all hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 group ${
              onCardClick ? 'cursor-pointer' : ''
            }`}
          >
            {/* Image */}
            {card.image && (
              <div className="relative w-full h-48 overflow-hidden bg-light-100 dark:bg-dark-100">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {card.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {card.badge}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-3">
              <div className="space-y-2">
                {card.badge && !card.image && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                    {card.badge}
                  </span>
                )}
                <h4 className="text-lg font-semibold text-black dark:text-white line-clamp-2">
                  {card.title}
                </h4>
              </div>

              {card.description && (
                <p className="text-sm text-black/60 dark:text-white/60 line-clamp-3">
                  {card.description}
                </p>
              )}

              {/* Metadata */}
              {card.metadata && Object.keys(card.metadata).length > 0 && (
                <div className="pt-3 border-t border-light-200 dark:border-dark-200 space-y-1">
                  {Object.entries(card.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-black/50 dark:text-white/50">
                        {key}
                      </span>
                      <span className="text-black/70 dark:text-white/70 font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action */}
              {card.action && (
                <button
                  onClick={(e) => handleActionClick(e, card.action)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {card.action.label}
                  {card.action.url ? (
                    <ExternalLink size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardGridTemplate;

