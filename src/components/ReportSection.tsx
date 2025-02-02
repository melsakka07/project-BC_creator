import React from 'react';
import { AgentResponse } from '../types';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ReportSectionProps {
  title: string;
  response: AgentResponse;
  icon: LucideIcon;
}

export default function ReportSection({ title, response, icon: Icon }: ReportSectionProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20
      hover:shadow-xl transition-all duration-300 hover:bg-white/80">
      <h3 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary-600" />
        {title}
      </h3>
      
      {response.status === 'loading' && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <span className="ml-4 text-neutral-600 text-lg">Generating analysis...</span>
        </div>
      )}

      {response.status === 'error' && (
        <div className="flex items-center text-red-600 py-4 px-4 bg-red-50 rounded-xl">
          <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
          <p>{response.error || 'An error occurred while generating this section.'}</p>
        </div>
      )}

      {response.status === 'complete' && (
        <div className="prose prose-primary prose-headings:mb-3 prose-p:mb-2.5 prose-ul:my-2 prose-li:my-1 
          prose-h3:mt-6 prose-h4:mt-4 max-w-none text-neutral-700 text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: response.content }}>
        </div>
      )}
    </div>
  );
}