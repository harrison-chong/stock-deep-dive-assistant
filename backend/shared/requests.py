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
