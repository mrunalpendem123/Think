# Generative UI Templates Documentation

This document provides comprehensive information about all available Crayon templates for creating interactive, data-rich AI responses.

## Overview

Crayon templates allow AI agents to generate dynamic, interactive UI components beyond plain text. These templates support data visualizations, forms, calculators, and more.

## Available Templates

### Data Visualization Templates

#### 1. Chart Template (`chart`)

Display numerical data with various chart types.

**Props:**
- `type`: 'line' | 'bar' | 'pie' | 'area' (required)
- `data`: Array of objects with key-value pairs (required)
- `xKey`: String - key for X-axis data (default: 'name')
- `yKey`: String - key for Y-axis data (default: 'value')
- `title`: String - chart title
- `colors`: Array of hex colors
- `description`: String - chart description

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'chart',
  data: {
    type: 'bar',
    title: 'Monthly Sales 2024',
    description: 'Sales performance across different months',
    xKey: 'month',
    yKey: 'sales',
    data: [
      { month: 'Jan', sales: 4000 },
      { month: 'Feb', sales: 3000 },
      { month: 'Mar', sales: 5000 },
      { month: 'Apr', sales: 4500 }
    ],
    colors: ['#3b82f6']
  }
}
```

#### 2. Multi-Chart Template (`multi_chart`)

Display multiple charts in a grid layout for comparison.

**Props:**
- `charts`: Array of chart configurations
- `columns`: 1 | 2 | 3 (default: 2)
- `mainTitle`: String - overall title
- `description`: String - overall description

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'multi_chart',
  data: {
    mainTitle: 'Q1 2024 Performance Dashboard',
    columns: 2,
    charts: [
      {
        type: 'line',
        title: 'Revenue Trend',
        data: [{ month: 'Jan', value: 10000 }],
        xKey: 'month',
        yKey: 'value'
      },
      {
        type: 'bar',
        title: 'Expenses',
        data: [{ month: 'Jan', value: 7000 }],
        xKey: 'month',
        yKey: 'value'
      }
    ]
  }
}
```

#### 3. Data Table Template (`data_table`)

Interactive table with sorting, searching, and pagination.

**Props:**
- `columns`: Array of column definitions (required)
  - `key`: String - data key
  - `label`: String - column header
  - `sortable`: boolean (default: true)
  - `width`: String - column width
- `data`: Array of row objects (required)
- `title`: String - table title
- `description`: String - table description
- `searchable`: boolean (default: true)
- `pageSize`: number (default: 10)
- `exportable`: boolean (default: true)

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'data_table',
  data: {
    title: 'Product Comparison',
    description: 'Compare features across different products',
    columns: [
      { key: 'name', label: 'Product Name', sortable: true },
      { key: 'price', label: 'Price', sortable: true },
      { key: 'rating', label: 'Rating', sortable: true }
    ],
    data: [
      { name: 'Product A', price: '$29.99', rating: 4.5 },
      { name: 'Product B', price: '$39.99', rating: 4.8 },
      { name: 'Product C', price: '$19.99', rating: 4.2 }
    ],
    searchable: true,
    exportable: true
  }
}
```

### Interactive Form Templates

#### 4. Form Template (`form`)

Dynamic form with various input types and validation.

**Props:**
- `fields`: Array of field definitions (required)
  - `name`: String - field identifier
  - `type`: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox' | 'radio'
  - `label`: String - field label
  - `placeholder`: String
  - `required`: boolean
  - `options`: Array (for select/radio) - `[{ value, label }]`
  - `validation`: Object - validation rules
- `onSubmit`: Function - callback when form is submitted
- `submitLabel`: String (default: 'Submit')
- `title`: String - form title
- `description`: String - form description

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'form',
  data: {
    title: 'Contact Information',
    description: 'Please provide your details',
    fields: [
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        placeholder: 'your@email.com'
      },
      {
        name: 'phone',
        type: 'text',
        label: 'Phone Number',
        validation: {
          pattern: '^[0-9]{10}$',
          message: 'Please enter a valid 10-digit phone number'
        }
      },
      {
        name: 'preference',
        type: 'select',
        label: 'Contact Preference',
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' }
        ]
      }
    ],
    submitLabel: 'Send Information'
  }
}
```

