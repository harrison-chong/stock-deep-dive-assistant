"""
Pydantic schemas for requests/responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


# ============ REQUESTS ============


class AnalysisRequest(BaseModel):
    """Request to analyze a stock"""

    ticker: str = Field(..., description="Stock ticker")
    investment_horizon: Optional[str] = Field(default="1y")
    risk_tolerance: Optional[str] = Field(default="moderate")


class PerformanceRequest(BaseModel):
    """Request to calculate stock performance"""

    ticker: str = Field(..., description="Stock ticker")
    purchase_date: date = Field(..., description="Date of purchase")
    quantity: float = Field(..., description="Number of shares purchased")
    purchase_price: Optional[float] = Field(default=None, description="Purchase price per share (optional, will fetch if not provided)")


# ============ RESPONSES ============


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


class StockAnalysisResponse(BaseModel):
    """Complete stock analysis response"""

    ticker: str
    company_name: str
    sector: Optional[str]
    industry: Optional[str]
    current_price: float
    market_cap: Optional[float]
    snapshot_summary: str
    technical_overview: TechnicalOverviewResponse
    fundamental_overview: FundamentalOverviewResponse
    ai_outlook: AIOutlookResponse
    disclaimer: str
    timestamp: str


class PerformanceResponse(BaseModel):
    """Stock performance calculation response"""

    ticker: str
    company_name: str
    purchase_date: date
    quantity: float
    purchase_price: float
    current_price: float
    total_cost: float
    current_value: float
    profit_loss: float
    profit_loss_percentage: float
    holding_period: int
    annualized_return: Optional[float] = None
    disclaimer: str
    timestamp: str
