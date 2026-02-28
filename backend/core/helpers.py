"""
Shared helper functions and utilities
"""

import pandas as pd


def get_current_price(df: pd.DataFrame) -> float:
    """Get the most recent closing price from DataFrame"""
    return float(df['close'].iloc[-1])


def get_price_change(df: pd.DataFrame, days: int = 1) -> float:
    """Calculate percentage change over X days"""
    if len(df) < days + 1:
        return 0.0
    current = df['close'].iloc[-1]
    previous = df['close'].iloc[-(days + 1)]
    return float(((current - previous) / previous) * 100)


def is_valid_ticker(ticker: str) -> bool:
    """Check if ticker format is reasonable"""
    return 1 < len(ticker) < 10 and ticker.replace(".", "").isalnum()


def format_currency(value: float | None) -> str:
    """Format value as currency"""
    if value is None:
        return "N/A"
    if abs(value) >= 1e9:
        return f"${value/1e9:.1f}B"
    elif abs(value) >= 1e6:
        return f"${value/1e6:.1f}M"
    elif abs(value) >= 1e3:
        return f"${value/1e3:.1f}K"
    return f"${value:.2f}"


def create_snapshot_summary(
    ticker: str,
    current_price: float,
    sma_200: float | None,
    pe_ratio: float | None,
    fcf: float | None,
    rsi: float | None,
) -> str:
    """Create high-level snapshot summary"""
    summaries = []

    # Price position
    if sma_200 and current_price:
        if current_price > sma_200 * 1.05:
            summaries.append("Trading well above 200-day average")
        elif current_price > sma_200:
            summaries.append("Trading above 200-day average")
        else:
            summaries.append("Trading below 200-day average")

    # Valuation
    if pe_ratio:
        if pe_ratio < 15:
            summaries.append("Attractively valued")
        elif pe_ratio < 25:
            summaries.append("Moderately valued")
        else:
            summaries.append("Premium valuation")

    # Financial health
    if fcf:
        summaries.append("Positive free cash flow")

    # Momentum
    if rsi:
        if rsi > 70:
            summaries.append("Overbought momentum")
        elif rsi < 30:
            summaries.append("Oversold momentum")
        elif rsi > 50:
            summaries.append("Improving momentum")

    if summaries:
        return f"{ticker}: {'; '.join(summaries)}."
    return f"Unable to generate snapshot for {ticker}."
