export interface PortfolioEntry {
  id: string;
  ticker: string;
  company_name: string;
  purchase_date: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  annualized_return: number;
  annualized_return_percentage: number;
  status: "active" | "sold";
}

export interface PortfolioSummary {
  total_investment: number;
  total_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  holdings_count: number;
  annualized_return: number;
  annualized_return_percentage: number;
  benchmarks: Array<{
    id: string;
    name: string;
    ticker: string;
    description: string;
  }>;
  last_updated: string;
}

export interface PortfolioPerformance {
  total_cost: number;
  current_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  annualized_return: number;
  annualized_return_percentage: number;
  benchmark_comparison: Record<string, number>;
  benchmark_monetary_comparison: Record<string, number>;
  holdings: Array<{
    ticker: string;
    company_name: string;
    quantity: number;
    purchase_price: number;
    current_price: number;
    cost_basis: number;
    current_value: number;
    profit_loss: number;
    profit_loss_percentage: number;
    annualized_return: number;
    annualized_return_percentage: number;
  }>;
}

export interface AddPortfolioRequest {
  ticker: string;
  purchase_date: string;
  quantity: number;
  purchase_price: number;
}

export interface SellPortfolioRequest {
  id: string;
  sell_date: string;
  sell_price: number;
}