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
    <div className="space-y-8">
      {/* Statistical & Risk-Adjusted Returns */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="mb-4 flex items-center gap-2">
          <h4 className="text-lg font-semibold text-gray-900">
            Statistical & Risk-Adjusted Returns
          </h4>
          <span
            title="Calculated from historical price data (not from Yahoo Finance)"
            className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded cursor-help"
          >
            Calc
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Trailing total returns as of {formatDate(data.data_end_date)} · Based on{' '}
          {getYears(data.data_start_date, data.data_end_date)} years of data
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Total Return
              <MetricDefinition
                text={`Cumulative return over the full available data period (shown as %). Based on data from ${formatDate(data.data_start_date)} to ${formatDate(data.data_end_date)}.`}
              />
            </p>
            <p className={`text-xl font-bold ${getGainLossColor(statistical.total_return ?? 0)}`}>
              {statistical.total_return != null
                ? `${(statistical.total_return * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Annualized Return
              <MetricDefinition text="Compound Annual Growth Rate (CAGR). Average return per year, compounded. Allows comparison across different time periods." />
            </p>
            <p
              className={`text-xl font-bold ${getGainLossColor(statistical.annualized_return ?? 0)}`}
            >
              {statistical.annualized_return != null
                ? `${(statistical.annualized_return * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Volatility (Annualized)
              <MetricDefinition text="Standard deviation of daily returns annualized. Measures price fluctuation intensity. Higher = riskier." />
            </p>
            <p className="text-xl font-bold text-gray-900">
              {statistical.annualized_volatility != null
                ? `${(statistical.annualized_volatility * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Sharpe Ratio
              <MetricDefinition text="Risk-adjusted return: (Return - Risk-Free) / Volatility. Higher = better risk-adjusted performance. >1 = good, >2 = excellent." />
            </p>
            <p className="text-xl font-bold text-gray-900">
              {statistical.sharpe_ratio != null ? statistical.sharpe_ratio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Sortino Ratio
              <MetricDefinition text="Like Sharpe but only counts downside volatility. Higher = better. Only penalizes bad volatility, not all volatility." />
            </p>
            <p className="text-xl font-bold text-gray-900">
              {statistical.sortino_ratio != null ? statistical.sortino_ratio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Calmar Ratio
              <MetricDefinition text="Annualized return / Max drawdown. Higher = better return per unit of worst-case loss. >1 = good, >3 = excellent." />
            </p>
            <p className="text-xl font-bold text-gray-900">
              {statistical.calmar_ratio != null ? statistical.calmar_ratio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Max Drawdown
              <MetricDefinition text="Maximum peak-to-trough decline (shown as %). Worst-case loss if bought at the worst time. Lower = better risk control." />
            </p>
            <p className="text-xl font-bold text-red-600">
              {statistical.max_drawdown != null
                ? `${(statistical.max_drawdown * 100).toFixed(2)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Value at Risk (95%, 1-day)
              <MetricDefinition text="Maximum expected daily loss at 95% confidence (shown as %, e.g., -2% means on 95% of days losses won't exceed 2% of portfolio value)." />
            </p>
            <p className="text-xl font-bold text-gray-900">
              {statistical.var_95 != null ? `${(statistical.var_95 * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Ulcer Index
              <MetricDefinition text="Measures pain of drawdowns (in % terms). Higher = more severe/longer drawdowns historically. &lt;5 = mild, 5-10 = moderate, &gt;10 = severe volatility stress." />
            </p>
            <p className="text-xl font-bold text-gray-900">
              {statistical.ulcer_index != null ? statistical.ulcer_index.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Recovery Days
              <MetricDefinition text="Number of trading days required to recover from the maximum drawdown. -1 indicates the position never fully recovered." />
            </p>
            <p className="text-xl font-bold text-gray-900">
              {statistical.recovery_days != null ? `${statistical.recovery_days} days` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Skewness
              <MetricDefinition text="Measures return distribution asymmetry. Positive (&gt;0.5) means more extreme gains; negative (&lt;-0.5) means more extreme losses." />
            </p>
            {statistical.skewness != null ? (
              <>
                <p className="text-xl font-bold text-gray-900">{statistical.skewness.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statistical.skewness > 0.5
                    ? 'Positively skewed'
                    : statistical.skewness < -0.5
                      ? 'Negatively skewed'
                      : 'Symmetric'}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-gray-400">N/A</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Kurtosis (Excess)
              <MetricDefinition text="Measures tail heaviness. &gt;3 means fat tails (more extreme events than normal); &lt;3 means lighter tails. Normal distribution = 3." />
            </p>
            {statistical.kurtosis != null ? (
              <>
                <p className="text-xl font-bold text-gray-900">{statistical.kurtosis.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statistical.kurtosis > 3
                    ? 'Fat tails (leptokurtic)'
                    : statistical.kurtosis < 3
                      ? 'Thin tails (platykurtic)'
                      : 'Normal tails'}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-gray-400">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* Technical Performance */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="mb-4 flex items-center gap-2">
          <h4 className="text-lg font-semibold text-gray-900">Trailing Total Returns</h4>
          <span
            title="Calculated from historical price data (not from Yahoo Finance)"
            className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded cursor-help"
          >
            Calc
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              1 Month
              <MetricDefinition text="Total return over the last 1 month." />
            </p>
            <p className={`text-xl font-bold ${getGainLossColor(technical.returns_1m ?? 0)}`}>
              {technical.returns_1m != null ? `${(technical.returns_1m * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              3 Months
              <MetricDefinition text="Total return over the last 3 months." />
            </p>
            <p className={`text-xl font-bold ${getGainLossColor(technical.returns_3m ?? 0)}`}>
              {technical.returns_3m != null ? `${(technical.returns_3m * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              6 Months
              <MetricDefinition text="Total return over the last 6 months." />
            </p>
            <p className={`text-xl font-bold ${getGainLossColor(technical.returns_6m ?? 0)}`}>
              {technical.returns_6m != null ? `${(technical.returns_6m * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              1 Year
              <MetricDefinition text="Total return over the last 1 year." />
            </p>
            <p className={`text-xl font-bold ${getGainLossColor(technical.returns_1y ?? 0)}`}>
              {technical.returns_1y != null ? `${(technical.returns_1y * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Price vs SMA 50
              <MetricDefinition text="Current price relative to the 50-day Simple Moving Average. Positive means trading above the short-term trend line." />
            </p>
            {technical.price_vs_sma_50 != null ? (
              <p
                className={`text-xl font-bold ${
                  technical.price_vs_sma_50 >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {(technical.price_vs_sma_50 * 100).toFixed(2)}%
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
            {technical.price_vs_sma_200 != null ? (
              <p
                className={`text-xl font-bold ${
                  technical.price_vs_sma_200 >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {(technical.price_vs_sma_200 * 100).toFixed(2)}%
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
                technical.golden_cross_detected ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {technical.golden_cross_detected ? '✓ Yes' : '✗ No'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Death Cross Detected
              <MetricDefinition text="When the 50-day MA crosses below the 200-day MA, historically considered a bearish signal." />
            </p>
            <p
              className={`text-xl font-bold ${
                technical.death_cross_detected ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              {technical.death_cross_detected ? '⚠ Yes' : '✗ No'}
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Volume Analysis</h5>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                50-Day Average Volume
                <MetricDefinition text="Average shares traded per day over 50 sessions (e.g., 5.2M = 5.2 million shares/day). Higher = more liquid/easier to buy/sell." />
              </p>
              <p className="text-xl font-bold text-gray-900">
                {technical.volume_avg_50d != null
                  ? technical.volume_avg_50d.toLocaleString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Volume Trend
                <MetricDefinition text="Recent 20-day avg vs prior 20-day avg. 'Increasing' = more interest (bullish). 'Decreasing' = less interest (could be bearish)." />
              </p>
              <p
                className={`text-xl font-bold ${
                  technical.volume_trend === 'increasing'
                    ? 'text-green-600'
                    : technical.volume_trend === 'decreasing'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {technical.volume_trend}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal & Cyclical Patterns */}
      {seasonal && seasonal.monthly_returns && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">Seasonal & Cyclical Patterns</h4>
            <span
              title="Calculated from historical price data (not from Yahoo Finance)"
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded cursor-help"
            >
              Calc
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Based on data from {formatDate(data.data_start_date)} to{' '}
            {formatDate(data.data_end_date)} (using max period for accuracy)
            <MetricDefinition text="These show the historical AVERAGE return for each calendar period (e.g., January, Q1, Monday) computed across all occurrences in the available dataset (up to 5 years). This reveals if a stock tends to perform better/worse during specific times." />
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                Monthly Returns (Avg across {getYears(data.data_start_date, data.data_end_date)}{' '}
                years)
              </h5>
              <div className="grid grid-cols-3 gap-3">
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
                      className={`border rounded-lg p-3 text-center ${
                        ret >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <p className="text-xs text-gray-600">{monthNames[monthNum]}</p>
                      <p className={`text-lg font-bold ${getGainLossColor(ret)}`}>
                        {(ret * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                Quarterly Returns (Avg across all years)
              </h5>
              {seasonal.quarterly_returns && (
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(seasonal.quarterly_returns).map(([quarter, ret]) => (
                    <div
                      key={quarter}
                      className={`border rounded-lg p-3 text-center ${
                        ret >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <p className="text-xs text-gray-600">{quarter.toUpperCase()}</p>
                      <p className={`text-lg font-bold ${getGainLossColor(ret)}`}>
                        {(ret * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {seasonal.day_of_week_effect && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                Day of Week Effect (Avg across all years)
              </h5>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(seasonal.day_of_week_effect).map(([day, ret]) => (
                  <div
                    key={day}
                    className={`border rounded-lg p-4 text-center ${
                      ret >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <p className="text-xs text-gray-600">{day}</p>
                    <p className={`text-lg font-bold ${getGainLossColor(ret)}`}>
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
