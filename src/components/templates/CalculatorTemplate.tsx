'use client';

import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

export interface CalculatorVariable {
  name: string;
  label: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface CalculatorTemplateProps {
  title: string;
  description?: string;
  formula: string; // JavaScript expression, e.g., "a * b + c"
  variables: CalculatorVariable[];
  resultLabel?: string;
  resultUnit?: string;
}

const CalculatorTemplate: React.FC<CalculatorTemplateProps> = ({
  title,
  description,
  formula,
  variables,
  resultLabel = 'Result',
  resultUnit,
}) => {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    variables.forEach((v) => {
      initial[v.name] = v.defaultValue || 0;
    });
    return initial;
  });

  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    try {
      // Create a safe evaluation context
      const calculateResult = new Function(
        ...Object.keys(values),
        `return ${formula}`
      );
      const computed = calculateResult(...Object.values(values));
      setResult(computed);
    } catch (error) {
      console.error('Formula evaluation error:', error);
      setResult(0);
    }
  }, [values, formula]);

  const handleValueChange = (name: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setValues((prev) => ({ ...prev, [name]: numValue }));
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Calculator className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h3>
        </div>
        {description && (
          <p className="text-sm text-black/60 dark:text-white/60">
            {description}
          </p>
        )}
      </div>

      <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 p-6 space-y-6">
        {/* Variables */}
        <div className="space-y-4">
          {variables.map((variable) => (
            <div key={variable.name} className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-black dark:text-white">
                <span>
                  {variable.label}
                  {variable.unit && (
                    <span className="text-black/60 dark:text-white/60 ml-1">
                      ({variable.unit})
                    </span>
                  )}
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {values[variable.name]}
                </span>
              </label>
              <input
                type="range"
                min={variable.min || 0}
                max={variable.max || 100}
                step={variable.step || 1}
                value={values[variable.name]}
                onChange={(e) =>
                  handleValueChange(variable.name, e.target.value)
                }
                className="w-full h-2 bg-light-200 dark:bg-dark-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="number"
                min={variable.min}
                max={variable.max}
                step={variable.step || 1}
                value={values[variable.name]}
                onChange={(e) =>
                  handleValueChange(variable.name, e.target.value)
                }
                className="w-full px-4 py-2 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="pt-6 border-t border-light-200 dark:border-dark-200">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 text-center">
            <div className="text-sm font-medium text-black/60 dark:text-white/60 mb-2">
              {resultLabel}
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {result.toFixed(2)}
              {resultUnit && (
                <span className="text-2xl ml-2 text-black/60 dark:text-white/60">
                  {resultUnit}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTemplate;

