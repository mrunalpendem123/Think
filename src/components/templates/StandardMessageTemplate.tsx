'use client';

import React from 'react';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import { cn } from '@/lib/utils';
import Citation from '../Citation';

interface StandardMessageTemplateProps {
  content: string;
  thinkingEnded?: boolean;
}

const StandardMessageTemplate: React.FC<StandardMessageTemplateProps> = ({
  content,
  thinkingEnded = true,
}) => {
  const markdownOverrides: MarkdownToJSX.Options = {
    overrides: {
      citation: {
        component: Citation,
      },
    },
  };

  return (
    <div className="relative select-text">
      <Markdown
        className={cn(
          'prose prose-h1:mb-3 prose-h2:mb-2 prose-h2:mt-6 prose-h2:font-[800] prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:font-[600] dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 font-[400]',
          'max-w-none break-words text-black dark:text-white select-text',
        )}
        options={markdownOverrides}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default StandardMessageTemplate;

