"""
Stock Deep Dive Assistant - Shared Types
"""

from dataclasses import dataclass
from datetime import datetime


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
    logo_url: str | None


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