#### 5. Survey Template (`survey`)

Multi-step survey with progress tracking.

**Props:**
- `questions`: Array of question objects (required)
  - `id`: String - question identifier
  - `question`: String - question text
  - `type`: 'text' | 'number' | 'select' | 'radio' | 'textarea'
  - `required`: boolean
  - `options`: Array (for select/radio)
  - `placeholder`: String
- `onComplete`: Function - callback when survey is completed
- `title`: String - survey title
- `description`: String - survey description

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'survey',
  data: {
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve by answering a few questions',
    questions: [
      {
        id: 'rating',
        question: 'How would you rate our service?',
        type: 'radio',
        required: true,
        options: [
          { value: '5', label: 'Excellent' },
          { value: '4', label: 'Good' },
          { value: '3', label: 'Average' },
          { value: '2', label: 'Poor' },
          { value: '1', label: 'Very Poor' }
        ]
      },
      {
        id: 'feedback',
        question: 'Any additional comments?',
        type: 'textarea',
        placeholder: 'Share your thoughts...'
      }
    ]
  }
}
```

### Interactive Widget Templates

#### 6. Calculator Template (`calculator`)

Interactive calculator with sliders and real-time results.

**Props:**
- `title`: String (required) - calculator title
- `formula`: String (required) - JavaScript expression
- `variables`: Array of variable definitions (required)
  - `name`: String - variable identifier
  - `label`: String - variable label
  - `defaultValue`: number
  - `min`: number
  - `max`: number
  - `step`: number
  - `unit`: String
- `description`: String
- `resultLabel`: String (default: 'Result')
- `resultUnit`: String

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'calculator',
  data: {
    title: 'Loan Payment Calculator',
    description: 'Calculate your monthly loan payment',
    formula: '(amount * rate / 100) / months',
    variables: [
      {
        name: 'amount',
        label: 'Loan Amount',
        defaultValue: 10000,
        min: 1000,
        max: 100000,
        step: 1000,
        unit: '$'
      },
      {
        name: 'rate',
        label: 'Interest Rate',
        defaultValue: 5,
        min: 0,
        max: 20,
        step: 0.1,
        unit: '%'
      },
      {
        name: 'months',
        label: 'Loan Term',
        defaultValue: 12,
        min: 6,
        max: 60,
        step: 6,
        unit: 'months'
      }
    ],
    resultLabel: 'Monthly Payment',
    resultUnit: '$'
  }
}
```

#### 7. Comparison Template (`comparison`)

Side-by-side comparison of items with feature matrix.

**Props:**
- `items`: Array of comparison items (required)
  - `name`: String - item name
  - `features`: Object - key-value pairs (boolean, string, or number)
  - `highlighted`: boolean - highlight this item
  - `badge`: String - optional badge text
- `title`: String
- `description`: String
- `featureLabels`: Object - custom labels for features

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'comparison',
  data: {
    title: 'Subscription Plan Comparison',
    description: 'Choose the plan that fits your needs',
    items: [
      {
        name: 'Basic',
        features: {
          price: '$9.99',
          users: '1 user',
          storage: '10GB',
          support: false,
          api: false
        }
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
          api: true
        }
      },
      {
        name: 'Enterprise',
        features: {
          price: 'Custom',
          users: 'Unlimited',
          storage: '1TB',
          support: true,
          api: true
        }
      }
    ],
    featureLabels: {
      price: 'Monthly Price',
      users: 'Team Size',
      storage: 'Storage Space',
      support: '24/7 Support',
      api: 'API Access'
    }
  }
}
```

#### 8. Timeline Template (`timeline`)

Visual timeline for chronological events.

**Props:**
- `events`: Array of event objects (required)
  - `date`: String - event date
  - `title`: String - event title
  - `description`: String - event description
  - `location`: String - optional location
  - `icon`: ReactNode - custom icon
  - `color`: String - color class (e.g., 'bg-blue-500')
- `title`: String
- `description`: String
- `layout`: 'vertical' | 'horizontal' (default: 'vertical')

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'timeline',
  data: {
    title: 'Product Development Timeline',
    description: 'Key milestones in our journey',
    layout: 'vertical',
    events: [
      {
        date: 'Jan 2024',
        title: 'Project Kickoff',
        description: 'Initial planning and team formation',
        location: 'San Francisco, CA'
      },
      {
        date: 'Mar 2024',
        title: 'MVP Launch',
        description: 'Released minimum viable product to beta testers',
        color: 'bg-green-500'
      },
      {
        date: 'Jun 2024',
        title: 'Public Release',
        description: 'Official launch to the public',
        color: 'bg-blue-500'
      }
    ]
  }
}
```

