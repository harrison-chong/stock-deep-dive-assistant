"""
Request models for the API.
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


class AnalysisRequest(BaseModel):
    """Request to analyze a stock"""

    ticker: str = Field(..., description="Stock ticker")
    investment_horizon: Optional[str] = Field(default="1y")
    risk_tolerance: Optional[str] = Field(default="moderate")


class PerformanceRequest(BaseModel):
    """Request to calculate stock performance"""

    ticker: str = Field(..., description="Stock ticker")
    purchase_date: str = Field(..., description="Purchase date in YYYY-MM-DD format")
    quantity: float = Field(..., description="Number of shares purchased")
    purchase_price: float = Field(..., description="Purchase price per share")


class PortfolioEntryRequest(BaseModel):
    """Request to add a stock to portfolio"""

    ticker: str = Field(..., description="Stock ticker")
    purchase_date: str = Field(..., description="Purchase date in YYYY-MM-DD format")
    quantity: float = Field(..., description="Number of shares purchased")
    purchase_price: float = Field(..., description="Purchase price per share")


class PortfolioSellRequest(BaseModel):
    """Request to sell a stock from portfolio"""

    id: str = Field(..., description="Portfolio entry ID")
    sell_date: str = Field(..., description="Sell date in YYYY-MM-DD format")
    sell_price: float = Field(..., description="Sell price per share")


class PortfolioResponse(BaseModel):
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

    portfolio: List[PortfolioResponse]
    summary: Dict[str, float]


class PortfolioPerformanceResponse(BaseModel):
    """Portfolio performance response"""

    total_cost: float
    current_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    annualized_return: float
    annualized_return_percentage: float
    benchmark_comparison: dict[str, float]
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
