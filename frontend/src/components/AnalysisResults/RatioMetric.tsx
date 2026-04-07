import { MetricDefinition } from '../shared/MetricDefinition';

interface RatioMetricProps {
  name: string;
  value: number | null;
  description: string;
  thresholds?: { green: number; yellow?: number };
}

export function RatioMetric({
  name,
  value,
  description,
  thresholds = { green: 1, yellow: 0 },
}: RatioMetricProps) {
  const getColor = (val: number) => {
    if (val >= thresholds.green) return 'text-green-600';
    if (val >= (thresholds.yellow ?? 0)) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">
        {name}
        <MetricDefinition text={description} />
      </p>
      {value != null ? (
        <p className={`text-xl font-bold ${getColor(value)}`}>{value.toFixed(2)}</p>
      ) : (
        <p className="text-xl font-bold text-gray-400">N/A</p>
      )}
    </div>
  );
}
