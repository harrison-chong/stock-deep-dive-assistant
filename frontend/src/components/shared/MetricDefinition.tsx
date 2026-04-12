import { HelpCircle } from 'lucide-react';

interface MetricDefinitionProps {
  text: string;
}

export function MetricDefinition({ text }: MetricDefinitionProps) {
  return (
    <span
      className="group relative inline-flex items-center ml-1 flex-shrink-0"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
      {/* Desktop tooltip - positioned to the right */}
      <span className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 text-xs text-white bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none whitespace-normal w-64 leading-relaxed shadow-lg">
        {text}
      </span>
      {/* Tablet tooltip - positioned below */}
      <span className="hidden md:block lg:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none whitespace-normal w-52 leading-relaxed shadow-lg">
        {text}
      </span>
      {/* Mobile tooltip - fixed at bottom of screen */}
      <span className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 text-xs text-white bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[100] pointer-events-none whitespace-normal w-[calc(100%-2rem)] max-w-sm leading-relaxed shadow-elevated">
        {text}
      </span>
    </span>
  );
}
