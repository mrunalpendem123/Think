'use client';

import React from 'react';
import ThinkBox from '../ThinkBox';

interface ThinkingTemplateProps {
  content: string;
  thinkingEnded: boolean;
}

const ThinkingTemplate: React.FC<ThinkingTemplateProps> = ({
  content,
  thinkingEnded,
}) => {
  return <ThinkBox content={content} thinkingEnded={thinkingEnded} />;
};

export default ThinkingTemplate;

