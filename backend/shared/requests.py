"""
Request models for the API.
"""

from pydantic import BaseModel, Field
from typing import Optional


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
