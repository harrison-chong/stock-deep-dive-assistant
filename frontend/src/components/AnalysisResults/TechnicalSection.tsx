import { MetricsCard } from '../MetricsCard';
import {
  movingAverageDefinitions,
  momentumDefinitions,
  volatilityDefinitions,
} from '../../constants/metrics';

interface TechnicalSectionProps {
  technical_overview: {
    moving_averages: { name: string; value: number | null }[];
    momentum: { name: string; value: number | null }[];
    volatility?: { name: string; value: number | null }[];
  };
}

export function TechnicalSection({ technical_overview }: TechnicalSectionProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <MetricsCard
        title="Moving Averages"
        metrics={technical_overview.moving_averages}
        metricDefinitions={movingAverageDefinitions}
        source="calculated"
      />
      <MetricsCard
        title="Momentum"
        metrics={technical_overview.momentum}
        metricDefinitions={momentumDefinitions}
        source="calculated"
      />
      <MetricsCard
        title="Volatility"
        metrics={technical_overview.volatility || []}
        metricDefinitions={volatilityDefinitions}
        source="calculated"
      />
    </div>
  );
}
