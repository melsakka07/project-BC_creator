import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: {
    title: string;
    description: string;
  };
}

export default function Tooltip({ content }: TooltipProps) {
  return (
    <div className="group relative">
      <HelpCircle className="h-4 w-4 text-neutral-400 dark:text-neutral-500 
        hover:text-primary-500 dark:hover:text-primary-400 
        transition-colors cursor-help" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden 
        group-hover:block w-64 p-3 bg-white dark:bg-neutral-800 rounded-lg 
        shadow-lg dark:shadow-neutral-900/50 border border-neutral-100 
        dark:border-neutral-700 z-10 animate-fadeIn">
        <p className="font-medium mb-1 text-neutral-800 dark:text-neutral-100">
          {content.title}
        </p>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs">
          {content.description}
        </p>
        <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-white dark:bg-neutral-800 
          border-r border-b border-neutral-100 dark:border-neutral-700 
          transform rotate-45 -translate-x-1/2">
        </div>
      </div>
    </div>
  );
} 