import { AlertCircle, Wifi, Search } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

function inferType(message: string): 'error' | 'rate_limit' | 'not_found' {
  if (message.includes('rate limit') || message.includes('Rate limit')) return 'rate_limit';
  if (message.includes('No data found') || message.includes('not found')) return 'not_found';
  return 'error';
}

const ICONS = {
  error: AlertCircle,
  rate_limit: Wifi,
  not_found: Search,
};

const STYLES = {
  error:
    'bg-red-50/60 dark:bg-red-900/30 border-red-200/50 dark:border-red-800/50 text-red-800 dark:text-red-200',
  rate_limit:
    'bg-amber-50/60 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-800/50 text-amber-800 dark:text-amber-200',
  not_found:
    'bg-blue-50/60 dark:bg-blue-900/30 border-blue-200/50 dark:border-blue-800/50 text-blue-800 dark:text-blue-200',
};

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  const type = inferType(message);
  const Icon = ICONS[type];
  const style = STYLES[type];

  return (
    <div className={`mt-4 p-4 rounded-xl border flex gap-3 ${style} ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}
