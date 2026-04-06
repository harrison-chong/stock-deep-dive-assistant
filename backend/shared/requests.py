"""
Request models for the API.
"""

from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    """Request to analyze a stock"""

    ticker: str = Field(..., description="Stock ticker")
    period: str | None = Field(
        default=None,
        description="Data period (optional): 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max. Use period OR start_date+end_date.",
    )
    start_date: str | None = Field(
        default=None,
        description="Start date in YYYY-MM-DD format. Use with end_date for exact date range.",
    )
    end_date: str | None = Field(
        default=None,
        description="End date in YYYY-MM-DD format. Defaults to today if not specified.",
    )
    investment_horizon: str | None = Field(default="1y")
    risk_tolerance: str | None = Field(default="moderate")


class ChartDataRequest(BaseModel):
    """Request to fetch only chart data (lightweight, no metrics calculation)"""

    ticker: str = Field(..., description="Stock ticker")
    period: str | None = Field(
        default=None,
        description="Data period (optional): 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max. Use period OR start_date+end_date.",
    )
    start_date: str | None = Field(
        default=None,
        description="Start date in YYYY-MM-DD format. Use with end_date for exact date range.",
    )
    end_date: str | None = Field(
        default=None,
        description="End date in YYYY-MM-DD format. Defaults to today if not specified.",
    )


class PerformanceRequest(BaseModel):
    """Request to calculate stock performance"""

    ticker: str = Field(..., description="Stock ticker")
    purchase_date: str = Field(..., description="Purchase date in YYYY-MM-DD format")
    quantity: float = Field(..., description="Number of shares purchased")
    purchase_price: float = Field(..., description="Purchase price per share")


class WatchlistEntryRequest(BaseModel):
    """Request to add a stock to watchlist"""

    ticker: str = Field(..., description="Stock ticker")
    entry_price: float = Field(
        default=0, description="Price when added (0 = fetch from entry_date or current)"
    )
    entry_date: str | None = Field(
        default=None,
        description="Date of entry in YYYY-MM-DD format (optional, defaults to today)",
    )
    notes: str = Field(default="", description="Notes on why you wanted to buy")
    added_by: str = Field(..., description="Name of person who added this entry")
