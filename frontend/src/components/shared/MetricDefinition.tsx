import { HelpCircle } from 'lucide-react';

interface MetricDefinitionProps {
  text: string;
}

export function MetricDefinition({ text }: MetricDefinitionProps) {
  return (
    <span className="group relative inline-flex items-center ml-1 flex-shrink-0">
      <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
      {/* Desktop tooltip - positioned above */}
      <span className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none max-w-xs break-words">
        {text}
      </span>
      {/* Mobile tooltip - positioned below, always visible on tap */}
      <span className="md:hidden absolute top-full left-0 mt-1 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none max-w-xs break-words">
        {text}
      </span>
    </span>
  );
}
