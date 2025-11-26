'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ChartData {
  [key: string]: string | number;
}

export interface ChartTemplateProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData[];
  xKey?: string;
  yKey?: string;
  title?: string;
  colors?: string[];
  description?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#f97316',
  '#14b8a6',
];

const ChartTemplate: React.FC<ChartTemplateProps> = ({
  type,
  data,
  xKey = 'name',
  yKey = 'value',
  title,
  colors = DEFAULT_COLORS,
  description,
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-light-200 dark:stroke-dark-200"
            />
            <XAxis
              dataKey={xKey}
              className="text-xs text-black/70 dark:text-white/70"
            />
            <YAxis className="text-xs text-black/70 dark:text-white/70" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--tooltip-text)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0] }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-light-200 dark:stroke-dark-200"
            />
            <XAxis
              dataKey={xKey}
              className="text-xs text-black/70 dark:text-white/70"
            />
            <YAxis className="text-xs text-black/70 dark:text-white/70" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey={yKey} fill={colors[0]} radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-light-200 dark:stroke-dark-200"
            />
            <XAxis
              dataKey={xKey}
              className="text-xs text-black/70 dark:text-white/70"
            />
            <YAxis className="text-xs text-black/70 dark:text-white/70" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={colors[0]}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      {title && (
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-black/60 dark:text-white/60">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 p-6">
        <style jsx global>{`
          :root {
            --tooltip-bg: #ffffff;
            --tooltip-border: #e8edf1;
            --tooltip-text: #000000;
          }
          :root.dark,
          html.dark,
          body.dark {
            --tooltip-bg: #161b22;
            --tooltip-border: #30363d;
            --tooltip-text: #ffffff;
          }
        `}</style>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartTemplate;

