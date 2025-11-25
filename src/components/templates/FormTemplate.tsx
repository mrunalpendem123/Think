'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';

export interface FormField {
  name: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormTemplateProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
  title?: string;
  description?: string;
}

const FormTemplate: React.FC<FormTemplateProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  title,
  description,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const renderField = (field: FormField) => {
    const baseClasses =
      'w-full px-4 py-2 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-lg text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500';

    const validationRules: any = {};
    if (field.required) validationRules.required = `${field.label} is required`;
    if (field.validation) {
      if (field.validation.min !== undefined)
        validationRules.min = {
          value: field.validation.min,
          message: field.validation.message || `Minimum value is ${field.validation.min}`,
        };
      if (field.validation.max !== undefined)
        validationRules.max = {
          value: field.validation.max,
          message: field.validation.message || `Maximum value is ${field.validation.max}`,
        };
      if (field.validation.minLength !== undefined)
        validationRules.minLength = {
          value: field.validation.minLength,
          message:
            field.validation.message ||
            `Minimum length is ${field.validation.minLength}`,
        };
      if (field.validation.maxLength !== undefined)
        validationRules.maxLength = {
          value: field.validation.maxLength,
          message:
            field.validation.message ||
            `Maximum length is ${field.validation.maxLength}`,
        };
      if (field.validation.pattern)
        validationRules.pattern = {
          value: new RegExp(field.validation.pattern),
          message: field.validation.message || 'Invalid format',
        };
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(field.name, validationRules)}
            placeholder={field.placeholder}
            rows={4}
            className={baseClasses}
          />
        );

      case 'select':
        return (
          <select {...register(field.name, validationRules)} className={baseClasses}>
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register(field.name, validationRules)}
              className="w-4 h-4 text-blue-600 bg-white dark:bg-dark-primary border-light-200 dark:border-dark-200 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-black dark:text-white">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={option.value}
                  {...register(field.name, validationRules)}
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-dark-primary border-light-200 dark:border-dark-200 focus:ring-blue-500"
                />
                <label className="text-sm text-black dark:text-white">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            {...register(field.name, validationRules)}
            placeholder={field.placeholder}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 p-6"
      >
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== 'checkbox' && (
                <label className="block text-sm font-medium text-black dark:text-white">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-sm text-red-500">
                  {errors[field.name]?.message as string}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send size={18} />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormTemplate;

