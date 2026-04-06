"""
Response models for the API.
"""

from pydantic import BaseModel
from shared.domain import AdvancedMetrics


class MetricResponse(BaseModel):
    """Single metric with value and interpretation"""

    name: str
    value: float | None = None
    interpretation: str | None = None
    unit: str = ""


class ChartDataPoint(BaseModel):
    """Single OHLCV data point for charting"""

    timestamp: str  # ISO format datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class ChartDataResponse(BaseModel):
    """Lightweight chart data response (no metrics calculation)"""

    ticker: str
    chart_data: list[
        dict[str, float | str | None]
    ]  # [{date: "2024-01-01", close: 150.25}, ...]
    data_start_date: str | None = None
    data_end_date: str | None = None


class MarketSummaryIndex(BaseModel):
    """Single market index data"""

    symbol: str
    name: str
    price: float
    change: float
    change_percent: float


class MarketSummaryResponse(BaseModel):
    """Market summary with major indices"""

    indices: list[MarketSummaryIndex]
    timestamp: str


class NewsArticle(BaseModel):
    """Single news article"""

    title: str
    description: str | None = None
    provider: str | None = None
    link: str | None = None
    pub_date: str | None = None
    thumbnail: str | None = None


class StockNewsResponse(BaseModel):
    """Stock news articles"""

    ticker: str
    articles: list[NewsArticle]
    timestamp: str


class IndicatorPoint(BaseModel):
    """Single data point for technical indicator"""

    timestamp: str  # ISO format datetime
    value: float | None = None


class ChartData(BaseModel):
    """Complete chart data for a stock with configurable period and interval"""

    ticker: str
    period: str  # e.g., "1d", "1w", "1m", "3m", "6m", "1y", "5y", "10y"
    interval: str  # e.g., "1d", "1wk", "1mo"
    data_points: list[ChartDataPoint]
    current_price: float


class TechnicalIndicatorsSeries(BaseModel):
    """Technical indicators as time series data for charting"""

    ticker: str
    period: str
    sma_20: list[IndicatorPoint]
    sma_50: list[IndicatorPoint]
    sma_100: list[IndicatorPoint]
    sma_200: list[IndicatorPoint]
    ema_12: list[IndicatorPoint]
    ema_26: list[IndicatorPoint]
    bollinger_upper: list[IndicatorPoint]
    bollinger_middle: list[IndicatorPoint]
    bollinger_lower: list[IndicatorPoint]


class RSISeries(BaseModel):
    """RSI indicator time series"""

    ticker: str
    period: str
    rsi_14: list[IndicatorPoint]
    rsi_21: list[IndicatorPoint]


class MacdSeries(BaseModel):
    """MACD indicator time series"""

    ticker: str
    period: str
    macd: list[IndicatorPoint]
    signal: list[IndicatorPoint]
    histogram: list[IndicatorPoint]


class StochasticSeries(BaseModel):
    """Stochastic oscillator time series"""

    ticker: str
    period: str
    stoch_k: list[IndicatorPoint]
    stoch_d: list[IndicatorPoint]


class ATRSeries(BaseModel):
    """Average True Range time series"""

    ticker: str
    period: str
    atr_14: list[IndicatorPoint]
    atr_21: list[IndicatorPoint]


class VolatilitySeries(BaseModel):
    """Volatility indicators time series"""

    ticker: str
    period: str
    volatility_30d: list[IndicatorPoint]
    volatility_90d: list[IndicatorPoint]
    volatility_365d: list[IndicatorPoint]


class VolumeSeries(BaseModel):
    """Volume and volume-related indicators"""

    ticker: str
    period: str
    volume: list[IndicatorPoint]
    avg_volume_20d: list[IndicatorPoint]
    avg_volume_90d: list[IndicatorPoint]


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
    # New categories for additional yfinance data
    market_data: list[MetricResponse]  # price, volume, 52wk high/low
    liquidity_valuation: list[MetricResponse]  # P/B, P/S, EV/EBITDA
    earnings: list[MetricResponse]  # EPS growth, quarterly growth
    margins: list[MetricResponse]  # gross, operating margins


class AIOutlookResponse(BaseModel):
    """AI-generated investment outlook"""

    overall_summary: str
    bull_case: str
    bear_case: str
    risk_factors: list[str]
    neutral_scenario: str
    recommendation: str
    recommendation_rationale: str


