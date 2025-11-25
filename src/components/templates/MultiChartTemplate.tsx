'use client';

import React from 'react';
import ChartTemplate, {
  ChartData,
  ChartTemplateProps,
} from './ChartTemplate';

export interface MultiChartData {
  type: ChartTemplateProps['type'];
  data: ChartData[];
  xKey?: string;
  yKey?: string;
  title: string;
  colors?: string[];
  description?: string;
}

export interface MultiChartTemplateProps {
  charts: MultiChartData[];
  columns?: 1 | 2 | 3;
  mainTitle?: string;
  description?: string;
}

const MultiChartTemplate: React.FC<MultiChartTemplateProps> = ({
  charts,
  columns = 2,
  mainTitle,
  description,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className="w-full space-y-6">
      {mainTitle && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            {mainTitle}
          </h2>
          {description && (
            <p className="text-sm text-black/60 dark:text-white/60">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {charts.map((chart, index) => (
          <div key={index} className="w-full">
            <ChartTemplate {...chart} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChartTemplate;

