'use client';

import React from 'react';
import { Document } from '@langchain/core/documents';
import MessageSources from '../MessageSources';
import { BookCopy } from 'lucide-react';

interface SourcesTemplateProps {
  sources: Document[];
}

const SourcesTemplate: React.FC<SourcesTemplateProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex flex-row items-center space-x-2">
        <BookCopy className="text-black dark:text-white" size={20} />
        <h3 className="text-black dark:text-white font-medium text-xl">
          Sources
        </h3>
      </div>
      <MessageSources sources={sources} />
    </div>
  );
};

export default SourcesTemplate;

