"""
Response models for the API.
"""

from pydantic import BaseModel
from typing import Optional, List


class MetricResponse(BaseModel):
    """Single metric with value and interpretation"""

    name: str
    value: Optional[float] = None
    interpretation: Optional[str] = None
    unit: str = ""


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


class SectorPerformanceResponse(BaseModel):
    """Sector performance comparison"""

    sector_name: Optional[str]
    sector_1d_return: Optional[float]
    sector_3m_return: Optional[float]
    sector_1y_return: Optional[float]
    stock_1d_return: Optional[float]
    stock_3m_return: Optional[float]
    stock_1y_return: Optional[float]


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
    sector_performance: SectorPerformanceResponse
    technical_overview: TechnicalOverviewResponse
    fundamental_overview: FundamentalOverviewResponse
    ai_outlook: AIOutlookResponse
    disclaimer: str
    timestamp: str


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


class StockMoverResponse(BaseModel):
    """Single stock mover data"""

    ticker: str
    company_name: str
    change_percent: float
    current_price: float
    currency: Optional[str]


class MarketMoversResponse(BaseModel):
    """Top and bottom market movers"""

    top_performers: List[StockMoverResponse]
    bottom_performers: List[StockMoverResponse]
    timestamp: str
