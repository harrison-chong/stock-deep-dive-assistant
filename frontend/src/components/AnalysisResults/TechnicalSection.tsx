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
        source="calc"
      />
      <MetricsCard
        title="Momentum"
        metrics={technical_overview.momentum}
        metricDefinitions={momentumDefinitions}
        source="calc"
      />
      <MetricsCard
        title="Volatility"
        metrics={technical_overview.volatility || []}
        metricDefinitions={volatilityDefinitions}
        source="calc"
      />
    </div>
  );
}
