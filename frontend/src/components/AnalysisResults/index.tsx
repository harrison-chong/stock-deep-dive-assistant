import { AnalysisData } from '../../types/analysis';
import { MetricsCard } from '../MetricsCard';
import { AlertCircle } from 'lucide-react';

interface AnalysisResultsProps {
  data: AnalysisData;
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  return (
    <div className="space-y-8">
      {/* Company Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{data.company_name}</h2>
            <p className="text-sm text-gray-600 mt-1">{data.ticker}</p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-2">
              <p className="text-4xl font-bold text-gray-900">{data.current_price.toFixed(2)}</p>
              {data.currency && <p className="text-lg text-gray-600">{data.currency}</p>}
            </div>
            {data.market_cap && (
              <p className="text-sm text-gray-600 mt-1">
                Market Cap: ${(data.market_cap / 1e9).toFixed(1)}B
              </p>
            )}
          </div>
        </div>
        {data.sector && (
          <p className="text-gray-700">
            {data.sector} • {data.industry}
          </p>
        )}
      </div>

      {/* Snapshot Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Snapshot</h3>
        <p className="text-gray-700 leading-relaxed">{data.snapshot_summary}</p>
      </div>

      {/* Technical Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <MetricsCard title="Moving Averages" metrics={data.technical_overview.moving_averages} />
        <MetricsCard title="Momentum" metrics={data.technical_overview.momentum} />
        <MetricsCard title="Volatility" metrics={data.technical_overview.volatility || []} />
      </div>

      {/* Fundamental Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricsCard
          title="Profitability"
          metrics={data.fundamental_overview.profitability}
          showInterpretation={true}
        />
        <MetricsCard
          title="Valuation"
          metrics={data.fundamental_overview.valuation}
          showInterpretation={true}
        />
        <MetricsCard
          title="Financial Strength"
          metrics={data.fundamental_overview.financial_strength}
          showInterpretation={true}
        />
        <MetricsCard
          title="Growth"
          metrics={data.fundamental_overview.growth}
          showInterpretation={true}
        />
      </div>

      {/* AI Outlook */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          AI Analysis
          <span className="text-sm font-normal text-gray-600">
            Confidence: {data.ai_outlook.confidence_score.toFixed(0)}%
          </span>
        </h3>

        <div className="space-y-6">
          <div>
            <p className="text-gray-700 leading-relaxed">{data.ai_outlook.overall_summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
              <h4 className="font-semibold text-gray-900 mb-3">Bull Case</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{data.ai_outlook.bull_case}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 bg-red-50">
              <h4 className="font-semibold text-gray-900 mb-3">Bear Case</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{data.ai_outlook.bear_case}</p>
            </div>
          </div>

          {data.ai_outlook.risk_factors.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
              <ul className="space-y-2">
                {data.ai_outlook.risk_factors.map((risk, i) => (
                  <li key={i} className="text-gray-700 text-sm flex gap-3">
                    <span className="text-gray-400">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
            <h4 className="font-semibold text-gray-900 mb-3">Neutral Scenario</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {data.ai_outlook.neutral_scenario}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <div className="flex-1">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Recommendation</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {data.ai_outlook.recommendation}
              </p>
              <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                {data.ai_outlook.recommendation_rationale}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <p className="text-yellow-800 text-sm leading-relaxed">
          This is not financial advice. This tool is for educational purposes only. Always conduct
          your own research and consult with qualified financial advisors before making investment
          decisions.
        </p>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Analysis generated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
