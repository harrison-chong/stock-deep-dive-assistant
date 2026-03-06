"""
Stock Deep Dive Assistant - Domain Types
"""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class OHLCData:
    """Open, High, Low, Close price data"""

    timestamp: list[datetime]
    open: list[float]
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[int]


@dataclass
class CompanyInfo:
    """Basic company information"""

    ticker: str
    name: str
    sector: str | None
    industry: str | None
    website: str | None
    description: str | None
    currency: str | None


@dataclass
class FundamentalData:
    """Company fundamental metrics"""

    ticker: str
    market_cap: float | None
    pe_ratio: float | None
    forward_pe: float | None
    eps: float | None
    revenue: float | None
    revenue_growth: float | None
    roe: float | None
    debt_to_equity: float | None
    free_cash_flow: float | None
    dividend_yield: float | None
    profit_margin: float | None
    peg_ratio: float | None
    industry: str | None
    sector: str | None


@dataclass
class TechnicalIndicators:
    """Complete set of technical indicators"""

    sma_20: float | None
    sma_50: float | None
    sma_100: float | None
    sma_200: float | None
    ema_12: float | None
    ema_26: float | None
    rsi_14: float | None
    macd: float | None
    macd_signal: float | None
    bollinger_upper: float | None
    bollinger_middle: float | None
    bollinger_lower: float | None
    atr_14: float | None
    volatility_30d: float | None
    volatility_90d: float | None


@dataclass
class AIInterpretation:
    """AI-generated insight about a stock"""

    overall_summary: str
    bull_case: str
    bear_case: str
    risk_factors: list[str]
    neutral_scenario: str
    recommendation: str
    recommendation_rationale: str
    confidence_score: float


@dataclass
class PortfolioEntry:
    """Individual stock holding in portfolio"""

    id: str
    ticker: str
    company_name: str
    purchase_date: datetime
    quantity: float
    purchase_price: float
    sold: bool = False
    sell_date: datetime | None = None
    sell_price: float | None = None


@dataclass
class PortfolioBenchmark:
    """Benchmark index for portfolio comparison"""

    id: str
    name: str
    ticker: str
    description: str


@dataclass
class PortfolioPerformance:
    """Portfolio performance metrics"""

    total_cost: float
    current_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    annualized_return: float
    annualized_return_percentage: float
    benchmark_comparison: dict[str, float]
    holdings: list[dict]


@dataclass
class PortfolioSummary:
    """Summary of portfolio holdings"""

    total_investment: float
    total_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    holdings_count: int
    annualized_return: float
    annualized_return_percentage: float
    benchmarks: list[PortfolioBenchmark]
    last_updated: datetime
