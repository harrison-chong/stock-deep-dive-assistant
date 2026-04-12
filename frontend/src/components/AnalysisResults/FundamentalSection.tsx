import { MetricsCard } from '../MetricsCard';
import { AnalysisData } from '../../types/analysis';
import {
  profitabilityDefinitions,
  liquidityValuationDefinitions,
  valuationDefinitions,
  marginsDefinitions,
  financialStrengthDefinitions,
  growthDefinitions,
  earningsDefinitions,
  marketDataDefinitions,
  analystDefinitions,
  financialHealthDefinitions,
  shortInterestDefinitions,
  ownershipDefinitions,
  performanceDefinitions,
} from '../../constants/metrics';

interface FundamentalSectionProps {
  data: Pick<
    AnalysisData,
    | 'fundamental_overview'
    | 'market_cap'
    | 'beta'
    | 'dividend_rate'
    | 'forward_dividend_yield'
    | 'earnings_timestamp'
    | 'target_mean_price'
    | 'target_median_price'
    | 'number_of_analyst_opinions'
    | 'recommendation_mean'
    | 'target_high_price'
    | 'target_low_price'
    | 'fifty_day_average'
    | 'two_hundred_day_average'
    | 'ebitda'
    | 'total_cash'
    | 'total_debt'
    | 'current_ratio'
    | 'quick_ratio'
    | 'payout_ratio'
    | 'total_cash_per_share'
    | 'operating_cash_flow'
    | 'free_cash_flow'
    | 'shares_short'
    | 'short_ratio'
    | 'short_percent_of_float'
    | 'float_shares'
    | 'trailing_annual_dividend_rate'
    | 'trailing_annual_dividend_yield'
    | 'five_year_avg_dividend_yield'
    | 'shares_outstanding'
    | 'revenue_per_share'
    | 'held_percent_insiders'
    | 'held_percent_institutions'
    | 'fifty_two_week_change'
    | 's_and_p_fifty_two_week_change'
    | 'all_time_high'
    | 'all_time_low'
  >;
}

