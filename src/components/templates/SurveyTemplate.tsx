'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SurveyTemplateProps {
  questions: SurveyQuestion[];
  onComplete: (data: Record<string, any>) => void;
  title?: string;
  description?: string;
}

const SurveyTemplate: React.FC<SurveyTemplateProps> = ({
  questions,
  onComplete,
  title,
  description,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    mode: 'onChange',
  });

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = async () => {
    const isValid = await trigger(currentQuestion.id);
    if (isValid) {
      const value = getValues(currentQuestion.id);
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      
      if (isLastQuestion) {
        const finalAnswers = { ...answers, [currentQuestion.id]: value };
        onComplete(finalAnswers);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const baseClasses =
      'w-full px-4 py-3 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-lg text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500';

    const validationRules: any = {};
    if (question.required) {
      validationRules.required = 'This field is required';
    }

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            {...register(question.id, validationRules)}
            placeholder={question.placeholder}
            rows={4}
            className={baseClasses}
            defaultValue={answers[question.id] || ''}
          />
        );

      case 'select':
        return (
          <select
            {...register(question.id, validationRules)}
            className={baseClasses}
            defaultValue={answers[question.id] || ''}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-4 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register(question.id, validationRules)}
                  className="w-5 h-5 text-blue-600 bg-white dark:bg-dark-primary border-light-200 dark:border-dark-200 focus:ring-blue-500"
                  defaultChecked={answers[question.id] === option.value}
                />
                <span className="text-black dark:text-white">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={question.type}
            {...register(question.id, validationRules)}
            placeholder={question.placeholder}
            className={baseClasses}
            defaultValue={answers[question.id] || ''}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-2xl font-bold text-black dark:text-white">
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

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-black/60 dark:text-white/60">
          <span>
            Question {currentStep + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-light-200 dark:bg-dark-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              {currentQuestion.question}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h4>
          </div>

          <div>{renderQuestion(currentQuestion)}</div>

          {errors[currentQuestion.id] && (
            <p className="text-sm text-red-500">
              {errors[currentQuestion.id]?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 text-black dark:text-white rounded-lg font-medium transition-colors hover:bg-light-100 dark:hover:bg-dark-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {isLastQuestion ? (
            <>
              <Check size={20} />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SurveyTemplate;

