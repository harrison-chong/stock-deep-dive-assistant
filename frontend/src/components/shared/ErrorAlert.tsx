import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  return (
    <div className={`mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-red-800 text-sm">{message}</p>
    </div>
  );
}
