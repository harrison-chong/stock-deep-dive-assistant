import { AlertCircle } from 'lucide-react';

interface WarningAlertProps {
  message: string;
  className?: string;
}

export function WarningAlert({ message, className = '' }: WarningAlertProps) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex gap-4 ${className}`}>
      <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
      <p className="text-yellow-800 text-sm leading-relaxed">{message}</p>
    </div>
  );
}