class StockAnalysisResponse(BaseModel):
    """Complete stock analysis response"""

    ticker: str
    company_name: str
    sector: str | None
    industry: str | None
    current_price: float
    currency: str | None
    market_cap: float | None
    technical_overview: TechnicalOverviewResponse
    fundamental_overview: FundamentalOverviewResponse
    ai_outlook: AIOutlookResponse | None = None
    disclaimer: str
    timestamp: str
    # Date range of the OHLC data used for calculations
    data_start_date: str | None = None  # ISO format
    data_end_date: str | None = None  # ISO format
    # Chart data - close prices for the selected period
    chart_data: list[
        dict[str, float | str | None]
    ] = []  # [{date: "2024-01-01", close: 150.25}, ...]
    # Additional company information
    website: str | None = None
    description: str | None = None
    full_time_employees: int | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    phone: str | None = None
    fax: str | None = None
    # Advanced metrics calculated from OHLC data
    advanced_metrics: AdvancedMetrics | None = None
    # Additional Yahoo Finance fields
    regular_market_change: float | None = None
    regular_market_change_percent: float | None = None
    beta: float | None = None
    earnings_timestamp: int | None = None
    target_mean_price: float | None = None
    target_median_price: float | None = None
    dividend_rate: float | None = None
    forward_dividend_yield: float | None = None

    # Financial Health
    ebitda: float | None = (
        None  # Earnings before interest, taxes, depreciation & amortization
    )
    total_cash: float | None = None  # Total cash
    total_debt: float | None = None  # Total debt
    total_cash_per_share: float | None = None  # Cash per share
    current_ratio: float | None = None  # Current ratio
    quick_ratio: float | None = None  # Quick ratio
    payout_ratio: float | None = None  # Dividend payout ratio
    free_cash_flow: float | None = (
        None  # Operating cash flow minus capital expenditures
    )
    operating_cash_flow: float | None = (
        None  # Cash generated from operations (before capex)
    )

    # Share structure
    shares_outstanding: int | None = None  # Shares outstanding
    revenue_per_share: float | None = None  # Revenue per share

    # Ownership
    held_percent_insiders: float | None = None  # % held by insiders
    held_percent_institutions: float | None = None  # % held by institutions

    # Analyst data
    number_of_analyst_opinions: int | None = None  # Number of analyst opinions
    recommendation_key: str | None = None  # buy/sell/etc
    recommendation_mean: float | None = None  # Mean recommendation (1=buy, 5=sell)
    average_analyst_rating: str | None = None  # e.g. "1.9 - Buy"
    target_high_price: float | None = None  # High price target
    target_low_price: float | None = None  # Low price target

    # Moving averages (from yfinance, based on last 50/200 trading days)
    fifty_day_average: float | None = None  # 50-day moving average
    two_hundred_day_average: float | None = None  # 200-day moving average

    # Short interest
    shares_short: int | None = None  # Shares shorted
    short_ratio: float | None = None  # Short ratio
    short_percent_of_float: float | None = None  # Short % of float
    float_shares: int | None = None  # Float shares

    # 52-week and all-time performance
    fifty_two_week_change: float | None = None  # 52-week price change
    s_and_p_fifty_two_week_change: float | None = None  # S&P 500 52-week change
    all_time_high: float | None = None  # All-time highest price
    all_time_low: float | None = None  # All-time lowest price

    # Dividend details
    trailing_annual_dividend_rate: float | None = None  # Trailing annual dividend rate
    trailing_annual_dividend_yield: float | None = (
        None  # Trailing annual dividend yield (decimal)
    )
    five_year_avg_dividend_yield: float | None = None  # 5-year average dividend yield


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
    annualized_return: float | None
    annualized_return_percentage: float | None
    disclaimer: str
    timestamp: str


class WatchlistEntryResponse(BaseModel):
    """Watchlist entry response"""

    id: str
    ticker: str
    entry_price: float
    entry_date: str
    current_price: float
    gain_loss_percentage: float
    notes: str
    added_by: str
    added_date: str


class WatchlistSummaryResponse(BaseModel):
    """Watchlist summary response"""

    total_stocks: int
    average_gain_loss_percentage: float
    stocks_above_entry: int
    stocks_below_entry: int


class WatchlistListResponse(BaseModel):
    """List of watchlist entries"""

    watchlist: list[WatchlistEntryResponse]
    summary: WatchlistSummaryResponse
