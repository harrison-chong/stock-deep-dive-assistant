export interface AnalysisData {
  ticker: string;
  company_name: string;
  sector: string | null;
  industry: string | null;
  current_price: number;
  market_cap: number | null;
  snapshot_summary: string;
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
}

export interface MetricsCardProps {
  title: string;
  metrics: {
    name: string;
    value: number | null;
    interpretation?: string | null;
  }[];
  showInterpretation?: boolean;
}
