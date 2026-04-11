"""Domain models — frozen dataclasses for immutability."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class OHLCData:
    timestamp: list[datetime]
    open: list[float]
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[int]
    start_date: datetime = field(default=None)
    end_date: datetime = field(default=None)


@dataclass(frozen=True)
class CompanyInfo:
    ticker: str
    name: str
    sector: str | None = None
    industry: str | None = None
    website: str | None = None
    description: str | None = None
    currency: str | None = None
    full_time_employees: int | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    phone: str | None = None
    fax: str | None = None


@dataclass(frozen=True)
class ValuationMetrics:
    market_cap: float | None = None
    pe_ratio: float | None = None
    forward_pe: float | None = None
    peg_ratio: float | None = None
    price_to_book: float | None = None
    price_to_sales: float | None = None
    enterprise_value: float | None = None
    enterprise_to_ebitda: float | None = None


@dataclass(frozen=True)
class ProfitabilityMetrics:
    profit_margin: float | None = None
    gross_margins: float | None = None
    operating_margins: float | None = None
    roe: float | None = None
    return_on_assets: float | None = None
    return_on_investment: float | None = None


@dataclass(frozen=True)
class GrowthMetrics:
    revenue_growth: float | None = None
    earnings_growth: float | None = None
    earnings_quarterly_growth: float | None = None


@dataclass(frozen=True)
class DividendMetrics:
    dividend_yield: float | None = None
    dividend_rate: float | None = None
    payout_ratio: float | None = None
    trailing_annual_dividend_rate: float | None = None
    trailing_annual_dividend_yield: float | None = None
    five_year_avg_dividend_yield: float | None = None


@dataclass(frozen=True)
class FinancialHealth:
    ebitda: float | None = None
    total_cash: float | None = None
    total_debt: float | None = None
    total_cash_per_share: float | None = None
    current_ratio: float | None = None
    quick_ratio: float | None = None
    free_cash_flow: float | None = None
    operating_cash_flow: float | None = None
    payout_ratio: float | None = None
    revenue_per_share: float | None = None


@dataclass(frozen=True)
class OwnershipData:
    shares_outstanding: int | None = None
    float_shares: int | None = None
    held_percent_insiders: float | None = None
    held_percent_institutions: float | None = None
    shares_short: int | None = None
    short_ratio: float | None = None
    short_percent_of_float: float | None = None
    implied_shares_outstanding: int | None = None


@dataclass(frozen=True)
class AnalystData:
    number_of_analyst_opinions: int | None = None
    recommendation_key: str | None = None
    recommendation_mean: float | None = None
    average_analyst_rating: str | None = None
    target_mean_price: float | None = None
    target_median_price: float | None = None
    target_high_price: float | None = None
    target_low_price: float | None = None


@dataclass(frozen=True)
class MarketData:
    previous_close: float | None = None
    day_high: float | None = None
    day_low: float | None = None
    bid: float | None = None
    ask: float | None = None
    volume: int | None = None
    average_volume: int | None = None
    fifty_two_week_high: float | None = None
    fifty_two_week_low: float | None = None
    fifty_two_week_change: float | None = None
    s_and_p_fifty_two_week_change: float | None = None
    all_time_high: float | None = None
    all_time_low: float | None = None
    fifty_day_average: float | None = None
    two_hundred_day_average: float | None = None
    beta: float | None = None
    regular_market_change: float | None = None
    regular_market_change_percent: float | None = None
    earnings_timestamp: int | None = None
    forward_dividend_yield: float | None = None


@dataclass(frozen=True)
class TickerInfo:
    ticker: str
    company: CompanyInfo
    valuation: ValuationMetrics
    profitability: ProfitabilityMetrics
    growth: GrowthMetrics
    dividend: DividendMetrics
    financial_health: FinancialHealth
    ownership: OwnershipData
    analyst: AnalystData
    market: MarketData
    eps: float | None = None
    forward_eps: float | None = None
    book_value: float | None = None
    book_per_share: float | None = None


@dataclass(frozen=True)
class TechnicalIndicators:
    sma_20: float | None = None
    sma_50: float | None = None
    sma_100: float | None = None
    sma_200: float | None = None
    sma_365: float | None = None
    ema_12: float | None = None
    ema_26: float | None = None
    ema_50: float | None = None
    rsi_14: float | None = None
    rsi_21: float | None = None
    macd: float | None = None
    macd_signal: float | None = None
    macd_histogram: float | None = None
    stoch_k: float | None = None
    stoch_d: float | None = None
    williams_r: float | None = None
    bollinger_upper: float | None = None
    bollinger_middle: float | None = None
    bollinger_lower: float | None = None
    bollinger_width: float | None = None
    atr_14: float | None = None
    atr_21: float | None = None
    volatility_30d: float | None = None
    volatility_90d: float | None = None
    volatility_365d: float | None = None
    total_return: float | None = None
    annualized_return: float | None = None
    year_high: float | None = None
    year_low: float | None = None
    fifty_two_week_high: float | None = None
    fifty_two_week_low: float | None = None
    current_price: float | None = None
    price_sma_200_ratio: float | None = None
    avg_volume_20d: float | None = None
    avg_volume_90d: float | None = None


@dataclass(frozen=True)
class StatisticalMetrics:
    total_return: float | None = None
    annualized_return: float | None = None
    annualized_volatility: float | None = None
    sharpe_ratio: float | None = None
    sortino_ratio: float | None = None
    max_drawdown: float | None = None
    cagr: float | None = None
    calmar_ratio: float | None = None
    var_95: float | None = None
    skewness: float | None = None
    kurtosis: float | None = None
    ulcer_index: float | None = None
    recovery_days: int | None = None
    beta: float | None = None
    alpha: float | None = None
    r_squared: float | None = None


@dataclass(frozen=True)
class TechnicalPerformance:
    returns_1m: float | None = None
    returns_3m: float | None = None
    returns_6m: float | None = None
    returns_1y: float | None = None
    returns_3y: float | None = None
    returns_5y: float | None = None
    returns_10y: float | None = None
    cagr_2y: float | None = None
    cagr_3y: float | None = None
    cagr_5y: float | None = None
    golden_cross_detected: bool = False
    death_cross_detected: bool = False
    price_vs_sma_50: float | None = None
    price_vs_sma_200: float | None = None
    pivot_resistance_1: float | None = None
    pivot_resistance_2: float | None = None
    pivot_support_1: float | None = None
    pivot_support_2: float | None = None
    volume_avg_50d: float | None = None
    volume_trend: str | None = None


@dataclass(frozen=True)
class SeasonalAnalysis:
    monthly_returns: dict[str, float] | None = None
    monthly_win_rate: dict[str, float] | None = None
    best_month: tuple[str, float] | None = None
    worst_month: tuple[str, float] | None = None
    quarterly_returns: dict[str, float] | None = None
    quarterly_win_rate: dict[str, float] | None = None
    best_quarter: tuple[str, float] | None = None
    worst_quarter: tuple[str, float] | None = None
    day_of_week_effect: dict[str, float] | None = None
    day_of_week_win_rate: dict[str, float] | None = None
    earnings_season_impact: float | None = None


@dataclass(frozen=True)
class AdvancedMetrics:
    statistical: StatisticalMetrics
    technical: TechnicalPerformance
    seasonal: SeasonalAnalysis | None = None
    disclaimer: str = (
        "Advanced metrics are statistical estimates for educational purposes only."
    )

    def __post_init__(self):
        pass


@dataclass(frozen=True)
class WatchlistEntry:
    id: str
    ticker: str
    entry_price: float
    entry_date: datetime | None = None
    notes: str = ""
    added_by: str = ""
    added_date: datetime | None = None


@dataclass(frozen=True)
class AIInterpretation:
    overall_summary: str
    bull_case: str
    bear_case: str
    risk_factors: list[str]
    neutral_scenario: str
    recommendation: str
    recommendation_rationale: str


@dataclass(frozen=True)
class InterpretationThresholds:
    pe_undervalued: float = 15.0
    pe_moderate: float = 25.0
    roe_excellent: float = 0.20
    roe_strong: float = 0.15
    roe_decent: float = 0.10
    debt_conservative: float = 0.5
    debt_moderate: float = 1.5
    peg_undervalued: float = 1.0
    peg_fair: float = 2.0
    div_yield_high: float = 0.05
    growth_strong: float = 0.15
    growth_moderate: float = 0.05
    growth_positive: float = 0.0
