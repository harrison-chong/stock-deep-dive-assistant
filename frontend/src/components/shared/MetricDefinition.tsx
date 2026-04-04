import { HelpCircle } from 'lucide-react';

interface MetricDefinitionProps {
  text: string;
}

export function MetricDefinition({ text }: MetricDefinitionProps) {
  return (
    <span className="group relative inline-flex items-center ml-1">
      <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {text}
      </span>
    </span>
  );
}
