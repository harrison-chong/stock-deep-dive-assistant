import { AlertCircle } from 'lucide-react';

interface WarningAlertProps {
  message: string;
  className?: string;
}

export function WarningAlert({ message, className = '' }: WarningAlertProps) {
  return (
    <div
      className={`bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl p-5 flex gap-4 transition-colors duration-300 ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
      <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed">{message}</p>
    </div>
  );
}
