import { AnalysisData } from '../../types/analysis';
import { PriceChart } from '../PriceChart';
import { WarningAlert } from '../shared/WarningAlert';
import { CompanyHeader } from './CompanyHeader';
import { DataSourceLegend } from './DataSourceLegend';
import { TechnicalSection } from './TechnicalSection';
import { FundamentalSection } from './FundamentalSection';
import { AdvancedMetricsSection } from './AdvancedMetricsSection';

interface AnalysisResultsProps {
  data: AnalysisData;
  period: string;
  loadingAI?: boolean;
  errorAI?: string;
  onGenerateAI?: () => void;
}

export function AnalysisResults({
  data,
  period,
  loadingAI = false,
  errorAI,
  onGenerateAI,
}: AnalysisResultsProps) {
  return (
    <div className="space-y-5">
      {/* Company Header */}
      <CompanyHeader data={data} />

      {/* Data Source Legend */}
      <DataSourceLegend />

      {/* Price Chart */}
      <PriceChart
        ticker={data.ticker}
        currentPrice={data.current_price}
        chartData={data.chart_data}
        period={period}
      />

      {/* Technical Overview */}
      <TechnicalSection technical_overview={data.technical_overview} />

      {/* Fundamental Overview */}
      <FundamentalSection data={data} />

      {/* Advanced Metrics - Statistical, Technical, Seasonal, AI */}
      <AdvancedMetricsSection
        data={data}
        loadingAI={loadingAI}
        errorAI={errorAI}
        onGenerateAI={onGenerateAI}
      />

      {/* Disclaimer */}
      <WarningAlert
        message="This is not financial advice. This tool is for educational purposes only. Always conduct your own research and consult with qualified financial advisors before making investment decisions."
        className="mt-4"
      />

      <p className="text-xs text-gray-300 text-center">
        Analysis generated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
