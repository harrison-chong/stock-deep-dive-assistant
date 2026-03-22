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
    confidence_score: float


@dataclass
class PortfolioEntry:
    """Individual stock holding in portfolio"""

    id: str
    ticker: str
    company_name: str
    purchase_date: datetime
    quantity: float
    purchase_price: float
    sold: bool = False
    sell_date: datetime | None = None
    sell_price: float | None = None


@dataclass
class PortfolioBenchmark:
    """Benchmark index for portfolio comparison"""

    id: str
    name: str
    ticker: str
    description: str


@dataclass
class PortfolioPerformance:
    """Portfolio performance metrics"""

    total_cost: float
    current_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    annualized_return: float
    annualized_return_percentage: float
    benchmark_comparison: dict[str, float]
    holdings: list[dict]


@dataclass
class PortfolioSummary:
    """Summary of portfolio holdings"""

    total_investment: float
    total_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    holdings_count: int
    annualized_return: float
    annualized_return_percentage: float
    benchmarks: list[PortfolioBenchmark]
    last_updated: datetime


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
class PatternDetection:
    """Chart pattern recognition results"""

    # Traditional chart patterns
    head_and_shoulders: bool = False
    inverted_head_and_shoulders: bool = False
    double_top: bool = False
    double_bottom: bool = False
    triangle_pattern: bool = False
    flag_pattern: bool = False
    cup_and_handle: bool = False

    # ADX trend strength
    adx: float | None = None

    # Gap analysis
    gap_up_detected: bool = False
    gap_down_detected: bool = False

    # Support/Resistance breaks
    support_break: bool = False
    resistance_break: bool = False


@dataclass
class SeasonalAnalysis:
    """Seasonal and calendar-based patterns"""

    # Monthly returns (average % for each month) - keys: "month_1" through "month_12"
    monthly_returns: dict[str, float] = None

    # Quarterly returns - keys: "q1", "q2", "q3", "q4"
    quarterly_returns: dict[str, float] = None

    # Day of week effects - keys: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
    day_of_week_effect: dict[str, float] = None

    # Earnings season impact (if earnings dates available)
    earnings_season_impact: float | None = None


@dataclass
class AdvancedMetrics:
    """Complete set of advanced metrics calculated from OHLC data"""

    statistical: StatisticalMetrics
    technical: TechnicalPerformance
    patterns: PatternDetection
    seasonal: SeasonalAnalysis
    disclaimer: str = (
        "Advanced metrics are statistical estimates for educational purposes only."
    )
