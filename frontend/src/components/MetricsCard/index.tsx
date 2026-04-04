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

function formatMetricValue(value: number | null, unit?: string): string {
  if (value === null) return 'N/A';

  // Handle percentage values - yfinance returns decimals (0.14 = 14%)
  if (unit === '%') {
    return `${(value * 100).toFixed(2)}%`;
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

export function MetricsCard({
  title,
  metrics,
  showInterpretation,
  metricDefinitions,
}: MetricsCardProps & { metricDefinitions?: Record<string, string> }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <span className="text-gray-700 text-sm flex items-center">
                {metric.name}
                {metricDefinitions?.[metric.name] && (
                  <MetricDefinition text={metricDefinitions[metric.name]} />
                )}
              </span>
              <span className="font-medium text-gray-900">
                {formatMetricValue(metric.value, metric.unit)}
              </span>
            </div>
            {showInterpretation && metric.interpretation && (
              <p className="text-xs text-gray-600">{metric.interpretation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
