import { type ResponseTemplate } from '@crayonai/react-core';
import StandardMessageTemplate from '@/components/templates/StandardMessageTemplate';
import WeatherTemplate from '@/components/templates/WeatherTemplate';
import NewsTemplate from '@/components/templates/NewsTemplate';
import SourcesTemplate from '@/components/templates/SourcesTemplate';
import ThinkingTemplate from '@/components/templates/ThinkingTemplate';
import ImageGalleryTemplate from '@/components/templates/ImageGalleryTemplate';
import VideoResultsTemplate from '@/components/templates/VideoResultsTemplate';
import SearchResultsTemplate from '@/components/templates/SearchResultsTemplate';
// New generative UI templates
import ChartTemplate from '@/components/templates/ChartTemplate';
import MultiChartTemplate from '@/components/templates/MultiChartTemplate';
import DataTableTemplate from '@/components/templates/DataTableTemplate';
import FormTemplate from '@/components/templates/FormTemplate';
import SurveyTemplate from '@/components/templates/SurveyTemplate';
import CalculatorTemplate from '@/components/templates/CalculatorTemplate';
import ComparisonTemplate from '@/components/templates/ComparisonTemplate';
import TimelineTemplate from '@/components/templates/TimelineTemplate';
import CardGridTemplate from '@/components/templates/CardGridTemplate';

/**
 * Template Registry for Crayon Chat
 * Maps template names to their corresponding React components
 */
export const templates: ResponseTemplate[] = [
  // Basic content templates
  {
    name: 'standard_message',
    component: StandardMessageTemplate,
  },
  {
    name: 'weather',
    component: WeatherTemplate,
  },
  {
    name: 'news',
    component: NewsTemplate,
  },
  {
    name: 'sources',
    component: SourcesTemplate,
  },
  {
    name: 'thinking',
    component: ThinkingTemplate,
  },
  {
    name: 'images',
    component: ImageGalleryTemplate,
  },
  {
    name: 'videos',
    component: VideoResultsTemplate,
  },
  {
    name: 'search_results',
    component: SearchResultsTemplate,
  },
  // Data visualization templates
  {
    name: 'chart',
    component: ChartTemplate,
  },
  {
    name: 'multi_chart',
    component: MultiChartTemplate,
  },
  {
    name: 'data_table',
    component: DataTableTemplate,
  },
  // Interactive form templates
  {
    name: 'form',
    component: FormTemplate,
  },
  {
    name: 'survey',
    component: SurveyTemplate,
  },
  // Interactive widget templates
  {
    name: 'calculator',
    component: CalculatorTemplate,
  },
  {
    name: 'comparison',
    component: ComparisonTemplate,
  },
  {
    name: 'timeline',
    component: TimelineTemplate,
  },
  {
    name: 'card_grid',
    component: CardGridTemplate,
  },
];

/**
 * Get a template by name
 */
export function getTemplate(name: string): ResponseTemplate | undefined {
  return templates.find((t) => t.name === name);
}

/**
 * Check if a template exists
 */
export function hasTemplate(name: string): boolean {
  return templates.some((t) => t.name === name);
}

export default templates;

