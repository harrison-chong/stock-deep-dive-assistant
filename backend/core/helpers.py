"""
Shared helper functions and utilities
"""

import pandas as pd


def get_current_price(df: pd.DataFrame) -> float:
    """Get the most recent closing price from DataFrame"""
    return float(df["close"].iloc[-1])


def get_price_change(df: pd.DataFrame, days: int = 1) -> float:
    """Calculate percentage change over X days"""
    if len(df) < days + 1:
        return 0.0
    current = df["close"].iloc[-1]
    previous = df["close"].iloc[-(days + 1)]
    return float(((current - previous) / previous) * 100)


def is_valid_ticker(ticker: str) -> bool:
    """Check if ticker format is reasonable"""
    return 1 < len(ticker) < 10 and ticker.replace(".", "").isalnum()


def format_currency(value: float | None) -> str:
    """Format value as currency"""
    if value is None:
        return "N/A"
    if abs(value) >= 1e9:
        return f"${value / 1e9:.1f}B"
    elif abs(value) >= 1e6:
        return f"${value / 1e6:.1f}M"
    elif abs(value) >= 1e3:
        return f"${value / 1e3:.1f}K"
    return f"${value:.2f}"
