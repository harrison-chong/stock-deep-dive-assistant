"""
Response models for the API.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from shared.domain import AdvancedMetrics


class MetricResponse(BaseModel):
    """Single metric with value and interpretation"""

    name: str
    value: Optional[float] = None
    interpretation: Optional[str] = None
    unit: str = ""


class ChartDataPoint(BaseModel):
    """Single OHLCV data point for charting"""

    timestamp: str  # ISO format datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class IndicatorPoint(BaseModel):
    """Single data point for technical indicator"""

    timestamp: str  # ISO format datetime
    value: Optional[float] = None


class ChartData(BaseModel):
    """Complete chart data for a stock with configurable period and interval"""

    ticker: str
    period: str  # e.g., "1d", "1w", "1m", "3m", "6m", "1y", "5y", "10y"
    interval: str  # e.g., "1d", "1wk", "1mo"
    data_points: List[ChartDataPoint]
    current_price: float


class TechnicalIndicatorsSeries(BaseModel):
    """Technical indicators as time series data for charting"""

    ticker: str
    period: str
    sma_20: List[IndicatorPoint]
    sma_50: List[IndicatorPoint]
    sma_100: List[IndicatorPoint]
    sma_200: List[IndicatorPoint]
    ema_12: List[IndicatorPoint]
    ema_26: List[IndicatorPoint]
    bollinger_upper: List[IndicatorPoint]
    bollinger_middle: List[IndicatorPoint]
    bollinger_lower: List[IndicatorPoint]


class RSISeries(BaseModel):
    """RSI indicator time series"""

    ticker: str
    period: str
    rsi_14: List[IndicatorPoint]
    rsi_21: List[IndicatorPoint]


class MacdSeries(BaseModel):
    """MACD indicator time series"""

    ticker: str
    period: str
    macd: List[IndicatorPoint]
    signal: List[IndicatorPoint]
    histogram: List[IndicatorPoint]


class StochasticSeries(BaseModel):
    """Stochastic oscillator time series"""

    ticker: str
    period: str
    stoch_k: List[IndicatorPoint]
    stoch_d: List[IndicatorPoint]


class ATRSeries(BaseModel):
    """Average True Range time series"""

    ticker: str
    period: str
    atr_14: List[IndicatorPoint]
    atr_21: List[IndicatorPoint]


class VolatilitySeries(BaseModel):
    """Volatility indicators time series"""

    ticker: str
    period: str
    volatility_30d: List[IndicatorPoint]
    volatility_90d: List[IndicatorPoint]
    volatility_365d: List[IndicatorPoint]


class VolumeSeries(BaseModel):
    """Volume and volume-related indicators"""

    ticker: str
    period: str
    volume: List[IndicatorPoint]
    avg_volume_20d: List[IndicatorPoint]
    avg_volume_90d: List[IndicatorPoint]


class TechnicalOverviewResponse(BaseModel):
    """Technical indicators overview"""

    moving_averages: List[MetricResponse]
    momentum: List[MetricResponse]
    volatility: List[MetricResponse]


class FundamentalOverviewResponse(BaseModel):
    """Fundamental metrics grouped by category"""

    profitability: List[MetricResponse]
    valuation: List[MetricResponse]
    financial_strength: List[MetricResponse]
    growth: List[MetricResponse]
    # New categories for additional yfinance data
    market_data: List[MetricResponse]  # price, volume, 52wk high/low
    liquidity_valuation: List[MetricResponse]  # P/B, P/S, EV/EBITDA
    earnings: List[MetricResponse]  # EPS growth, quarterly growth
    margins: List[MetricResponse]  # gross, operating margins


class AIOutlookResponse(BaseModel):
    """AI-generated investment outlook"""

    overall_summary: str
    bull_case: str
    bear_case: str
    risk_factors: List[str]
    neutral_scenario: str
    recommendation: str
    recommendation_rationale: str
    confidence_score: float


class StockAnalysisResponse(BaseModel):
    """Complete stock analysis response"""

    ticker: str
    company_name: str
    sector: Optional[str]
    industry: Optional[str]
    current_price: float
    currency: Optional[str]
    market_cap: Optional[float]
    snapshot_summary: str
    technical_overview: TechnicalOverviewResponse
    fundamental_overview: FundamentalOverviewResponse
    ai_outlook: AIOutlookResponse
    disclaimer: str
    timestamp: str
    # Chart data availability flags for frontend
    available_chart_periods: List[str] = [
        "1d",
        "5d",
        "1m",
        "3m",
        "6m",
        "1y",
        "5y",
        "10y",
    ]
    available_intervals: List[str] = ["1d", "1w", "1m", "3m"]
    # Additional company information
    website: Optional[str] = None
    description: Optional[str] = None
    full_time_employees: Optional[int] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    # Raw yfinance info dict for maximum data exposure
    extra_info: Dict[str, Any] = {}
    # Advanced metrics calculated from 10 years of OHLC data
    advanced_metrics: Optional[AdvancedMetrics] = None


class PerformanceResponse(BaseModel):
    """Stock performance calculation response"""

    ticker: str
    company_name: str
    purchase_date: str
    current_date: str
    quantity: float
    purchase_price: float
    current_price: float
    total_cost: float
    current_value: float
    profit_loss: float
    profit_loss_percentage: float
    annualized_return: float
    annualized_return_percentage: float
    disclaimer: str
    timestamp: str


class PortfolioEntryResponse(BaseModel):
    """Portfolio entry response"""

    id: str
    ticker: str
    company_name: str
    purchase_date: str
    quantity: float
    purchase_price: float
    current_price: float
    current_value: float
    profit_loss: float
    profit_loss_percentage: float
    annualized_return: float
    annualized_return_percentage: float
    status: str  # "active" or "sold"


class PortfolioListResponse(BaseModel):
    """List of portfolio entries"""

    portfolio: List[PortfolioEntryResponse]
    summary: Dict[str, float]


class PortfolioPerformanceResponse(BaseModel):
    """Portfolio performance response"""

    total_cost: float
    current_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    annualized_return: float
    annualized_return_percentage: float
    benchmark_comparison: Dict[str, float]
    benchmark_monetary_comparison: Dict[str, float]
    holdings: List[dict]


class PortfolioSummaryResponse(BaseModel):
    """Portfolio summary response"""

    total_investment: float
    total_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    holdings_count: int
    annualized_return: float
    annualized_return_percentage: float
    benchmarks: List[dict]
    last_updated: str
