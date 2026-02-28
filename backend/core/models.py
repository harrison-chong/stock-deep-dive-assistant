"""
Pydantic schemas for requests/responses
"""

from pydantic import BaseModel, Field
from typing import Optional


# ============ REQUESTS ============


class AnalysisRequest(BaseModel):
    """Request to analyze a stock"""

    ticker: str = Field(..., description="Stock ticker")
    investment_horizon: Optional[str] = Field(default="1y")
    risk_tolerance: Optional[str] = Field(default="moderate")


# ============ RESPONSES ============


class MetricResponse(BaseModel):
    """Single metric with value and interpretation"""

    name: str
    value: Optional[float] = None
    interpretation: Optional[str] = None
    unit: str = ""


class TechnicalOverviewResponse(BaseModel):
    """Technical indicators overview"""

    moving_averages: list[MetricResponse]
    momentum: list[MetricResponse]
    volatility: list[MetricResponse]


class FundamentalOverviewResponse(BaseModel):
    """Fundamental metrics grouped by category"""

    profitability: list[MetricResponse]
    valuation: list[MetricResponse]
    financial_strength: list[MetricResponse]
    growth: list[MetricResponse]


class AIOutlookResponse(BaseModel):
    """AI-generated investment outlook"""

    overall_summary: str
    bull_case: str
    bear_case: str
    risk_factors: list[str]
    neutral_scenario: str
    recommendation: str
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
