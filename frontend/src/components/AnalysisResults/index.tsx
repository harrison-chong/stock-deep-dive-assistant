import { AnalysisData } from '../../types/analysis';
import { MetricsCard } from '../MetricsCard';
import { PriceChart } from '../PriceChart';
import { MetricDefinition } from '../shared/MetricDefinition';
import { AlertCircle } from 'lucide-react';

interface AnalysisResultsProps {
  data: AnalysisData;
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  // Metric definitions for Technical Overview
  const movingAverageDefinitions: Record<string, string> = {
    'SMA 20':
      'Simple Moving Average over the last 20 trading days (in price units, e.g., $150.00). Short-term trend indicator. Above 20 SMA = short-term bullish.',
    'SMA 50':
      'Simple Moving Average over the last 50 trading days (in price units). Medium-term trend indicator. Widely used by institutions.',
    'SMA 100':
      'Simple Moving Average over the last 100 trading days (in price units). Medium-long term trend indicator.',
    'SMA 200':
      'Simple Moving Average over the last 200 trading days (in price units). Long-term trend indicator. Price above 200 SMA = long-term bullish.',
  };

  const momentumDefinitions: Record<string, string> = {
    'RSI 14':
      'Relative Strength Index over 14 periods (scale 0-100). >70 = overbought (possible pullback), <30 = oversold (possible bounce). Below 50 = bearish, above 50 = bullish.',
    MACD: 'Moving Average Convergence Divergence (in price units, e.g., +2.50 means short-term MA is $2.50 above long-term MA). Positive MACD = bullish momentum.',
  };

  const volatilityDefinitions: Record<string, string> = {
    'ATR 14':
      'Average True Range over 14 periods (in price units, e.g., $3.59 means the stock moves ~$3.59 per day on average). Higher ATR = more volatile stock.',
    'Volatility 30D':
      '30-day annualized volatility (shown as percentage, e.g., 17% means the stock has historically fluctuated 17% annually). Higher = more volatile.',
    'Volatility 90D': '90-day annualized volatility (shown as percentage). Higher = more volatile.',
  };

  // Metric definitions for Fundamental Overview
  const profitabilityDefinitions: Record<string, string> = {
    ROE: 'Return on Equity (shown as %). Net income / Shareholder Equity. Measures efficiency at generating profits from shareholder money. >15% = good, >20% = excellent.',
    'Profit Margin':
      'Net profit / Revenue (shown as %). Percentage of revenue that becomes profit. Higher is better, but banking ~15-20% is solid, tech can be 20%+.',
  };

  const valuationDefinitions: Record<string, string> = {
    'P/E Ratio':
      'Price / Earnings per share (ratio, e.g., 20x means you pay $20 for $1 of earnings). Lower may = undervalued, higher may = overvalued. Varies by industry.',
    'Forward P/E':
      'Price / Expected future EPS (ratio). Uses analyst estimates for next 12 months. Lower = potentially cheaper vs future earnings.',
    'PEG Ratio':
      'P/E / Growth Rate (ratio). <1 may indicate undervalued, 1-2 = fairly valued, >2 may indicate overvalued. Growth is annual %.',
  };

  const financialStrengthDefinitions: Record<string, string> = {
    'Debt-to-Equity':
      'Total Debt / Total Equity (ratio, e.g., 0.5 means 50 cents debt per $1 equity). <1 is generally conservative, >2 may indicate high leverage.',
    'Dividend Yield':
      "Annual Dividends / Stock Price (shown as %). Income return from dividends. 2-5% is typical. Higher isn't always better - check sustainability.",
  };

  const growthDefinitions: Record<string, string> = {
    'Revenue Growth':
      "Year-over-year % change in total revenue. >10% = strong growth. Varies by company stage (startups may grow faster but aren't profitable).",
  };

  const marketDataDefinitions: Record<string, string> = {
    'Previous Close': 'Closing price from previous trading day (in price units, e.g., $150.00).',
    'Day High': 'Highest trading price today (in price units).',
    'Day Low': 'Lowest trading price today (in price units).',
    Bid: 'Highest price a buyer will pay to purchase this stock (in price units). Higher bid = more buying interest.',
    Ask: 'Lowest price a seller will accept to sell this stock (in price units). Lower ask = more selling pressure.',
    Volume: 'Shares traded today (e.g., 5.2M = 5.2 million shares). Higher = more liquid.',
    'Avg Volume': 'Average shares traded per day over recent period. 50-day average shown.',
    '52W High':
      'Highest price over past 52 weeks (in price units). Price near this = near peak valuation.',
    '52W Low':
      'Lowest price over past 52 weeks (in price units). Price near this = near minimum valuation.',
  };

  const liquidityValuationDefinitions: Record<string, string> = {
    'Enterprise Value':
      'Market Cap + Debt - Cash (in billions, e.g., $50B). What it would cost to buy the whole company.',
    'Price/Book':
      'Stock price / Book value per share (ratio, e.g., 3x). <1 may = undervalued, >3 may = overvalued. Common for banks.',
    'Price/Sales':
      'Stock price / Revenue per share (ratio). Varies by industry; lower generally better. SaaS companies often trade at 10-20x.',
    'EV/EBITDA':
      'Enterprise Value / EBITDA (ratio). <10 generally considered good/cheap, >15 may be expensive.',
    'Trailing PEG': 'P/E ratio / Expected earnings growth (ratio). <1 may indicate undervalued.',
  };

