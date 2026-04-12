export interface AnalysisData {
  ticker: string;
  company_name: string;
  sector: string | null;
  industry: string | null;
  current_price: number;
  currency: string | null;
  market_cap: number | null;
  data_start_date: string | null;
  data_end_date: string | null;
  chart_data: {
    date: string;
    close: number;
    sma20?: number | null;
    sma50?: number | null;
    sma200?: number | null;
  }[];
  technical_overview: {
    moving_averages: { name: string; value: number | null }[];
    momentum: { name: string; value: number | null }[];
    volatility: { name: string; value: number | null }[] | undefined;
  };
  fundamental_overview: {
    profitability: {
      name: string;
      value: number | null;
      interpretation: string | null;
    }[];
    valuation: {
      name: string;
      value: number | null;
      interpretation: string | null;
    }[];
    financial_strength: {
      name: string;
      value: number | null;
      interpretation: string | null;
    }[];
    growth: {
      name: string;
      value: number | null;
      interpretation: string | null;
    }[];
    market_data: {
      name: string;
      value: number | null;
      unit?: string;
    }[];
    liquidity_valuation: {
      name: string;
      value: number | null;
      unit?: string;
    }[];
    earnings: {
      name: string;
      value: number | null;
      unit?: string;
    }[];
    margins: {
      name: string;
      value: number | null;
      unit?: string;
    }[];
  };
  ai_outlook: {
    overall_summary: string;
    bull_case: string;
    bear_case: string;
    risk_factors: string[];
    neutral_scenario: string;
    recommendation: string;
    recommendation_rationale: string;
  } | null;
  timestamp: string;
  // Additional company information from yfinance
  website: string | null;
  description: string | null;
  full_time_employees: number | null;
  country: string | null;
  state: string | null;
  city: string | null;
  phone: string | null;
  fax: string | null;
  // Additional Yahoo Finance fields
  regular_market_change: number | null;
  regular_market_change_percent: number | null;
  beta: number | null;
  earnings_timestamp: number | null;
  target_mean_price: number | null;
  target_median_price: number | null;
  dividend_rate: number | null;
  forward_dividend_yield: number | null;
  // Additional yfinance fields - Financial Health
  ebitda: number | null;
  total_cash: number | null;
  total_debt: number | null;
  total_cash_per_share: number | null;
  current_ratio: number | null;
  quick_ratio: number | null;
  payout_ratio: number | null;
  free_cash_flow: number | null;
  operating_cash_flow: number | null;
  // Share structure
  shares_outstanding: number | null;
  revenue_per_share: number | null;
  // Ownership
  held_percent_insiders: number | null;
  held_percent_institutions: number | null;
  // Analyst data
  number_of_analyst_opinions: number | null;
  recommendation_key: string | null;
  recommendation_mean: number | null;
  average_analyst_rating: string | null;
  target_high_price: number | null;
  target_low_price: number | null;
  // Moving averages (from yfinance)
  fifty_day_average: number | null;
  two_hundred_day_average: number | null;
  // Short interest
  shares_short: number | null;
  short_ratio: number | null;
  short_percent_of_float: number | null;
  float_shares: number | null;
  // 52-week and all-time performance
  fifty_two_week_change: number | null;
  s_and_p_fifty_two_week_change: number | null;
  all_time_high: number | null;
  all_time_low: number | null;
  // Dividend details
  trailing_annual_dividend_rate: number | null;
  trailing_annual_dividend_yield: number | null;
  five_year_avg_dividend_yield: number | null;
  // Advanced metrics calculated from available OHLC data (max period="max")
  advanced_metrics: {
    statistical: {
      total_return: number | null;
      annualized_return: number | null;
      annualized_volatility: number | null;
      sharpe_ratio: number | null;
      sortino_ratio: number | null;
      max_drawdown: number | null;
      cagr: number | null;
      calmar_ratio: number | null;
      var_95: number | null;
      skewness: number | null;
      kurtosis: number | null;
      ulcer_index: number | null;
      recovery_days: number | null;
      beta: number | null;
      alpha: number | null;
      r_squared: number | null;
    };
    technical: {
      returns_1m: number | null;
      returns_3m: number | null;
      returns_6m: number | null;
      returns_1y: number | null;
      returns_3y: number | null;
      returns_5y: number | null;
      returns_10y: number | null;
      cagr_2y: number | null;
      cagr_3y: number | null;
      cagr_5y: number | null;
      golden_cross_detected: boolean;
      death_cross_detected: boolean;
      price_vs_sma_50: number | null;
      price_vs_sma_200: number | null;
      pivot_resistance_1: number | null;
      pivot_resistance_2: number | null;
      pivot_support_1: number | null;
      pivot_support_2: number | null;
      volume_avg_50d: number | null;
      volume_trend: string | null; // "increasing", "decreasing", "stable", "insufficient_data"
    };
    patterns?: {
      head_and_shoulders: boolean;
      inverted_head_and_shoulders: boolean;
      double_top: boolean;
      double_bottom: boolean;
      triangle_pattern: string | null;
      flag_pattern: boolean;
      cup_and_handle: boolean;
      adx: number | null;
      gap_up_detected: boolean;
      gap_down_detected: boolean;
      support_break: boolean;
      resistance_break: boolean;
    } | null;
    seasonal?: {
      monthly_returns: Record<string, number> | null; // e.g., { month_1: 0.012, month_2: -0.005, ... }
      quarterly_returns: Record<string, number> | null; // e.g., { q1: 0.03, q2: -0.01, ... }
      day_of_week_effect: Record<string, number> | null; // e.g., { Monday: 0.001, Tuesday: -0.002, ... }
      earnings_season_impact: number | null;
    } | null;
  };
}

export interface MetricsCardProps {
  title: string;
  metrics: {
    name: string;
    value: number | null;
    interpretation?: string | null;
    unit?: string;
  }[];
  showInterpretation?: boolean;
  metricDefinitions?: Record<string, string>;
  /** Data source for the badge. 'yahoo' = sourced from Yahoo Finance, 'calc' = calculated from price data. */
  source?: 'yahoo' | 'calc';
}
