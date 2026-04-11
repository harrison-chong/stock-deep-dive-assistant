import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  return (
    <div
      className={`mt-4 p-4 bg-red-50/60 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 rounded-xl flex gap-3 ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-red-800 dark:text-red-200 text-sm">{message}</p>
    </div>
  );
}
