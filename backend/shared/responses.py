"""
Response models for the API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from shared.domain import (
    OHLCData,
    CompanyInfo,
    FundamentalData,
    TechnicalIndicators,
    AIInterpretation,
    PortfolioEntry,
    PortfolioBenchmark,
    PortfolioPerformance,
    PortfolioSummary,
)


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
    currency: Optional[str]
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
