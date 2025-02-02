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
    <div className="group bg-white/70 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl 
      shadow-lg dark:shadow-neutral-900/30 p-4 sm:p-8 border border-white/20 
      dark:border-neutral-700/30 hover:shadow-xl transition-all duration-300 
      hover:bg-white/80 dark:hover:bg-neutral-800/60">
      <h3 className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100 
        mb-4 flex items-center gap-3">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400 
          flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
        {title}
      </h3>
      
      {response.status === 'loading' && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 dark:text-primary-400 
            animate-spin" />
          <span className="ml-3 sm:ml-4 text-neutral-600 dark:text-neutral-300 
            text-base sm:text-lg">
            Generating analysis...
          </span>
        </div>
      )}

      {response.status === 'error' && (
        <div className="flex items-center text-red-600 dark:text-red-400 py-4 px-4 
          bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 
          dark:border-red-900/20">
          <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
          <p>{response.error || 'An error occurred while generating this section.'}</p>
        </div>
      )}

      {response.status === 'complete' && (
        <div className="prose prose-sm sm:prose prose-primary dark:prose-invert 
          prose-headings:mb-3 prose-p:mb-2.5 prose-ul:my-2 prose-li:my-1 
          prose-h3:mt-6 prose-h4:mt-4 max-w-none text-neutral-700 dark:text-neutral-200 
          text-sm sm:text-base leading-relaxed overflow-x-auto
          prose-a:text-primary-600 dark:prose-a:text-primary-400
          prose-strong:text-neutral-800 dark:prose-strong:text-neutral-100
          prose-code:text-neutral-700 dark:prose-code:text-neutral-300
          prose-pre:bg-neutral-50 dark:prose-pre:bg-neutral-900/50
          prose-th:text-neutral-700 dark:prose-th:text-neutral-300
          prose-td:text-neutral-600 dark:prose-td:text-neutral-400"
          dangerouslySetInnerHTML={{ __html: response.content }}>
        </div>
      )}
    </div>
  );
}