export function FundamentalSection({ data }: FundamentalSectionProps) {
  const {
    fundamental_overview,
    market_cap,
    beta,
    dividend_rate,
    forward_dividend_yield,
    earnings_timestamp,
    target_mean_price,
    target_median_price,
    number_of_analyst_opinions,
    recommendation_mean,
    target_high_price,
    target_low_price,
    fifty_day_average,
    two_hundred_day_average,
    ebitda,
    total_cash,
    total_debt,
    current_ratio,
    quick_ratio,
    payout_ratio,
    total_cash_per_share,
    operating_cash_flow,
    free_cash_flow,
    shares_short,
    short_ratio,
    short_percent_of_float,
    float_shares,
    trailing_annual_dividend_rate,
    trailing_annual_dividend_yield,
    five_year_avg_dividend_yield,
    shares_outstanding,
    revenue_per_share,
    held_percent_insiders,
    held_percent_institutions,
    fifty_two_week_change,
    s_and_p_fifty_two_week_change,
    all_time_high,
    all_time_low,
  } = data;

  return (
    <div className="space-y-6">
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        <MetricsCard
          title="Profitability"
          metrics={fundamental_overview.profitability}
          showInterpretation={true}
          metricDefinitions={profitabilityDefinitions}
          source="yahoo"
        />
        <MetricsCard
          title="Liquidity & Valuation"
          metrics={[
            { name: 'Market Cap', value: market_cap },
            ...fundamental_overview.liquidity_valuation,
          ]}
          showInterpretation={true}
          metricDefinitions={{
            'Market Cap':
              'Total market value of all shares (price × shares outstanding). Shows company size. Large caps >$10B, mid caps $2-10B, small caps <$2B.',
            ...liquidityValuationDefinitions,
          }}
          source="yahoo"
        />
      </div>
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-2 xl:auto-fit gap-5"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <MetricsCard
          title="Valuation"
          metrics={fundamental_overview.valuation}
          showInterpretation={true}
          metricDefinitions={valuationDefinitions}
          source="yahoo"
        />
        <MetricsCard
          title="Margins"
          metrics={fundamental_overview.margins}
          showInterpretation={true}
          metricDefinitions={marginsDefinitions}
          source="yahoo"
        />
      </div>
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-2 xl:auto-fit gap-5"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <MetricsCard
          title="Financial Strength"
          metrics={[...fundamental_overview.financial_strength, ...fundamental_overview.growth]}
          showInterpretation={true}
          metricDefinitions={{
            ...financialStrengthDefinitions,
            ...growthDefinitions,
          }}
          source="yahoo"
        />
        <MetricsCard
          title="Earnings"
          metrics={fundamental_overview.earnings}
          showInterpretation={true}
          metricDefinitions={earningsDefinitions}
          source="yahoo"
        />
      </div>
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-2 xl:auto-fit gap-5"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <MetricsCard
          title="Market Data"
          metrics={[
            ...fundamental_overview.market_data,
            { name: 'Beta', value: beta },
            { name: 'Forward Dividend', value: dividend_rate, unit: '$' },
            { name: 'Fwd Div Yield', value: forward_dividend_yield, unit: '%' },
            { name: 'Earnings Date', value: earnings_timestamp },
          ]}
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
            { name: '1Y Target (Mean)', value: target_mean_price, unit: '$' },
            { name: '1Y Target (Median)', value: target_median_price, unit: '$' },
            { name: 'Analyst Opinions', value: number_of_analyst_opinions },
            { name: 'Rec. Mean', value: recommendation_mean },
            { name: 'Target High', value: target_high_price, unit: '$' },
            { name: 'Target Low', value: target_low_price, unit: '$' },
            { name: '50D Avg', value: fifty_day_average, unit: '$' },
            { name: '200D Avg', value: two_hundred_day_average, unit: '$' },
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
          source="yahoo"
        />
      </div>
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-2 xl:auto-fit gap-5"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <MetricsCard
          title="Financial Health"
          metrics={[
            { name: 'EBITDA', value: ebitda },
            { name: 'Total Cash', value: total_cash },
            { name: 'Total Debt', value: total_debt },
            { name: 'Current Ratio', value: current_ratio },
            { name: 'Quick Ratio', value: quick_ratio },
            { name: 'Payout Ratio', value: payout_ratio, unit: '%' },
            { name: 'Cash/Share', value: total_cash_per_share, unit: '$' },
            { name: 'Operating Cash Flow', value: operating_cash_flow },
            { name: 'Free Cash Flow', value: free_cash_flow },
          ]}
          showInterpretation={true}
          metricDefinitions={financialHealthDefinitions}
          source="yahoo"
        />
        <MetricsCard
          title="Short Interest & Dividends"
          metrics={[
            { name: 'Shares Short', value: shares_short },
            { name: 'Short Ratio', value: short_ratio },
            { name: 'Short % of Float', value: short_percent_of_float, unit: '%' },
            { name: 'Float Shares', value: float_shares, unit: 'shares' },
            {
              name: 'Trailing Ann. Div. Rate',
              value: trailing_annual_dividend_rate,
              unit: '$',
            },
            {
              name: 'Trailing Ann. Div. Yield',
              value: trailing_annual_dividend_yield,
              unit: '%',
            },
            { name: '5Y Avg Div. Yield', value: five_year_avg_dividend_yield, unit: '%' },
          ]}
          showInterpretation={true}
          metricDefinitions={shortInterestDefinitions}
          source="yahoo"
        />
      </div>
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-2 xl:auto-fit gap-5"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <MetricsCard
          title="Ownership & Structure"
          metrics={[
            { name: 'Shares Outstanding', value: shares_outstanding, unit: 'shares' },
            { name: 'Revenue/Share', value: revenue_per_share, unit: '$' },
            { name: 'Insider Ownership', value: held_percent_insiders, unit: '%' },
            { name: 'Institutional Ownership', value: held_percent_institutions, unit: '%' },
          ]}
          showInterpretation={true}
          metricDefinitions={ownershipDefinitions}
          source="yahoo"
        />
        <MetricsCard
          title="Price Performance"
          metrics={[
            { name: '52W Change', value: fifty_two_week_change, unit: '%' },
            { name: 'S&P 52W Change', value: s_and_p_fifty_two_week_change, unit: '%' },
            { name: 'All-Time High', value: all_time_high, unit: '$' },
            { name: 'All-Time Low', value: all_time_low, unit: '$' },
          ]}
          showInterpretation={true}
          metricDefinitions={performanceDefinitions}
          source="yahoo"
        />
      </div>
    </div>
  );
}
