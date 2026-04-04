import { AnalysisData } from '../../types/analysis';
import { MetricsCard } from '../MetricsCard';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface AnalysisResultsProps {
  data: AnalysisData;
}

function MetricDefinition({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center ml-1">
      <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {text}
      </span>
    </span>
  );
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

      {/* Advanced Metrics - Statistical & Risk-Adjusted Returns */}
      {data.advanced_metrics && (
        <div className="space-y-8">
          {/* Statistical & Risk-Adjusted Returns */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Statistical & Risk-Adjusted Returns
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Total Return
                  <MetricDefinition text="Cumulative return from the beginning of the available data period to the most recent date." />
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {data.advanced_metrics.statistical.total_return != null
                    ? `${(data.advanced_metrics.statistical.total_return * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Annualized Return (CAGR)
                  <MetricDefinition text="Compound Annual Growth Rate - the mean annual return required for an investment to grow from its initial to its ending value, assuming profits are reinvested." />
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {data.advanced_metrics.statistical.annualized_return != null
                    ? `${(data.advanced_metrics.statistical.annualized_return * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Annualized Volatility
                  <MetricDefinition text="Standard deviation of daily returns annualized to a yearly measure. Higher values indicate greater price fluctuations and risk." />
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {data.advanced_metrics.statistical.annualized_volatility != null
                    ? `${(data.advanced_metrics.statistical.annualized_volatility * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Sharpe Ratio
                  <MetricDefinition text="Risk-adjusted return measure: (Return - Risk-Free Rate) / Volatility. Values above 1 are good, above 2 very good, above 3 excellent." />
                </p>
                {data.advanced_metrics.statistical.sharpe_ratio != null ? (
                  <p
                    className={`text-xl font-bold ${
                      data.advanced_metrics.statistical.sharpe_ratio >= 1
                        ? 'text-green-600'
                        : data.advanced_metrics.statistical.sharpe_ratio >= 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {data.advanced_metrics.statistical.sharpe_ratio.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Sortino Ratio
                  <MetricDefinition text="Similar to Sharpe but only considers downside volatility (negative returns). Higher is better. Values above 2 are considered good." />
                </p>
                {data.advanced_metrics.statistical.sortino_ratio != null ? (
                  <p
                    className={`text-xl font-bold ${
                      data.advanced_metrics.statistical.sortino_ratio >= 1
                        ? 'text-green-600'
                        : data.advanced_metrics.statistical.sortino_ratio >= 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {data.advanced_metrics.statistical.sortino_ratio.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Calmar Ratio
                  <MetricDefinition text="Annualized return divided by maximum drawdown. Measures return per unit of worst-case loss. Values above 1 are favorable." />
                </p>
                {data.advanced_metrics.statistical.calmar_ratio != null ? (
                  <p
                    className={`text-xl font-bold ${
                      data.advanced_metrics.statistical.calmar_ratio >= 1
                        ? 'text-green-600'
                        : data.advanced_metrics.statistical.calmar_ratio >= 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {data.advanced_metrics.statistical.calmar_ratio.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Maximum Drawdown
                  <MetricDefinition text="The largest peak-to-trough decline during the analysis period. Indicates the worst losses an investor would have experienced." />
                </p>
                <p className="text-xl font-bold text-red-600">
                  {data.advanced_metrics.statistical.max_drawdown != null
                    ? `${(data.advanced_metrics.statistical.max_drawdown * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Value at Risk (95%, 1-day)
                  <MetricDefinition text="The maximum expected loss over a 1-day period at 95% confidence. A VaR of -2% means there's a 95% probability that daily losses won't exceed 2%." />
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {data.advanced_metrics.statistical.var_95 != null
                    ? `${(data.advanced_metrics.statistical.var_95 * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Ulcer Index
                  <MetricDefinition text="Measures downside volatility focusing on the depth and duration of drawdowns. Lower values indicate less stressful volatility." />
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {data.advanced_metrics.statistical.ulcer_index != null
                    ? data.advanced_metrics.statistical.ulcer_index.toFixed(2)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Recovery Days
                  <MetricDefinition text="Number of trading days required to recover from the maximum drawdown. -1 indicates the position never fully recovered." />
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {data.advanced_metrics.statistical.recovery_days != null
                    ? `${data.advanced_metrics.statistical.recovery_days} days`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Skewness
                  <MetricDefinition text="Measures return distribution asymmetry. Positive (>0.5) means more extreme gains; negative (<-0.5) means more extreme losses." />
                </p>
                {data.advanced_metrics.statistical.skewness != null ? (
                  <>
                    <p className="text-xl font-bold text-gray-900">
                      {data.advanced_metrics.statistical.skewness.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.advanced_metrics.statistical.skewness > 0.5
                        ? 'Positively skewed'
                        : data.advanced_metrics.statistical.skewness < -0.5
                          ? 'Negatively skewed'
                          : 'Symmetric'}
                    </p>
                  </>
                ) : (
                  <div>
                    <p className="text-xl font-bold text-gray-400">N/A</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Kurtosis (Excess)
                  <MetricDefinition text="Measures tail heaviness. >3 means fat tails (more extreme events than normal); <3 means lighter tails. Normal distribution = 3." />
                </p>
                {data.advanced_metrics.statistical.kurtosis != null ? (
                  <>
                    <p className="text-xl font-bold text-gray-900">
                      {data.advanced_metrics.statistical.kurtosis.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.advanced_metrics.statistical.kurtosis > 3
                        ? 'Fat tails (leptokurtic)'
                        : data.advanced_metrics.statistical.kurtosis < 3
                          ? 'Thin tails (platykurtic)'
                          : 'Normal tails'}
                    </p>
                  </>
                ) : (
                  <div>
                    <p className="text-xl font-bold text-gray-400">N/A</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Performance */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Multi-Period Returns & Technical Signals
            </h4>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  1 Month Return
                  <MetricDefinition text="Price change over the last 30 days, showing short-term momentum." />
                </p>
                <p
                  className={`text-xl font-bold ${
                    data.advanced_metrics.technical.returns_1m &&
                    data.advanced_metrics.technical.returns_1m >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {data.advanced_metrics.technical.returns_1m
                    ? `${(data.advanced_metrics.technical.returns_1m * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  3 Month Return
                  <MetricDefinition text="Price change over the last 3 months, indicating quarterly momentum." />
                </p>
                <p
                  className={`text-xl font-bold ${
                    data.advanced_metrics.technical.returns_3m &&
                    data.advanced_metrics.technical.returns_3m >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {data.advanced_metrics.technical.returns_3m
                    ? `${(data.advanced_metrics.technical.returns_3m * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  6 Month Return
                  <MetricDefinition text="Price change over the last 6 months, showing medium-term performance." />
                </p>
                <p
                  className={`text-xl font-bold ${
                    data.advanced_metrics.technical.returns_6m &&
                    data.advanced_metrics.technical.returns_6m >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {data.advanced_metrics.technical.returns_6m
                    ? `${(data.advanced_metrics.technical.returns_6m * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  1 Year Return
                  <MetricDefinition text="Price change over the last 12 months, a key measure of annual performance." />
                </p>
                <p
                  className={`text-xl font-bold ${
                    data.advanced_metrics.technical.returns_1y &&
                    data.advanced_metrics.technical.returns_1y >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {data.advanced_metrics.technical.returns_1y
                    ? `${(data.advanced_metrics.technical.returns_1y * 100).toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Price vs SMA 50
                  <MetricDefinition text="Current price relative to the 50-day Simple Moving Average. Positive means trading above the short-term average." />
                </p>
                {data.advanced_metrics.technical.price_vs_sma_50 != null ? (
                  <p
                    className={`text-xl font-bold ${
                      data.advanced_metrics.technical.price_vs_sma_50 >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {(data.advanced_metrics.technical.price_vs_sma_50 * 100).toFixed(2)}%
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Price vs SMA 200
                  <MetricDefinition text="Current price relative to the 200-day Simple Moving Average. Positive means trading above the long-term trend line." />
                </p>
                {data.advanced_metrics.technical.price_vs_sma_200 != null ? (
                  <p
                    className={`text-xl font-bold ${
                      data.advanced_metrics.technical.price_vs_sma_200 >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {(data.advanced_metrics.technical.price_vs_sma_200 * 100).toFixed(2)}%
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Golden Cross Detected
                  <MetricDefinition text="When the 50-day MA crosses above the 200-day MA, historically considered a bullish signal." />
                </p>
                <p
                  className={`text-xl font-bold ${
                    data.advanced_metrics.technical.golden_cross_detected
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  {data.advanced_metrics.technical.golden_cross_detected ? '✓ Yes' : '✗ No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Death Cross Detected
                  <MetricDefinition text="When the 50-day MA crosses below the 200-day MA, historically considered a bearish signal." />
                </p>
                <p
                  className={`text-xl font-bold ${
                    data.advanced_metrics.technical.death_cross_detected
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`}
                >
                  {data.advanced_metrics.technical.death_cross_detected ? '⚠ Yes' : '✗ No'}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                Pivot Points
                <MetricDefinition text="Support and resistance levels calculated from recent price action using the Fibonacci-based formula." />
              </h5>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resistance 1</p>
                  <p className="text-xl font-bold text-gray-900">
                    {data.advanced_metrics.technical.pivot_resistance_1 != null
                      ? `$${data.advanced_metrics.technical.pivot_resistance_1.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resistance 2</p>
                  <p className="text-xl font-bold text-gray-900">
                    {data.advanced_metrics.technical.pivot_resistance_2 != null
                      ? `$${data.advanced_metrics.technical.pivot_resistance_2.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Support 1</p>
                  <p className="text-xl font-bold text-gray-900">
                    {data.advanced_metrics.technical.pivot_support_1 != null
                      ? `$${data.advanced_metrics.technical.pivot_support_1.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Support 2</p>
                  <p className="text-xl font-bold text-gray-900">
                    {data.advanced_metrics.technical.pivot_support_2 != null
                      ? `$${data.advanced_metrics.technical.pivot_support_2.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Volume Analysis</h5>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    50-Day Average Volume
                    <MetricDefinition text="The average number of shares traded per day over the last 50 trading sessions." />
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {data.advanced_metrics.technical.volume_avg_50d != null
                      ? data.advanced_metrics.technical.volume_avg_50d.toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Volume Trend
                    <MetricDefinition text="Comparison of recent 20-day average volume vs prior 20-day average. Shows if trading activity is increasing or decreasing." />
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      data.advanced_metrics.technical.volume_trend === 'increasing'
                        ? 'text-green-600'
                        : data.advanced_metrics.technical.volume_trend === 'decreasing'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {data.advanced_metrics.technical.volume_trend}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seasonal & Cyclical Patterns */}
          {data.advanced_metrics.seasonal && (
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Seasonal & Cyclical Patterns
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                Average return for each period, calculated across all years in the 10-year dataset
                <MetricDefinition text="These show the historical AVERAGE return for each calendar period (e.g., January, Q1, Monday) computed across all occurrences in the available 10-year dataset. This reveals if a stock tends to perform better/worse during specific times." />
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">
                    Monthly Returns (Avg across all years)
                  </h5>
                  {data.advanced_metrics.seasonal.monthly_returns && (
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(data.advanced_metrics.seasonal.monthly_returns).map(
                        ([month, ret]) => {
                          const monthNum = parseInt(month.replace('month_', ''));
                          const monthNames = [
                            '',
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                          ];
                          return (
                            <div
                              key={month}
                              className={`border rounded-lg p-3 text-center ${
                                ret >= 0
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-red-200 bg-red-50'
                              }`}
                            >
                              <p className="text-xs text-gray-600">{monthNames[monthNum]}</p>
                              <p
                                className={`text-lg font-bold ${
                                  ret >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {(ret * 100).toFixed(1)}%
                              </p>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">
                    Quarterly Returns (Avg across all years)
                  </h5>
                  {data.advanced_metrics.seasonal.quarterly_returns && (
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(data.advanced_metrics.seasonal.quarterly_returns).map(
                        ([quarter, ret]) => (
                          <div
                            key={quarter}
                            className={`border rounded-lg p-3 text-center ${
                              ret >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <p className="text-xs text-gray-600">{quarter.toUpperCase()}</p>
                            <p
                              className={`text-lg font-bold ${
                                ret >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {(ret * 100).toFixed(1)}%
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">
                  Day of Week Effect (Avg across all years)
                </h5>
                {data.advanced_metrics.seasonal.day_of_week_effect && (
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(data.advanced_metrics.seasonal.day_of_week_effect).map(
                      ([day, ret]) => (
                        <div
                          key={day}
                          className={`border rounded-lg p-4 text-center ${
                            ret >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <p className="text-xs text-gray-600">{day}</p>
                          <p
                            className={`text-lg font-bold ${
                              ret >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {(ret * 100).toFixed(2)}%
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Outlook - Moved to bottom */}
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
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {data.ai_outlook.bull_case}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 bg-red-50">
                  <h4 className="font-semibold text-gray-900 mb-3">Bear Case</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {data.ai_outlook.bear_case}
                  </p>
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
        </div>
      )}

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
