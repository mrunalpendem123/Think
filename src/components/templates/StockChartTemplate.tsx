'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  color?: string;
}

interface StockChartTemplateProps {
  title?: string;
  data: any[];
  stocks: Stock[];
  currency?: string;
}

const StockChartTemplate: React.FC<StockChartTemplateProps> = ({
  title = 'Stock Chart',
  data,
  stocks,
  currency = 'USD',
}) => {
  if (!data || data.length === 0 || !stocks || stocks.length === 0) {
    return null;
  }

  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
  ];

  return (
    <div className="w-full p-6 rounded-lg bg-light-primary dark:bg-dark-primary border border-light-200 dark:border-dark-200">
      {title && (
        <h3 className="text-black dark:text-white font-semibold text-xl mb-4">
          {title}
        </h3>
      )}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${currency} ${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--container-fill, #ffffff)',
                border: '1px solid var(--border-default, #e5e7eb)',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`${currency} ${value?.toFixed(2)}`, 'Price']}
            />
            <Legend />
            {stocks.map((stock, index) => (
              <Line
                key={stock.symbol}
                type="monotone"
                dataKey={stock.symbol}
                name={stock.name}
                stroke={stock.color || colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChartTemplate;