  const earningsDefinitions: Record<string, string> = {
    'Forward EPS':
      'Expected EPS over next 12 months (in dollars, e.g., $5.00). Analyst consensus estimates.',
    'Book Value':
      'Total assets - Total liabilities per share (in dollars). Represents intrinsic value.',
    'Book/Share': 'Book value per share (in dollars, same as above).',
    'Earnings Growth': 'Year-over-year % change in earnings. Positive = growing profits.',
    'Quarterly Growth': 'Quarter-over-quarter % change in earnings. Shows momentum.',
  };

  const marginsDefinitions: Record<string, string> = {
    'Return on Assets':
      'Net income / Total assets (shown as %). Efficiency at using assets. >5% = good.',
    'Return on Investment':
      'Net income / Total investments (shown as %). Similar to ROE but for all capital.',
    'Gross Margins':
      '(Revenue - COGS) / Revenue (shown as %). Profitability before operating costs. >40% = strong, <20% = low margin industry.',
    'Operating Margins':
      'Operating income / Revenue (shown as %). Profitability from core ops. 15-20% = healthy.',
  };

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
            {data.data_start_date && data.data_end_date && (
              <p className="text-xs text-gray-500 mt-1">
                Data period: {new Date(data.data_start_date).toLocaleDateString()} -{' '}
                {new Date(data.data_end_date).toLocaleDateString()}
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

      {/* Price Chart */}
      <PriceChart
        ticker={data.ticker}
        currentPrice={data.current_price}
        chartData={data.chart_data}
      />

      {/* Technical Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <MetricsCard
          title="Moving Averages"
          metrics={data.technical_overview.moving_averages}
          metricDefinitions={movingAverageDefinitions}
        />
        <MetricsCard
          title="Momentum"
          metrics={data.technical_overview.momentum}
          metricDefinitions={momentumDefinitions}
        />
        <MetricsCard
          title="Volatility"
          metrics={data.technical_overview.volatility || []}
          metricDefinitions={volatilityDefinitions}
        />
      </div>

      {/* Fundamental Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricsCard
          title="Profitability"
          metrics={data.fundamental_overview.profitability}
          showInterpretation={true}
          metricDefinitions={profitabilityDefinitions}
        />
        <MetricsCard
          title="Valuation"
          metrics={data.fundamental_overview.valuation}
          showInterpretation={true}
          metricDefinitions={valuationDefinitions}
        />
        <MetricsCard
          title="Financial Strength"
          metrics={data.fundamental_overview.financial_strength}
          showInterpretation={true}
          metricDefinitions={financialStrengthDefinitions}
        />
        <MetricsCard
          title="Growth"
          metrics={data.fundamental_overview.growth}
          showInterpretation={true}
          metricDefinitions={growthDefinitions}
        />
        <MetricsCard
          title="Market Data"
          metrics={data.fundamental_overview.market_data}
          showInterpretation={true}
          metricDefinitions={marketDataDefinitions}
        />
        <MetricsCard
          title="Liquidity & Valuation"
          metrics={data.fundamental_overview.liquidity_valuation}
          showInterpretation={true}
          metricDefinitions={liquidityValuationDefinitions}
        />
        <MetricsCard
          title="Earnings"
          metrics={data.fundamental_overview.earnings}
          showInterpretation={true}
          metricDefinitions={earningsDefinitions}
        />
        <MetricsCard
          title="Margins"
          metrics={data.fundamental_overview.margins}
          showInterpretation={true}
          metricDefinitions={marginsDefinitions}
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
                  <MetricDefinition
                    text={`Cumulative return over the full available data period (shown as %). Based on data from ${data.data_start_date ? new Date(data.data_start_date).toLocaleDateString() : '?'} to ${data.data_end_date ? new Date(data.data_end_date).toLocaleDateString() : '?'}.`}
                  />
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
                  <MetricDefinition text="Compound Annual Growth Rate (shown as %). The mean annual return if you held the stock over the data period, with profits reinvested annually." />
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
                  <MetricDefinition text="Standard deviation of daily returns annualized (shown as %). Market average is ~15-20%. Above 30% = high volatility/high risk. Below 15% = low volatility." />
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
                  <MetricDefinition text="Annualized return / Maximum drawdown (ratio). Return per unit of worst-case loss. >1 = favorable, >2 = excellent, <0.5 = high risk relative to returns." />
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
                  <MetricDefinition text="Largest peak-to-trough decline (shown as %, e.g., -25% means portfolio dropped 25% at worst point). Indicates worst losses historically." />
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
                  <MetricDefinition text="Maximum expected daily loss at 95% confidence (shown as %, e.g., -2% means on 95% of days losses won't exceed 2% of portfolio value)." />
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
                  <MetricDefinition text="Measures pain of drawdowns (in % terms). Higher = more severe/longer drawdowns historically. <5 = mild, 5-10 = moderate, >10 = severe volatility stress." />
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
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Volume Analysis</h5>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    50-Day Average Volume
                    <MetricDefinition text="Average shares traded per day over 50 sessions (e.g., 5.2M = 5.2 million shares/day). Higher = more liquid/easier to buy/sell." />
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
                    <MetricDefinition text="Recent 20-day avg vs prior 20-day avg. 'Increasing' = more interest (bullish). 'Decreasing' = less interest (could be bearish)." />
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
                Average return for each period, calculated across all years in the available dataset
                (max 5 years)
                <MetricDefinition text="These show the historical AVERAGE return for each calendar period (e.g., January, Q1, Monday) computed across all occurrences in the available dataset (up to 5 years). This reveals if a stock tends to perform better/worse during specific times." />
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
