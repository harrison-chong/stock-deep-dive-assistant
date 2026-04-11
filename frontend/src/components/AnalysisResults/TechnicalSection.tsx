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
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
    >
      <MetricsCard
        title="Moving Averages"
        metrics={technical_overview.moving_averages}
        metricDefinitions={movingAverageDefinitions}
      />
      <MetricsCard
        title="Momentum"
        metrics={technical_overview.momentum}
        metricDefinitions={momentumDefinitions}
      />
      <MetricsCard
        title="Volatility"
        metrics={technical_overview.volatility || []}
        metricDefinitions={volatilityDefinitions}
      />
    </div>
  );
}