#### 9. Card Grid Template (`card_grid`)

Responsive grid of interactive cards.

**Props:**
- `cards`: Array of card objects (required)
  - `id`: String - unique identifier
  - `title`: String - card title
  - `description`: String - card description
  - `image`: String - image URL
  - `badge`: String - optional badge
  - `metadata`: Object - key-value metadata
  - `action`: Object - action button
    - `label`: String - button text
    - `url`: String - external link
    - `onClick`: Function - click handler
- `columns`: 1 | 2 | 3 | 4 (default: 3)
- `title`: String
- `description`: String
- `onCardClick`: Function - callback when card is clicked

**Example Usage:**
```typescript
{
  role: 'assistant',
  template: 'card_grid',
  data: {
    title: 'Featured Products',
    description: 'Check out our latest offerings',
    columns: 3,
    cards: [
      {
        id: '1',
        title: 'Premium Widget',
        description: 'High-quality widget with advanced features',
        image: 'https://example.com/widget.jpg',
        badge: 'New',
        metadata: {
          'Price': '$49.99',
          'Rating': '4.8/5',
          'Stock': 'In Stock'
        },
        action: {
          label: 'View Details',
          url: 'https://example.com/product/1'
        }
      },
      {
        id: '2',
        title: 'Essential Bundle',
        description: 'Everything you need to get started',
        image: 'https://example.com/bundle.jpg',
        badge: 'Best Value',
        metadata: {
          'Price': '$99.99',
          'Rating': '4.9/5',
          'Stock': 'Limited'
        },
        action: {
          label: 'Buy Now',
          url: 'https://example.com/product/2'
        }
      }
    ]
  }
}
```

## Usage Guidelines

### When to Use Each Template

- **Chart**: Numerical trends, growth patterns, distributions
- **Multi-Chart**: Comparing multiple datasets or metrics
- **Data Table**: Structured data with multiple attributes (5+ items)
- **Form**: Collecting user input with validation
- **Survey**: Multi-step questionnaires or feedback collection
- **Calculator**: Interactive calculations with variable inputs
- **Comparison**: Comparing 2-4 options/products side-by-side
- **Timeline**: Sequential events, history, or process steps
- **Card Grid**: Visual galleries, product showcases, portfolios

### Best Practices

1. **Always provide context**: Explain the data before showing a template
2. **Use appropriate templates**: Match the template to the data structure
3. **Keep data clean**: Ensure JSON is properly formatted
4. **Add citations**: Include source citations in surrounding text
5. **Supplement, don't replace**: Use templates alongside written explanations
6. **Test responsiveness**: Ensure templates work on mobile devices
7. **Handle errors gracefully**: Provide fallback content if template fails

### Integration with AI Prompts

Templates can be embedded in AI responses using special syntax that the backend will parse and render as interactive components. Always ensure the AI understands when and how to use these templates effectively.

## Dark Mode Support

All templates include full dark mode styling that automatically adapts to the user's theme preference using Tailwind CSS dark mode classes.

## Accessibility

Templates are built with accessibility in mind:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast in dark mode
- Focus indicators

## Performance Considerations

- Charts use ResponsiveContainer for automatic resizing
- Tables implement virtual scrolling for large datasets
- Forms use controlled components with optimized re-renders
- All components are lazy-loaded when possible

