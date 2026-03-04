import { MetricsCardProps } from '../../types/analysis';

export function MetricsCard({ title, metrics, showInterpretation }: MetricsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <span className="text-gray-700 text-sm">{metric.name}</span>
              <span className="font-medium text-gray-900">
                {metric.value !== null ? metric.value.toFixed(2) : 'N/A'}
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
