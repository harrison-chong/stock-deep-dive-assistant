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

// Small badge to indicate data source
function SourceBadge({ source }: { source: 'yahoo' | 'calculated' }) {
  if (source === 'calculated') {
    return (
      <span
        title="Calculated from historical price data (not from Yahoo Finance)"
        className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded cursor-help"
      >
        Calc
      </span>
    );
  }
  return (
    <span
      title="Data sourced from Yahoo Finance"
      className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded cursor-help"
    >
      Y! Finance
    </span>
  );
}

export function MetricsCard({
  title,
  metrics,
  showInterpretation,
  metricDefinitions,
  source = 'yahoo',
}: MetricsCardProps & {
  metricDefinitions?: Record<string, string>;
  source?: 'yahoo' | 'calculated';
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <SourceBadge source={source} />
      </div>
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <span className="text-gray-700 text-sm flex items-center">
                {metric.name}
                {metricDefinitions?.[metric.name] && (
                  <MetricDefinition text={metricDefinitions?.[metric.name]} />
                )}
              </span>
              <span className="font-medium text-gray-900">
                {formatMetricValue(metric.value, metric.unit, metric.name)}
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
