import { AnalysisData } from '../../types/analysis';
import { MetricsCard } from '../MetricsCard';
import { PriceChart } from '../PriceChart';
import { MetricDefinition } from '../shared/MetricDefinition';
import { AlertCircle } from 'lucide-react';

interface AnalysisResultsProps {
  data: AnalysisData;
  period: string;
  onPeriodChange: (period: string) => void;
  loadingAI?: boolean;
  errorAI?: string;
  onGenerateAI?: () => void;
}

export function AnalysisResults({
  data,
  period,
  onPeriodChange,
  loadingAI = false,
  errorAI,
  onGenerateAI,
}: AnalysisResultsProps) {
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
    'P/E Ratio (TTM)':
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
    'EPS (TTM)':
      'Earnings Per Share Trailing Twelve Months (in dollars, e.g., $2.50). Actual reported earnings over the last 12 months.',
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

  const financialHealthDefinitions: Record<string, string> = {
    EBITDA:
      'Earnings Before Interest, Taxes, Depreciation & Amortization (in billions). Shows operating cash flow. Higher = more profitable core business.',
    'Total Cash': 'Total cash on hand (in billions). Buffer for emergencies or acquisitions.',
    'Total Debt': 'Total debt outstanding (in billions). Higher debt = more financial risk.',
    'Current Ratio':
      'Current Assets / Current Liabilities. >1.5 = healthy liquidity, <1 = may struggle to pay bills.',
    'Quick Ratio':
      '(Current Assets - Inventory) / Current Liabilities. Strict liquidity measure without relying on inventory.',
    'Payout Ratio':
      'Dividends paid / Earnings (shown as %). High (>80%) may be unsustainable. Low (<30%) suggests room to increase dividends.',
    'Cash/Share':
      'Total cash divided by shares outstanding (in dollars). Cash per share indicates financial flexibility.',
    'Operating Cash Flow':
      'Cash generated from core business operations (in billions). Includes all operating expenses but NOT capital expenditures.',
    'Free Cash Flow':
      'Operating Cash Flow minus Capital Expenditures (in billions). What remains after investing in assets. Higher = more value generated for shareholders.',
  };

  const marketDataDefinitions: Record<string, string> = {
    'Previous Close':
      "Most recent closing price before today (in dollars). Yesterday's final market price.",
    'Day High': 'Highest price traded during the current trading session (in dollars).',
    'Day Low': 'Lowest price traded during the current trading session (in dollars).',
    Bid: 'Highest price a buyer is willing to pay for shares right now (in dollars).',
    Ask: 'Lowest price a seller is willing to accept for shares right now (in dollars).',
    Volume:
      'Total shares traded today (e.g., 5.2M = 5.2 million shares). Higher volume = more liquid.',
    'Avg Volume': 'Average daily volume over recent sessions. Shows typical trading activity.',
    '52W High': 'Highest price in the past 52 weeks (in dollars).',
    '52W Low': 'Lowest price in the past 52 weeks (in dollars).',
  };

  const analystDefinitions: Record<string, string> = {
    'Analyst Opinions':
      'Number of Wall Street analysts covering this stock. More opinions = more coverage.',
    Recommendation: 'Wall Street consensus: Strong Buy, Buy, Hold, Underperform, Sell.',
    'Rec. Mean':
      'Average analyst rating (1=Strong Buy, 2=Buy, 3=Hold, 4=Underperform, 5=Sell). Lower = more bullish.',
    'Avg Analyst Rating': 'Human-readable analyst consensus (e.g., "1.9 - Buy").',
    'Target High':
      'Highest price target from analysts (in dollars). Upside potential if targets are met.',
    'Target Low':
      'Lowest price target from analysts (in dollars). Downside risk if targets are missed.',
    '50D Avg':
      '50-day moving average price. Short-term trend line. Price above = short-term bullish.',
    '200D Avg':
      '200-day moving average price. Long-term trend line. Price above = long-term bullish.',
  };

  const shortInterestDefinitions: Record<string, string> = {
    'Shares Short':
      'Number of shares currently sold short (e.g., 229M = 229 million shares). High short interest = bearish bets against stock.',
    'Short Ratio':
      'Days to cover short positions (shares short / avg daily volume). Higher = harder to close shorts, potential squeeze.',
    'Short % of Float':
      'Percentage of float shares that are shorted. High % = significant bearish sentiment, risk of short squeeze.',
    'Float Shares':
      'Shares available for public trading (in millions). Excludes insider/restricted shares.',
    'Trailing Ann. Div. Rate':
      'Sum of dividends paid over the past 12 months (in $/share). Actual dividends received.',
    'Trailing Ann. Div. Yield':
      'Trailing 12-month dividends / current price (in %). Actual dividend return received (NVDA: 0.04/177.39 = 0.023%).',
    '5Y Avg Div. Yield':
      '5-year average dividend yield (in %). Useful for comparing current yield to historical yield.',
  };

  const performanceDefinitions: Record<string, string> = {
    '52W Change': 'Percentage price change over the past 52 weeks. Positive = price appreciation.',
    'S&P 52W Change':
      'S&P 500 index percentage change over the same 52-week period. Compare stock performance vs market.',
    'All-Time High':
      'Highest price this stock has ever traded at (historical). Current price is X% below ATH.',
    'All-Time Low':
      'Lowest price this stock has ever traded at (historical). Current price is X% above ATL.',
  };

  const ownershipDefinitions: Record<string, string> = {
    'Shares Outstanding':
      'Total shares currently in existence (in millions). Used to calculate market cap.',
    'Revenue/Share':
      'Total revenue / shares outstanding (in dollars). Higher = more efficient at generating revenue.',
    'Insider Ownership':
      'Percentage of shares held by company insiders (executives, directors). High = insiders confident.',
    'Institutional Ownership':
      'Percentage of shares held by funds/pension plans. High = professional confidence.',
  };

  return (
    <div className="space-y-8">
      {/* Company Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{data.company_name}</h2>
              <span className="text-sm text-gray-500">{data.ticker}</span>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              {data.sector && (
                <div>
                  <span className="font-medium text-gray-600">Sector:</span> {data.sector}
                </div>
              )}
              {data.industry && (
                <div>
                  <span className="font-medium text-gray-600">Industry:</span> {data.industry}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-2">
              <p className="text-3xl font-bold text-gray-900">{data.current_price.toFixed(2)}</p>
              {data.currency && <p className="text-base text-gray-600">{data.currency}</p>}
            </div>
            {data.regular_market_change !== null && data.regular_market_change !== undefined && (
              <p
                className={`text-sm font-medium ${data.regular_market_change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {data.regular_market_change >= 0 ? '+' : ''}
                {data.regular_market_change.toFixed(2)} (
                {data.regular_market_change_percent !== null &&
                data.regular_market_change_percent !== undefined
                  ? `${data.regular_market_change_percent >= 0 ? '+' : ''}${data.regular_market_change_percent.toFixed(2)}%`
                  : 'N/A'}
                ) Today
              </p>
            )}
            {data.market_cap && (
              <p className="text-sm text-gray-600">
                Market Cap: ${(data.market_cap / 1e9).toFixed(1)}B
              </p>
            )}
            {data.data_start_date && data.data_end_date && (
              <p className="text-xs text-gray-500">
                Data: {new Date(data.data_start_date).toLocaleDateString()} -{' '}
                {new Date(data.data_end_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Data Source Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">Y! Finance</span>
          <span>Sourced from Yahoo Finance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Calc</span>
          <span>Calculated from historical price data</span>
        </div>
      </div>

      {/* Price Chart */}

      <PriceChart
        ticker={data.ticker}
        currentPrice={data.current_price}
        chartData={data.chart_data}
        period={period}
        onPeriodChange={onPeriodChange}
      />

      {/* Technical Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <MetricsCard
          title="Moving Averages"
          metrics={data.technical_overview.moving_averages}
          metricDefinitions={movingAverageDefinitions}
          source="calculated"
        />
        <MetricsCard
          title="Momentum"
          metrics={data.technical_overview.momentum}
          metricDefinitions={momentumDefinitions}
          source="calculated"
        />
        <MetricsCard
          title="Volatility"
          metrics={data.technical_overview.volatility || []}
          metricDefinitions={volatilityDefinitions}
          source="calculated"
        />
      </div>

      {/* Fundamental Overview */}
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <MetricsCard
            title="Profitability"
            metrics={data.fundamental_overview.profitability}
            showInterpretation={true}
            metricDefinitions={profitabilityDefinitions}
          />
          <MetricsCard
            title="Liquidity & Valuation"
            metrics={[
              { name: 'Market Cap', value: data.market_cap },
              ...data.fundamental_overview.liquidity_valuation,
            ]}
            showInterpretation={true}
            metricDefinitions={{
              'Market Cap':
                'Total market value of all shares (price × shares outstanding). Shows company size. Large caps >$10B, mid caps $2-10B, small caps <$2B.',
              ...liquidityValuationDefinitions,
            }}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <MetricsCard
            title="Valuation"
            metrics={data.fundamental_overview.valuation}
            showInterpretation={true}
            metricDefinitions={valuationDefinitions}
          />
          <MetricsCard
            title="Margins"
            metrics={data.fundamental_overview.margins}
            showInterpretation={true}
            metricDefinitions={marginsDefinitions}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <MetricsCard
            title="Financial Strength"
            metrics={[
              ...data.fundamental_overview.financial_strength,
              ...data.fundamental_overview.growth,
            ]}
            showInterpretation={true}
            metricDefinitions={{
              ...financialStrengthDefinitions,
              ...growthDefinitions,
            }}
          />
          <MetricsCard
            title="Earnings"
            metrics={data.fundamental_overview.earnings}
            showInterpretation={true}
            metricDefinitions={earningsDefinitions}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <MetricsCard
            title="Market Data"
            metrics={[
              ...data.fundamental_overview.market_data,
              { name: 'Beta', value: data.beta },
              { name: 'Forward Dividend', value: data.dividend_rate, unit: '$' },
              { name: 'Fwd Div Yield', value: data.forward_dividend_yield, unit: '%' },
              { name: 'Earnings Date', value: data.earnings_timestamp },
            ]}
            showInterpretation={false}
            metricDefinitions={{
              ...marketDataDefinitions,
              Beta: 'Measure of stock volatility vs the market. >1 = more volatile than market, <1 = less volatile.',
              'Forward Dividend':
                'Annual dividend rate in dollars per share. This is the projected annual dividend based on recent payouts (e.g., $0.04 means $0.01 per quarter = $0.04/year).',
              'Fwd Div Yield':
                'Forward dividend yield as percentage of current price. Annual dividend / stock price.',
              'Earnings Date':
                'Upcoming date when the company will report earnings. Stock may be more volatile around this time.',
            }}
            source="yahoo"
          />
          <MetricsCard
            title="Analyst Ratings"
            metrics={[
              { name: '1Y Target (Mean)', value: data.target_mean_price, unit: '$' },
              { name: '1Y Target (Median)', value: data.target_median_price, unit: '$' },
              { name: 'Analyst Opinions', value: data.number_of_analyst_opinions },
              { name: 'Rec. Mean', value: data.recommendation_mean },
              { name: 'Target High', value: data.target_high_price, unit: '$' },
              { name: 'Target Low', value: data.target_low_price, unit: '$' },
              { name: '50D Avg', value: data.fifty_day_average, unit: '$' },
              { name: '200D Avg', value: data.two_hundred_day_average, unit: '$' },
            ]}
            showInterpretation={true}
            metricDefinitions={{
              '1Y Target (Mean)':
                'Analyst consensus 1-year price target (in dollars). Where analysts expect the stock to go. Not guaranteed.',
              '1Y Target (Median)':
                'Median of analyst 1-year price targets. Less influenced by outliers than the mean.',
              'Analyst Opinions':
                'Number of analysts who have published research on this stock. More analysts = more coverage.',
              'Rec. Mean':
                'Analyst recommendation mean (1=Strong Buy, 2=Buy, 3=Hold, 4=Underperform, 5=Sell). Lower is better.',
              'Target High':
                'Highest analyst 1-year price target. Represents the most optimistic analyst outlook.',
              'Target Low':
                'Lowest analyst 1-year price target. Represents the most pessimistic analyst outlook.',
              '50D Avg': '50-day moving average price. Short-term trend indicator.',
              '200D Avg': '200-day moving average price. Long-term trend indicator.',
              ...analystDefinitions,
            }}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <MetricsCard
            title="Financial Health"
            metrics={[
              { name: 'EBITDA', value: data.ebitda },
              { name: 'Total Cash', value: data.total_cash },
              { name: 'Total Debt', value: data.total_debt },
              { name: 'Current Ratio', value: data.current_ratio },
              { name: 'Quick Ratio', value: data.quick_ratio },
              { name: 'Payout Ratio', value: data.payout_ratio, unit: '%' },
              { name: 'Cash/Share', value: data.total_cash_per_share, unit: '$' },
              { name: 'Operating Cash Flow', value: data.operating_cash_flow },
              { name: 'Free Cash Flow', value: data.free_cash_flow },
            ]}
            showInterpretation={true}
            metricDefinitions={financialHealthDefinitions}
          />
          <MetricsCard
            title="Short Interest & Dividends"
            metrics={[
              { name: 'Shares Short', value: data.shares_short },
              { name: 'Short Ratio', value: data.short_ratio },
              { name: 'Short % of Float', value: data.short_percent_of_float, unit: '%' },
              { name: 'Float Shares', value: data.float_shares, unit: 'shares' },
              {
                name: 'Trailing Ann. Div. Rate',
                value: data.trailing_annual_dividend_rate,
                unit: '$',
              },
              {
                name: 'Trailing Ann. Div. Yield',
                value: data.trailing_annual_dividend_yield,
                unit: '%',
              },
              { name: '5Y Avg Div. Yield', value: data.five_year_avg_dividend_yield, unit: '%' },
            ]}
            showInterpretation={true}
            metricDefinitions={shortInterestDefinitions}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <MetricsCard
            title="Ownership & Structure"
            metrics={[
              { name: 'Shares Outstanding', value: data.shares_outstanding, unit: 'shares' },
              { name: 'Revenue/Share', value: data.revenue_per_share, unit: '$' },
              { name: 'Insider Ownership', value: data.held_percent_insiders, unit: '%' },
              { name: 'Institutional Ownership', value: data.held_percent_institutions, unit: '%' },
            ]}
            showInterpretation={true}
            metricDefinitions={ownershipDefinitions}
          />
          <MetricsCard
            title="Price Performance"
            metrics={[
              { name: '52W Change', value: data.fifty_two_week_change, unit: '%' },
              { name: 'S&P 52W Change', value: data.s_and_p_fifty_two_week_change, unit: '%' },
              { name: 'All-Time High', value: data.all_time_high, unit: '$' },
              { name: 'All-Time Low', value: data.all_time_low, unit: '$' },
            ]}
            showInterpretation={true}
            metricDefinitions={performanceDefinitions}
          />
        </div>
      </div>

      {/* Advanced Metrics - Statistical & Risk-Adjusted Returns */}
      {data.advanced_metrics && (
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
              Trailing total returns as of{' '}
              {data.data_end_date
                ? new Date(data.data_end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'latest'}{' '}
              · Based on{' '}
              {data.data_start_date && data.data_end_date
                ? `${Math.round((new Date(data.data_end_date).getTime() - new Date(data.data_start_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} years`
                : 'selected'}{' '}
              of data
            </p>
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
            <div className="mb-4 flex items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-900">Trailing Total Returns</h4>
              <span
                title="Calculated from historical price data (not from Yahoo Finance)"
                className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded cursor-help"
              >
                Calc
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              As of{' '}
              {data.data_end_date
                ? new Date(data.data_end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'latest'}{' '}
              · Price returns including dividends
            </p>
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
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  Seasonal & Cyclical Patterns
                </h4>
                <span
                  title="Calculated from historical price data (not from Yahoo Finance)"
                  className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded cursor-help"
                >
                  Calc
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Based on data from{' '}
                {data.data_start_date
                  ? new Date(data.data_start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '?'}{' '}
                to{' '}
                {data.data_end_date
                  ? new Date(data.data_end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '?'}{' '}
                (using max period for accuracy)
                <MetricDefinition text="These show the historical AVERAGE return for each calendar period (e.g., January, Q1, Monday) computed across all occurrences in the available dataset (up to 5 years). This reveals if a stock tends to perform better/worse during specific times." />
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">
                    Monthly Returns (Avg across{' '}
                    {data.data_start_date && data.data_end_date
                      ? Math.round(
                          (new Date(data.data_end_date).getTime() -
                            new Date(data.data_start_date).getTime()) /
                            (1000 * 60 * 60 * 24 * 365),
                        )
                      : '?'}{' '}
                    years)
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

          {/* AI Outlook - On-demand loading */}
          {data.ai_outlook === null ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600 mb-6">
                Get AI-powered insights including bull/bear cases, risk factors, and recommendation
              </p>
              <button
                onClick={onGenerateAI}
                disabled={loadingAI}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingAI ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Generating...
                  </span>
                ) : (
                  'Generate AI Analysis'
                )}
              </button>
              {errorAI && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{errorAI}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
                    <p className="text-sm text-gray-500">
                      {data.ticker} · {data.company_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{data.ai_outlook.overall_summary}</p>
              </div>

              {/* Recommendation Banner */}
              <div
                className={`mb-6 p-4 rounded-lg border-2 ${
                  data.ai_outlook.recommendation === 'Consider'
                    ? 'bg-green-50 border-green-200'
                    : data.ai_outlook.recommendation === 'Avoid'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      data.ai_outlook.recommendation === 'Consider'
                        ? 'bg-green-100'
                        : data.ai_outlook.recommendation === 'Avoid'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                    }`}
                  >
                    <span
                      className={`text-xl font-bold ${
                        data.ai_outlook.recommendation === 'Consider'
                          ? 'text-green-600'
                          : data.ai_outlook.recommendation === 'Avoid'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }`}
                    >
                      {data.ai_outlook.recommendation.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      AI Recommendation
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        data.ai_outlook.recommendation === 'Consider'
                          ? 'text-green-700'
                          : data.ai_outlook.recommendation === 'Avoid'
                            ? 'text-red-700'
                            : 'text-yellow-700'
                      }`}
                    >
                      {data.ai_outlook.recommendation}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Rationale</p>
                    <p className="text-sm text-gray-700">
                      {data.ai_outlook.recommendation_rationale}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bull/Bear Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-green-800">Bull Case</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {data.ai_outlook.bull_case}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-red-50 to-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-red-800">Bear Case</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {data.ai_outlook.bear_case}
                  </p>
                </div>
              </div>

              {/* Risk Factors & Neutral Side by Side */}
              <div className="grid md:grid-cols-2 gap-6">
                {data.ai_outlook.risk_factors.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900">Risk Factors</h4>
                    </div>
                    <ul className="space-y-2">
                      {data.ai_outlook.risk_factors.map((risk, i) => (
                        <li key={i} className="text-gray-700 text-sm flex gap-2">
                          <span className="text-orange-400 mt-0.5">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900">Neutral Scenario</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {data.ai_outlook.neutral_scenario}
                  </p>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                <span>
                  Data:{' '}
                  {data.data_start_date ? new Date(data.data_start_date).toLocaleDateString() : '?'}{' '}
                  - {data.data_end_date ? new Date(data.data_end_date).toLocaleDateString() : '?'}
                </span>
                {data.sector && (
                  <span>
                    {data.sector} {data.industry ? `· ${data.industry}` : ''}
                  </span>
                )}
              </div>
            </div>
          )}
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
