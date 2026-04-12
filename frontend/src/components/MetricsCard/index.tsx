import { memo } from 'react';
import { MetricsCardProps } from '../../types/analysis';
import { MetricDefinition } from '../shared/MetricDefinition';

// Format large numbers with appropriate suffixes (K, M, B, T)
function formatLargeNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e12) {
    return `${sign}$${(absValue / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}$${(absValue / 1e3).toFixed(2)}K`;
  }
  return `${sign}$${absValue.toFixed(2)}`;
}

// Metrics that show N/A when value is 0 (not applicable for certain industries)
const metricsAsNAWhenZero = [
  'Gross Margins',
  'Operating Margins',
  'Profit Margin',
  'Return on Assets',
  'Return on Investment',
];

function formatMetricValue(value: number | null, unit?: string, name?: string): string {
  if (value === null) return 'N/A';

  // For certain metrics, 0 means not applicable
  if (value === 0 && name && metricsAsNAWhenZero.includes(name)) {
    return 'N/A';
  }

  // Handle percentage values - backend already converts decimals to percentages
  if (unit === '%') {
    return `${value.toFixed(2)}%`;
  }

  // Handle currency/share values
  if (unit === 'shares') {
    return value.toLocaleString();
  }

  // Handle dollar values (ATR, etc.)
  if (unit === '$') {
    return `$${value.toFixed(2)}`;
  }

  // Format large numbers (market cap, enterprise value, etc.)
  if (Math.abs(value) >= 1e9) {
    return formatLargeNumber(value);
  }

  // Default formatting for plain numbers
  return value.toFixed(2);
}

function SourceBadge({ source }: { source: 'yahoo' | 'calc' }) {
  if (source === 'yahoo') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/30 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Y! Finance
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-900/30 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
      Calc
    </span>
  );
}

export const MetricsCard = memo(function MetricsCard({
  title,
  metrics,
  metricDefinitions,
  source,
}: MetricsCardProps) {
  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-5 border border-gray-200/30 dark:border-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {source && <SourceBadge source={source} />}
      </div>
      <div className="space-y-3.5">
        {metrics.map((metric, i) => (
          <div key={metric.name || i} className="flex justify-between items-start gap-3">
            <span className="text-gray-500 dark:text-gray-400 text-sm flex flex-wrap items-center gap-1.5">
              <span className="whitespace-nowrap">{metric.name}</span>
              {metricDefinitions?.[metric.name] && (
                <MetricDefinition text={metricDefinitions?.[metric.name]} />
              )}
            </span>
            <span className="font-medium text-gray-900 dark:text-white text-sm whitespace-nowrap tabular-nums">
              {formatMetricValue(metric.value, metric.unit, metric.name)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
