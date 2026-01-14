'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export interface ComparisonItem {
  name: string;
  features: Record<string, boolean | string | number>;
  highlighted?: boolean;
  badge?: string;
}

export interface ComparisonTemplateProps {
  items: ComparisonItem[];
  title?: string;
  description?: string;
  featureLabels?: Record<string, string>;
}

const ComparisonTemplate: React.FC<ComparisonTemplateProps> = ({
  items,
  title,
  description,
  featureLabels,
}) => {
  // Extract all unique feature keys
  const allFeatures = Array.from(
    new Set(items.flatMap((item) => Object.keys(item.features)))
  );

  const renderFeatureValue = (value: boolean | string | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="text-green-500 mx-auto" size={20} />
      ) : (
        <X className="text-red-500 mx-auto" size={20} />
      );
    }
    return <span className="text-black dark:text-white">{value}</span>;
  };

  return (
    <div className="w-full space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`bg-light-secondary dark:bg-dark-secondary rounded-lg border-2 ${
              item.highlighted
                ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                : 'border-light-200 dark:border-dark-200'
            } overflow-hidden`}
          >
            {/* Header */}
            <div
              className={`p-6 text-center ${
                item.highlighted
                  ? 'bg-blue-500 text-white'
                  : 'bg-light-100 dark:bg-dark-100'
              }`}
            >
              {item.badge && (
                <div className="mb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      item.highlighted
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
              )}
              <h4
                className={`text-2xl font-bold ${
                  item.highlighted
                    ? 'text-white'
                    : 'text-black dark:text-white'
                }`}
              >
                {item.name}
              </h4>
            </div>

            {/* Features */}
            <div className="p-6 space-y-4">
              {allFeatures.map((featureKey) => (
                <div
                  key={featureKey}
                  className="flex items-center justify-between border-b border-light-200 dark:border-dark-200 pb-3 last:border-0"
                >
                  <span className="text-sm text-black/70 dark:text-white/70">
                    {featureLabels?.[featureKey] || featureKey}
                  </span>
                  <div className="flex items-center">
                    {item.features[featureKey] !== undefined
                      ? renderFeatureValue(item.features[featureKey])
                      : <X className="text-gray-400 mx-auto" size={20} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonTemplate;

