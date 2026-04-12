import { MetricDefinition } from '../shared/MetricDefinition';
import { getGainLossColor } from '../../utils/formatting';
import { AIOutlookCard } from './AIOutlookCard';
import { AnalysisData } from '../../types/analysis';

interface AdvancedMetricsSectionProps {
  data: AnalysisData;
  loadingAI?: boolean;
  errorAI?: string;
  onGenerateAI?: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '?';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getYears(start?: string | null, end?: string | null) {
  if (!start || !end) return '?';
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 365),
  );
}

export function AdvancedMetricsSection({
  data,
  loadingAI,
  errorAI,
  onGenerateAI,
}: AdvancedMetricsSectionProps) {
  if (!data.advanced_metrics) return null;

  const { statistical, technical, seasonal } = data.advanced_metrics;

  return (
    <div className="space-y-5">
      {/* Statistical & Risk-Adjusted Returns */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in transition-all duration-300">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
              Statistical & Risk Metrics
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-900/30 rounded-full">
              Calculated
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getYears(data.data_start_date, data.data_end_date)} years of data · as of{' '}
            {formatDate(data.data_end_date)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-7">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Total Return
              <MetricDefinition
                text={`Cumulative return over the full available data period (shown as %). Based on data from ${formatDate(data.data_start_date)} to ${formatDate(data.data_end_date)}.`}
              />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(statistical.total_return ?? 0)}`}
            >
              {statistical.total_return != null
                ? `${(statistical.total_return * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Annualized Return
              <MetricDefinition text="Compound Annual Growth Rate (CAGR). Average return per year, compounded. Allows comparison across different time periods." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(statistical.annualized_return ?? 0)}`}
            >
              {statistical.annualized_return != null
                ? `${(statistical.annualized_return * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Annualized Volatility
              <MetricDefinition text="Standard deviation of daily returns annualized. Measures price fluctuation intensity. Higher = riskier." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {statistical.annualized_volatility != null
                ? `${(statistical.annualized_volatility * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Sharpe Ratio
              <MetricDefinition text="Risk-adjusted return: (Return - Risk-Free) / Volatility. Higher = better risk-adjusted performance. >1 = good, >2 = excellent." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {statistical.sharpe_ratio != null ? statistical.sharpe_ratio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Sortino Ratio
              <MetricDefinition text="Like Sharpe but only counts downside volatility. Higher = better. Only penalizes bad volatility, not all volatility." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {statistical.sortino_ratio != null ? statistical.sortino_ratio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Calmar Ratio
              <MetricDefinition text="Annualized return / Max drawdown. Higher = better return per unit of worst-case loss. >1 = good, >3 = excellent." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {statistical.calmar_ratio != null ? statistical.calmar_ratio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Max Drawdown
              <MetricDefinition text="Maximum peak-to-trough decline (shown as %). Worst-case loss if bought at the worst time. Lower = better risk control." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-red-500 dark:text-red-400">
              {statistical.max_drawdown != null
                ? `${(statistical.max_drawdown * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Value at Risk (95%)
              <MetricDefinition text="Maximum expected daily loss at 95% confidence (shown as %, e.g., -2% means on 95% of days losses won't exceed 2% of portfolio value)." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {statistical.var_95 != null ? `${(statistical.var_95 * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Ulcer Index
              <MetricDefinition text="Measures pain of drawdowns (in % terms). Higher = more severe/longer drawdowns historically. &lt;5 = mild, 5-10 = moderate, &gt;10 = severe volatility stress." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {statistical.ulcer_index != null ? statistical.ulcer_index.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Recovery Days
              <MetricDefinition text="Number of trading days required to recover from the maximum drawdown. -1 indicates the position never fully recovered." />
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {statistical.recovery_days != null ? `${statistical.recovery_days}d` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Skewness
              <MetricDefinition text="Measures return distribution asymmetry. Positive (&gt;0.5) means more extreme gains; negative (&lt;-0.5) means more extreme losses." />
            </p>
            {statistical.skewness != null ? (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {statistical.skewness.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {statistical.skewness > 0.5
                    ? 'Positive'
                    : statistical.skewness < -0.5
                      ? 'Negative'
                      : 'Symmetric'}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-semibold tracking-tight text-gray-400">N/A</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              Kurtosis
              <MetricDefinition text="Measures tail heaviness. &gt;3 means fat tails (more extreme events than normal); &lt;3 means lighter tails. Normal distribution = 3." />
            </p>
            {statistical.kurtosis != null ? (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {statistical.kurtosis.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {statistical.kurtosis > 3
                    ? 'Fat tails'
                    : statistical.kurtosis < 3
                      ? 'Thin tails'
                      : 'Normal'}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-semibold tracking-tight text-gray-400">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* Technical Performance */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in transition-all duration-300">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
              Trailing Returns
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-900/30 rounded-full">
              Calculated
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-7">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              1 Month
              <MetricDefinition text="Total return over the last 1 month." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.returns_1m ?? 0)}`}
            >
              {technical.returns_1m != null ? `${(technical.returns_1m * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              3 Months
              <MetricDefinition text="Total return over the last 3 months." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.returns_3m ?? 0)}`}
            >
              {technical.returns_3m != null ? `${(technical.returns_3m * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              6 Months
              <MetricDefinition text="Total return over the last 6 months." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.returns_6m ?? 0)}`}
            >
              {technical.returns_6m != null ? `${(technical.returns_6m * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              1 Year
              <MetricDefinition text="Total return over the last 1 year." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.returns_1y ?? 0)}`}
            >
              {technical.returns_1y != null ? `${(technical.returns_1y * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              3 Years
              <MetricDefinition text="Total return over the last 3 years." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.returns_3y ?? 0)}`}
            >
              {technical.returns_3y != null ? `${(technical.returns_3y * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              5 Years
              <MetricDefinition text="Total return over the last 5 years." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.returns_5y ?? 0)}`}
            >
              {technical.returns_5y != null ? `${(technical.returns_5y * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              vs SMA 50
              <MetricDefinition text="Current price relative to the 50-day Simple Moving Average. Positive means trading above the short-term trend line." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.price_vs_sma_50 ?? 0)}`}
            >
              {technical.price_vs_sma_50 != null
                ? `${(technical.price_vs_sma_50 * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              vs SMA 200
              <MetricDefinition text="Current price relative to the 200-day Simple Moving Average. Positive means trading above the long-term trend line." />
            </p>
            <p
              className={`text-2xl font-semibold tracking-tight ${getGainLossColor(technical.price_vs_sma_200 ?? 0)}`}
            >
              {technical.price_vs_sma_200 != null
                ? `${(technical.price_vs_sma_200 * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Golden Cross</p>
            <p
              className={`text-2xl font-semibold tracking-tight ${technical.golden_cross_detected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`}
            >
              {technical.golden_cross_detected ? '✓' : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Death Cross</p>
            <p
              className={`text-2xl font-semibold tracking-tight ${technical.death_cross_detected ? 'text-red-500 dark:text-red-400' : 'text-gray-300 dark:text-gray-600'}`}
            >
              {technical.death_cross_detected ? '⚠' : '—'}
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase text-xs">
            CAGR (Compound Annual Growth Rate)
          </h5>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                2Y CAGR
                <MetricDefinition text="Compound Annual Growth Rate over 2 years." />
              </p>
              <p
                className={`text-xl font-semibold tracking-tight ${getGainLossColor(technical.cagr_2y ?? 0)}`}
              >
                {technical.cagr_2y != null ? `${(technical.cagr_2y * 100).toFixed(2)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                3Y CAGR
                <MetricDefinition text="Compound Annual Growth Rate over 3 years." />
              </p>
              <p
                className={`text-xl font-semibold tracking-tight ${getGainLossColor(technical.cagr_3y ?? 0)}`}
              >
                {technical.cagr_3y != null ? `${(technical.cagr_3y * 100).toFixed(2)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                5Y CAGR
                <MetricDefinition text="Compound Annual Growth Rate over 5 years." />
              </p>
              <p
                className={`text-xl font-semibold tracking-tight ${getGainLossColor(technical.cagr_5y ?? 0)}`}
              >
                {technical.cagr_5y != null ? `${(technical.cagr_5y * 100).toFixed(2)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase text-xs">
            Pivot Points
          </h5>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                Resistance 1
                <MetricDefinition text="First resistance level based on Fibonacci retracement (38.2%)." />
              </p>
              <p className="text-xl font-semibold tracking-tight text-red-500 dark:text-red-400">
                {technical.pivot_resistance_1 != null
                  ? `$${technical.pivot_resistance_1.toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                Resistance 2
                <MetricDefinition text="Second resistance level based on Fibonacci retracement (61.8%)." />
              </p>
              <p className="text-xl font-semibold tracking-tight text-red-400 dark:text-red-500">
                {technical.pivot_resistance_2 != null
                  ? `$${technical.pivot_resistance_2.toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                Support 1
                <MetricDefinition text="First support level based on Fibonacci retracement (38.2%)." />
              </p>
              <p className="text-xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                {technical.pivot_support_1 != null
                  ? `$${technical.pivot_support_1.toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                Support 2
                <MetricDefinition text="Second support level based on Fibonacci retracement (61.8%)." />
              </p>
              <p className="text-xl font-semibold tracking-tight text-emerald-500 dark:text-emerald-300">
                {technical.pivot_support_2 != null
                  ? `$${technical.pivot_support_2.toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase text-xs">
            Volume Analysis
          </h5>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                50-Day Avg Volume
                <MetricDefinition text="Average shares traded per day over 50 sessions. Higher = more liquid." />
              </p>
              <p className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {technical.volume_avg_50d != null
                  ? technical.volume_avg_50d.toLocaleString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                Volume Trend
                <MetricDefinition text="'Increasing' = more interest. 'Decreasing' = less interest." />
              </p>
              <p
                className={`text-xl font-semibold tracking-tight ${
                  technical.volume_trend === 'increasing'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : technical.volume_trend === 'decreasing'
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {technical.volume_trend === 'increasing'
                  ? '↑ Increasing'
                  : technical.volume_trend === 'decreasing'
                    ? '↓ Decreasing'
                    : '→ Stable'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Signals */}
      {data.advanced_metrics.patterns && (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in transition-all duration-300">
          <div className="mb-6 flex items-center gap-2">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
              Pattern Signals
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-900/30 rounded-full">
              Calculated
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                Trend Strength (ADX)
                <MetricDefinition text="Average Directional Index. Measures trend strength: <20 = weak (no trend), 20-40 = moderate, >40 = strong trend. Higher = more directional movement." />
              </p>
              {data.advanced_metrics.patterns.adx != null ? (
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {data.advanced_metrics.patterns.adx.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {data.advanced_metrics.patterns.adx < 20
                      ? 'Weak'
                      : data.advanced_metrics.patterns.adx < 40
                        ? 'Moderate'
                        : 'Strong'}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-semibold tracking-tight text-gray-400">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Gap Up</p>
              <p
                className={`text-2xl font-semibold tracking-tight ${
                  data.advanced_metrics.patterns.gap_up_detected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                {data.advanced_metrics.patterns.gap_up_detected ? '↑' : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Gap Down</p>
              <p
                className={`text-2xl font-semibold tracking-tight ${
                  data.advanced_metrics.patterns.gap_down_detected
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                {data.advanced_metrics.patterns.gap_down_detected ? '↓' : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                Trend Direction
                <MetricDefinition text="Based on ADX. Shows if stock is in strong uptrend, moderate uptrend, weak/range-bound, or downtrend." />
              </p>
              {data.advanced_metrics.patterns.adx != null ? (
                <p
                  className={`text-xl font-semibold tracking-tight ${
                    data.advanced_metrics.patterns.adx >= 40
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : data.advanced_metrics.patterns.adx >= 25
                        ? 'text-blue-600 dark:text-blue-400'
                        : data.advanced_metrics.patterns.adx >= 20
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {data.advanced_metrics.patterns.adx >= 40
                    ? 'Strong ↑'
                    : data.advanced_metrics.patterns.adx >= 25
                      ? 'Uptrend'
                      : data.advanced_metrics.patterns.adx >= 20
                        ? 'Weak →'
                        : 'Range'}
                </p>
              ) : (
                <p className="text-xl font-semibold tracking-tight text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seasonal & Cyclical Patterns */}
      {seasonal && seasonal.monthly_returns && (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                Seasonal & Cyclical Patterns
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-900/30 rounded-full">
                Calculated
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getYears(data.data_start_date, data.data_end_date)} years of data
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">
                Monthly Returns (Avg)
              </h5>
              <div className="grid grid-cols-3 gap-2.5">
                {Object.entries(seasonal.monthly_returns).map(([month, ret]) => {
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
                      className={`rounded-xl p-3 text-center transition-all duration-200 hover:scale-105 ${
                        ret >= 0
                          ? 'bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30'
                          : 'bg-red-50/60 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30'
                      }`}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {monthNames[monthNum]}
                      </p>
                      <p className={`text-base font-semibold ${getGainLossColor(ret)}`}>
                        {(ret * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">
                Quarterly Returns (Avg)
              </h5>
              {seasonal.quarterly_returns && (
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.entries(seasonal.quarterly_returns).map(([quarter, ret]) => (
                    <div
                      key={quarter}
                      className={`rounded-xl p-3 text-center transition-all duration-200 hover:scale-105 ${
                        ret >= 0
                          ? 'bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30'
                          : 'bg-red-50/60 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30'
                      }`}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {quarter.toUpperCase()}
                      </p>
                      <p className={`text-base font-semibold ${getGainLossColor(ret)}`}>
                        {(ret * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {seasonal.day_of_week_effect && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">
                Day of Week Effect
              </h5>
              <div className="grid grid-cols-5 gap-2.5">
                {Object.entries(seasonal.day_of_week_effect).map(([day, ret]) => (
                  <div
                    key={day}
                    className={`rounded-xl p-3 text-center transition-all duration-200 hover:scale-105 ${
                      ret >= 0
                        ? 'bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30'
                        : 'bg-red-50/60 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30'
                    }`}
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{day}</p>
                    <p className={`text-base font-semibold ${getGainLossColor(ret)}`}>
                      {(ret * 100).toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Outlook */}
      <AIOutlookCard
        data={data}
        loadingAI={loadingAI ?? false}
        errorAI={errorAI}
        onGenerateAI={onGenerateAI}
      />
    </div>
  );
}
