'use client';

/**
 * Template Demo Component
 * Demonstrates all available Crayon templates with sample data
 * Use this for testing and visual verification of templates
 */

import React, { useState } from 'react';
import ChartTemplate from '../ChartTemplate';
import MultiChartTemplate from '../MultiChartTemplate';
import DataTableTemplate from '../DataTableTemplate';
import FormTemplate from '../FormTemplate';
import SurveyTemplate from '../SurveyTemplate';
import CalculatorTemplate from '../CalculatorTemplate';
import ComparisonTemplate from '../ComparisonTemplate';
import TimelineTemplate from '../TimelineTemplate';
import CardGridTemplate from '../CardGridTemplate';

export default function TemplateDemo() {
  const [activeTemplate, setActiveTemplate] = useState('chart');

  // Sample data for each template
  const chartData = {
    type: 'bar' as const,
    title: 'Monthly Sales 2024',
    description: 'Sales performance across different months',
    xKey: 'month',
    yKey: 'sales',
    data: [
      { month: 'Jan', sales: 4000 },
      { month: 'Feb', sales: 3000 },
      { month: 'Mar', sales: 5000 },
      { month: 'Apr', sales: 4500 },
      { month: 'May', sales: 6000 },
      { month: 'Jun', sales: 5500 },
    ],
  };

  const multiChartData = {
    mainTitle: 'Q1 2024 Dashboard',
    description: 'Key metrics overview',
    columns: 2 as const,
    charts: [
      {
        type: 'line' as const,
        title: 'Revenue',
        data: [
          { month: 'Jan', value: 10000 },
          { month: 'Feb', value: 12000 },
          { month: 'Mar', value: 15000 },
        ],
        xKey: 'month',
        yKey: 'value',
      },
      {
        type: 'bar' as const,
        title: 'Expenses',
        data: [
          { month: 'Jan', value: 7000 },
          { month: 'Feb', value: 8000 },
          { month: 'Mar', value: 9000 },
        ],
        xKey: 'month',
        yKey: 'value',
      },
    ],
  };

  const tableData = {
    title: 'Product Comparison',
    columns: [
      { key: 'name', label: 'Product', sortable: true },
      { key: 'price', label: 'Price', sortable: true },
      { key: 'rating', label: 'Rating', sortable: true },
      { key: 'stock', label: 'Stock', sortable: true },
    ],
    data: [
      { name: 'Product A', price: '$29.99', rating: 4.5, stock: 'In Stock' },
      { name: 'Product B', price: '$39.99', rating: 4.8, stock: 'Limited' },
      { name: 'Product C', price: '$19.99', rating: 4.2, stock: 'In Stock' },
      { name: 'Product D', price: '$49.99', rating: 4.9, stock: 'Out of Stock' },
      { name: 'Product E', price: '$34.99', rating: 4.6, stock: 'In Stock' },
    ],
  };

  const formData = {
    title: 'Contact Form',
    description: 'Get in touch with us',
    fields: [
      {
        name: 'email',
        type: 'email' as const,
        label: 'Email Address',
        required: true,
        placeholder: 'your@email.com',
      },
      {
        name: 'message',
        type: 'textarea' as const,
        label: 'Message',
        required: true,
        placeholder: 'Your message here...',
      },
      {
        name: 'priority',
        type: 'select' as const,
        label: 'Priority',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ],
      },
    ],
    onSubmit: (data: any) => console.log('Form submitted:', data),
    submitLabel: 'Send Message',
  };

  const surveyData = {
    title: 'User Experience Survey',
    description: 'Help us improve our service',
    questions: [
      {
        id: 'satisfaction',
        question: 'How satisfied are you with our service?',
        type: 'radio' as const,
        required: true,
        options: [
          { value: '5', label: 'Very Satisfied' },
          { value: '4', label: 'Satisfied' },
          { value: '3', label: 'Neutral' },
          { value: '2', label: 'Unsatisfied' },
          { value: '1', label: 'Very Unsatisfied' },
        ],
      },
      {
        id: 'feedback',
        question: 'What can we improve?',
        type: 'textarea' as const,
        placeholder: 'Your suggestions...',
      },
    ],
    onComplete: (data: any) => console.log('Survey completed:', data),
  };

  const calculatorData = {
    title: 'Loan Calculator',
    description: 'Calculate your monthly payment',
    formula: '(amount * (rate / 100)) / months',
    variables: [
      {
        name: 'amount',
        label: 'Loan Amount',
        defaultValue: 10000,
        min: 1000,
        max: 100000,
        step: 1000,
        unit: '$',
      },
      {
        name: 'rate',
        label: 'Annual Interest Rate',
        defaultValue: 5,
        min: 0,
        max: 20,
        step: 0.5,
        unit: '%',
      },
      {
        name: 'months',
        label: 'Loan Term',
        defaultValue: 12,
        min: 6,
        max: 60,
        step: 6,
        unit: 'months',
      },
    ],
    resultLabel: 'Monthly Payment',
    resultUnit: '$',
  };

  const comparisonData = {
    title: 'Plan Comparison',
    description: 'Choose the right plan for you',
    items: [
      {
        name: 'Basic',
        features: {
          price: '$9.99',
          users: '1 user',
          storage: '10GB',
          support: false,
          api: false,
        },
      },
      {
        name: 'Pro',
        highlighted: true,
        badge: 'Most Popular',
        features: {
          price: '$29.99',
          users: '5 users',
          storage: '100GB',
          support: true,
          api: true,
        },
      },
      {
        name: 'Enterprise',
        features: {
          price: 'Custom',
          users: 'Unlimited',
          storage: '1TB',
          support: true,
          api: true,
        },
      },
    ],
    featureLabels: {
      price: 'Monthly Price',
      users: 'Team Size',
      storage: 'Storage Space',
      support: '24/7 Support',
      api: 'API Access',
    },
  };

  const timelineData = {
    title: 'Project Timeline',
    description: 'Key milestones',
    layout: 'vertical' as const,
    events: [
      {
        date: 'Jan 2024',
        title: 'Project Kickoff',
        description: 'Initial planning and team formation',
        location: 'San Francisco, CA',
      },
      {
        date: 'Mar 2024',
        title: 'MVP Development',
        description: 'Building core features',
      },
      {
        date: 'May 2024',
        title: 'Beta Launch',
        description: 'Released to beta testers',
      },
      {
        date: 'Jul 2024',
        title: 'Public Release',
        description: 'Official launch',
      },
    ],
  };

  const cardGridData = {
    title: 'Featured Products',
    description: 'Check out our latest offerings',
    columns: 3 as const,
    cards: [
      {
        id: '1',
        title: 'Premium Widget',
        description: 'High-quality widget with advanced features',
        badge: 'New',
        metadata: {
          Price: '$49.99',
          Rating: '4.8/5',
          Stock: 'In Stock',
        },
        action: {
          label: 'View Details',
          onClick: () => alert('Product 1 clicked'),
        },
      },
      {
        id: '2',
        title: 'Essential Bundle',
        description: 'Everything you need to get started',
        badge: 'Best Value',
        metadata: {
          Price: '$99.99',
          Rating: '4.9/5',
          Stock: 'Limited',
        },
        action: {
          label: 'Buy Now',
          onClick: () => alert('Product 2 clicked'),
        },
      },
      {
        id: '3',
        title: 'Pro Package',
        description: 'Professional-grade tools and resources',
        metadata: {
          Price: '$149.99',
          Rating: '5.0/5',
          Stock: 'In Stock',
        },
        action: {
          label: 'Learn More',
          onClick: () => alert('Product 3 clicked'),
        },
      },
    ],
  };

  const templates = [
    { id: 'chart', name: 'Chart', component: <ChartTemplate {...chartData} /> },
    { id: 'multi_chart', name: 'Multi Chart', component: <MultiChartTemplate {...multiChartData} /> },
    { id: 'data_table', name: 'Data Table', component: <DataTableTemplate {...tableData} /> },
    { id: 'form', name: 'Form', component: <FormTemplate {...formData} /> },
    { id: 'survey', name: 'Survey', component: <SurveyTemplate {...surveyData} /> },
    { id: 'calculator', name: 'Calculator', component: <CalculatorTemplate {...calculatorData} /> },
    { id: 'comparison', name: 'Comparison', component: <ComparisonTemplate {...comparisonData} /> },
    { id: 'timeline', name: 'Timeline', component: <TimelineTemplate {...timelineData} /> },
    { id: 'card_grid', name: 'Card Grid', component: <CardGridTemplate {...cardGridData} /> },
  ];

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Crayon Template Demo
          </h1>
          <p className="text-lg text-black/60 dark:text-white/60">
            Interactive showcase of all available generative UI templates
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setActiveTemplate(template.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTemplate === template.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-light-secondary dark:bg-dark-secondary text-black dark:text-white hover:bg-light-200 dark:hover:bg-dark-200'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>

        {/* Active Template Display */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg p-8">
          {templates.find((t) => t.id === activeTemplate)?.component}
        </div>
      </div>
    </div>
  );
}

