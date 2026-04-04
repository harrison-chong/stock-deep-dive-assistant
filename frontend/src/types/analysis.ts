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
  chart_data: { date: string; close: number }[];
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
    confidence_score: number;
  };
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
  // Raw yfinance info dict for maximum data exposure
  extra_info: Record<string, unknown>;
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
      triangle_pattern: boolean;
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
}
