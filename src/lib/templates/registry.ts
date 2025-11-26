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
    Component: StandardMessageTemplate,
  },
  {
    name: 'weather',
    Component: WeatherTemplate,
  },
  {
    name: 'news',
    Component: NewsTemplate,
  },
  {
    name: 'sources',
    Component: SourcesTemplate,
  },
  {
    name: 'thinking',
    Component: ThinkingTemplate,
  },
  {
    name: 'images',
    Component: ImageGalleryTemplate,
  },
  {
    name: 'videos',
    Component: VideoResultsTemplate,
  },
  {
    name: 'search_results',
    Component: SearchResultsTemplate,
  },
  // Data visualization templates
  {
    name: 'chart',
    Component: ChartTemplate,
  },
  {
    name: 'multi_chart',
    Component: MultiChartTemplate,
  },
  {
    name: 'data_table',
    Component: DataTableTemplate,
  },
  // Interactive form templates
  {
    name: 'form',
    Component: FormTemplate,
  },
  {
    name: 'survey',
    Component: SurveyTemplate,
  },
  // Interactive widget templates
  {
    name: 'calculator',
    Component: CalculatorTemplate,
  },
  {
    name: 'comparison',
    Component: ComparisonTemplate,
  },
  {
    name: 'timeline',
    Component: TimelineTemplate,
  },
  {
    name: 'card_grid',
    Component: CardGridTemplate,
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

