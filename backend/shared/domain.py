"""
Stock Deep Dive Assistant - Domain Types
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
    start_date: datetime = None  # First date in the data
    end_date: datetime = None  # Last date in the data


@dataclass
class CompanyInfo:
    """Basic company information"""

    ticker: str
    name: str
    sector: str | None
    industry: str | None
    website: str | None
    description: str | None
    currency: str | None
    full_time_employees: int | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    phone: str | None = None
    fax: str | None = None


@dataclass
class FundamentalData:
    """Company fundamental metrics"""

    ticker: str
    market_cap: float | None = None
    pe_ratio: float | None = None
    forward_pe: float | None = None
    eps: float | None = None
    revenue: float | None = None
    revenue_growth: float | None = None
    roe: float | None = None
    debt_to_equity: float | None = None
    free_cash_flow: float | None = None
    operating_cash_flow: float | None = None
    dividend_yield: float | None = None
    profit_margin: float | None = None
    peg_ratio: float | None = None
    industry: str | None = None
    sector: str | None = None
    previous_close: float | None = None
    day_high: float | None = None
    day_low: float | None = None
    bid: float | None = None
    ask: float | None = None
    volume: int | None = None
    average_volume: int | None = None
    fifty_two_week_high: float | None = None
    fifty_two_week_low: float | None = None
    enterprise_value: float | None = None
    price_to_book: float | None = None
    price_to_sales: float | None = None
    enterprise_to_ebitda: float | None = None
    trailing_peg_ratio: float | None = None
    forward_eps: float | None = None
    book_value: float | None = None
    book_per_share: float | None = None
    return_on_assets: float | None = None
    return_on_investment: float | None = None
    gross_margins: float | None = None
    operating_margins: float | None = None
    earnings_quarterly_growth: float | None = None
    earnings_growth: float | None = None
    # Additional Yahoo Finance fields
    regular_market_change: float | None = None
    regular_market_change_percent: float | None = None
    beta: float | None = None
    earnings_timestamp: int | None = None
    target_mean_price: float | None = None
    target_median_price: float | None = None
    dividend_rate: float | None = None
    forward_dividend_yield: float | None = None
    # Additional yfinance fields - Valuation & Earnings
    ebitda: float | None = None
    revenue_per_share: float | None = None
    payout_ratio: float | None = None
    total_cash: float | None = None
    total_debt: float | None = None
    total_cash_per_share: float | None = None
    current_ratio: float | None = None
    quick_ratio: float | None = None
    # Share structure
    shares_outstanding: int | None = None
    float_shares: int | None = None
    implied_shares_outstanding: int | None = None
    # Ownership
    held_percent_insiders: float | None = None
    held_percent_institutions: float | None = None
    # Analyst data
    number_of_analyst_opinions: int | None = None
    recommendation_key: str | None = None
    recommendation_mean: float | None = None
    average_analyst_rating: str | None = None
    # Price targets
    target_high_price: float | None = None
    target_low_price: float | None = None
    # Moving averages
    fifty_day_average: float | None = None
    two_hundred_day_average: float | None = None
    # 52-week change
    fifty_two_week_change: float | None = None
    s_and_p_fifty_two_week_change: float | None = None
    # All-time high/low
    all_time_high: float | None = None
    all_time_low: float | None = None
    # Short interest
    shares_short: int | None = None
    short_ratio: float | None = None
    short_percent_of_float: float | None = None
    # Dividend details
    trailing_annual_dividend_rate: float | None = None
    trailing_annual_dividend_yield: float | None = None
    five_year_avg_dividend_yield: float | None = None
    ex_dividend_date: int | None = None
    dividend_date: int | None = None
    last_dividend_date: int | None = None
    last_dividend_value: float | None = None


@dataclass
class TechnicalIndicators:
    """Complete set of technical indicators"""

    # Short-term moving averages
    sma_20: float | None
    sma_50: float | None
    # Medium-term moving averages
    sma_100: float | None
    sma_200: float | None
    # Long-term moving averages
    sma_365: float | None
    # Exponential moving averages
    ema_12: float | None
    ema_26: float | None
    ema_50: float | None
    # Momentum indicators
    rsi_14: float | None
    rsi_21: float | None
    macd: float | None
    macd_signal: float | None
    macd_histogram: float | None
    stoch_k: float | None
    stoch_d: float | None
    williams_r: float | None
    # Volatility indicators
    bollinger_upper: float | None
    bollinger_middle: float | None
    bollinger_lower: float | None
    bollinger_width: float | None
    atr_14: float | None
    atr_21: float | None
    volatility_30d: float | None
    volatility_90d: float | None
    volatility_365d: float | None
    # Performance metrics
    total_return: float | None
    annualized_return: float | None
    year_high: float | None
    year_low: float | None
    fifty_two_week_high: float | None
    fifty_two_week_low: float | None
    current_price: float | None
    price_sma_200_ratio: float | None
    # Volume indicators
    avg_volume_20d: float | None
    avg_volume_90d: float | None


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


@dataclass
class WatchlistEntry:
    """Stock in watchlist for tracking potential purchase"""

    id: str
    ticker: str
    entry_price: float
    entry_date: datetime = None
    notes: str = ""
    added_by: str = ""
    added_date: datetime = None


@dataclass
class StatisticalMetrics:
    """Statistical measures of return distribution and risk"""

    total_return: float | None = None  # Cumulative return over period
    annualized_return: float | None = None  # CAGR
    annualized_volatility: float | None = None  # Annualized standard deviation
    sharpe_ratio: float | None = None  # (Return - RiskFree) / Volatility
    sortino_ratio: float | None = None  # (Return - RiskFree) / DownsideDeviation
    max_drawdown: float | None = None  # Peak-to-trough decline as percentage
    cagr: float | None = None  # Compound annual growth rate
    calmar_ratio: float | None = None  # Annualized return / Max drawdown
    var_95: float | None = None  # 5% worst case loss (daily)
    skewness: float | None = None  # Distribution asymmetry
    kurtosis: float | None = None  # Distribution tail heaviness
    ulcer_index: float | None = None  # Drawdown severity
    recovery_days: int | None = None  # Days to recover from max drawdown
    beta: float | None = None  # Correlation with market (SPY)
    alpha: float | None = None  # Excess return vs market
    r_squared: float | None = None  # Correlation squared with market


@dataclass
class TechnicalPerformance:
    """Technical analysis performance metrics"""

    # Multi-period returns
    returns_1m: float | None = None
    returns_3m: float | None = None
    returns_6m: float | None = None
    returns_1y: float | None = None
    returns_3y: float | None = None
    returns_5y: float | None = None
    returns_10y: float | None = None

    # Annualized CAGR for specific periods
    cagr_2y: float | None = None  # Annualized CAGR over last 2 years
    cagr_3y: float | None = None  # Annualized CAGR over last 3 years
    cagr_5y: float | None = None  # Annualized CAGR over last 5 years

    # Moving average crossovers (boolean flags)
    golden_cross_detected: bool = False  # MA50 crossed above MA200
    death_cross_detected: bool = False  # MA50 crossed below MA200

    # Relative strength vs moving averages
    price_vs_sma_50: float | None = None  # % deviation from SMA50
    price_vs_sma_200: float | None = None  # % deviation from SMA200

    # Pivot points (support/resistance levels)
    pivot_resistance_1: float | None = None
    pivot_resistance_2: float | None = None
    pivot_support_1: float | None = None
    pivot_support_2: float | None = None

    # Volume analysis
    volume_avg_50d: float | None = None
    volume_trend: str | None = (
        None  # "increasing", "decreasing", "stable", "insufficient_data"
    )


@dataclass
class SeasonalAnalysis:
    """Seasonal and calendar-based patterns"""

    # Monthly returns (average % for each month) - keys: "month_1" through "month_12"
    monthly_returns: dict[str, float] = None

    # Monthly win rate (% of positive months) - keys: "month_1" through "month_12"
    monthly_win_rate: dict[str, float] = None

    # Best and worst month - tuple of (month_key, return_value)
    best_month: tuple[str, float] = None  # (month_1, 0.05)
    worst_month: tuple[str, float] = None  # (month_3, -0.03)

    # Quarterly returns - keys: "q1", "q2", "q3", "q4"
    quarterly_returns: dict[str, float] = None

    # Quarterly win rate - keys: "q1", "q2", "q3", "q4"
    quarterly_win_rate: dict[str, float] = None

    # Best and worst quarter
    best_quarter: tuple[str, float] = None
    worst_quarter: tuple[str, float] = None

    # Day of week effects - keys: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
    day_of_week_effect: dict[str, float] = None

    # Day of week win rate
    day_of_week_win_rate: dict[str, float] = None

    # Earnings season impact (if earnings dates available)
    earnings_season_impact: float | None = None


@dataclass
class AdvancedMetrics:
    """Complete set of advanced metrics calculated from OHLC data"""

    statistical: StatisticalMetrics
    technical: TechnicalPerformance
    seasonal: SeasonalAnalysis | None = None
    disclaimer: str = (
        "Advanced metrics are statistical estimates for educational purposes only."
    )
