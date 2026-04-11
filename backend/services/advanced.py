"""Advanced metrics calculation service."""

import pandas as pd
import numpy as np

from domain.models import (
    AdvancedMetrics,
    StatisticalMetrics,
    TechnicalPerformance,
    SeasonalAnalysis,
)


def calculate_all(df: pd.DataFrame, risk_free_rate: float = 0.02) -> AdvancedMetrics:
    """Calculate all advanced metrics from OHLC DataFrame."""
    df = df.copy()
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"]

    daily_returns = close.pct_change().dropna()

    if not isinstance(df.index, pd.DatetimeIndex):
        raise ValueError("DataFrame index must be DatetimeIndex")

    statistical = _calculate_statistical(close, daily_returns, risk_free_rate)
    technical = _calculate_technical(close, high, low, volume, df.index)
    seasonal = _calculate_seasonal(close, df.index)

    return AdvancedMetrics(
        statistical=statistical, technical=technical, seasonal=seasonal
    )


def _calculate_statistical(
    close: pd.Series, daily_returns: pd.Series, risk_free_rate: float
) -> StatisticalMetrics:
    total_return = (close.iloc[-1] / close.iloc[0]) - 1
    years = len(close) / 252
    annualized_return = (1 + total_return) ** (1 / years) - 1 if years > 0 else 0
    annualized_volatility = daily_returns.std() * np.sqrt(252)
    excess_return = annualized_return - risk_free_rate
    sharpe_ratio = (
        excess_return / annualized_volatility if annualized_volatility != 0 else 0
    )
    downside_returns = daily_returns[daily_returns < 0]
    downside_deviation = (
        downside_returns.std() * np.sqrt(252) if len(downside_returns) > 0 else 0
    )
    sortino_ratio = excess_return / downside_deviation if downside_deviation != 0 else 0
    rolling_max = close.expanding().max()
    drawdown = (close - rolling_max) / rolling_max
    max_drawdown = drawdown.min()
    cagr = (close.iloc[-1] / close.iloc[0]) ** (1 / years) - 1 if years > 0 else 0
    calmar_ratio = cagr / abs(max_drawdown) if max_drawdown != 0 else 0
    var_95 = np.percentile(daily_returns, 5)
    skewness = daily_returns.skew()
    kurtosis = daily_returns.kurtosis()
    drawdown_squared = drawdown**2
    ulcer_index = np.sqrt(drawdown_squared.mean())
    recovery_days = _calculate_recovery_days(drawdown)
    return StatisticalMetrics(
        total_return=float(total_return),
        annualized_return=float(annualized_return),
        annualized_volatility=float(annualized_volatility),
        sharpe_ratio=float(sharpe_ratio),
        sortino_ratio=float(sortino_ratio),
        max_drawdown=float(max_drawdown),
        cagr=float(cagr),
        calmar_ratio=float(calmar_ratio),
        var_95=float(var_95),
        skewness=float(skewness),
        kurtosis=float(kurtosis),
        ulcer_index=float(ulcer_index),
        recovery_days=recovery_days,
        beta=None,
        alpha=None,
        r_squared=None,
    )


def _calculate_technical(
    close: pd.Series,
    high: pd.Series,
    low: pd.Series,
    volume: pd.Series,
    index: pd.DatetimeIndex,
) -> TechnicalPerformance:
    returns_1m = _period_return(close, "1M")
    returns_3m = _period_return(close, "3M")
    returns_6m = _period_return(close, "6M")
    returns_1y = _period_return(close, "1Y")
    returns_3y = _period_return(close, "3Y")
    returns_5y = _period_return(close, "5Y")
    returns_10y = _period_return(close, "10Y")
    cagr_2y = _calculate_cagr(close, 2)
    cagr_3y = _calculate_cagr(close, 3)
    cagr_5y = _calculate_cagr(close, 5)
    ma_50 = close.rolling(window=50).mean()
    ma_200 = close.rolling(window=200).mean()
    golden_cross, death_cross = _detect_crossovers(ma_50, ma_200)
    price_vs_ma50 = (
        (close.iloc[-1] / ma_50.iloc[-1] - 1) if not pd.isna(ma_50.iloc[-1]) else 0
    )
    price_vs_ma200 = (
        (close.iloc[-1] / ma_200.iloc[-1] - 1) if not pd.isna(ma_200.iloc[-1]) else 0
    )
    recent_high = high.iloc[-20:].max()
    recent_low = low.iloc[-20:].min()
    resistance_1 = recent_high + (recent_high - recent_low) * 0.382
    resistance_2 = recent_high + (recent_high - recent_low) * 0.618
    support_1 = recent_low - (recent_high - recent_low) * 0.382
    support_2 = recent_low - (recent_high - recent_low) * 0.618
    avg_volume_50 = (
        volume.rolling(window=50).mean().iloc[-1]
        if len(volume) >= 50
        else volume.mean()
    )
    volume_trend = _detect_volume_trend(volume)
    return TechnicalPerformance(
        returns_1m=float(returns_1m) if not pd.isna(returns_1m) else None,
        returns_3m=float(returns_3m) if not pd.isna(returns_3m) else None,
        returns_6m=float(returns_6m) if not pd.isna(returns_6m) else None,
        returns_1y=float(returns_1y) if not pd.isna(returns_1y) else None,
        returns_3y=float(returns_3y) if not pd.isna(returns_3y) else None,
        returns_5y=float(returns_5y) if not pd.isna(returns_5y) else None,
        returns_10y=float(returns_10y) if not pd.isna(returns_10y) else None,
        cagr_2y=cagr_2y,
        cagr_3y=cagr_3y,
        cagr_5y=cagr_5y,
        golden_cross_detected=golden_cross,
        death_cross_detected=death_cross,
        price_vs_sma_50=float(price_vs_ma50),
        price_vs_sma_200=float(price_vs_ma200),
        pivot_resistance_1=float(resistance_1),
        pivot_resistance_2=float(resistance_2),
        pivot_support_1=float(support_1),
        pivot_support_2=float(support_2),
        volume_avg_50d=float(avg_volume_50),
        volume_trend=volume_trend,
    )


def _calculate_seasonal(close: pd.Series, index: pd.DatetimeIndex) -> SeasonalAnalysis:
    cutoff_date = index[-1] - pd.DateOffset(years=5)
    recent_mask = index >= cutoff_date
    close_recent = close[recent_mask]
    monthly_returns, monthly_win_rate = _calculate_monthly_returns(
        close_recent, index[recent_mask]
    )
    best_month_key = (
        max(monthly_returns, key=monthly_returns.get) if monthly_returns else None
    )
    worst_month_key = (
        min(monthly_returns, key=monthly_returns.get) if monthly_returns else None
    )
    best_month = (
        (best_month_key, monthly_returns[best_month_key]) if best_month_key else None
    )
    worst_month = (
        (worst_month_key, monthly_returns[worst_month_key]) if worst_month_key else None
    )
    quarterly_returns, quarterly_win_rate = _calculate_quarterly_returns(
        close_recent, index[recent_mask]
    )
    best_quarter_key = (
        max(quarterly_returns, key=quarterly_returns.get) if quarterly_returns else None
    )
    worst_quarter_key = (
        min(quarterly_returns, key=quarterly_returns.get) if quarterly_returns else None
    )
    best_quarter = (
        (best_quarter_key, quarterly_returns[best_quarter_key])
        if best_quarter_key
        else None
    )
    worst_quarter = (
        (worst_quarter_key, quarterly_returns[worst_quarter_key])
        if worst_quarter_key
        else None
    )
    weekday_returns, weekday_win_rate = _calculate_weekday_effect(close, index)
    return SeasonalAnalysis(
        monthly_returns=monthly_returns,
        monthly_win_rate=monthly_win_rate,
        best_month=best_month,
        worst_month=worst_month,
        quarterly_returns=quarterly_returns,
        quarterly_win_rate=quarterly_win_rate,
        best_quarter=best_quarter,
        worst_quarter=worst_quarter,
        day_of_week_effect=weekday_returns,
        day_of_week_win_rate=weekday_win_rate,
        earnings_season_impact=None,
    )


def _period_return(close: pd.Series, period: str) -> float:
    offsets = {
        "1M": pd.DateOffset(months=1),
        "3M": pd.DateOffset(months=3),
        "6M": pd.DateOffset(months=6),
        "1Y": pd.DateOffset(years=1),
        "3Y": pd.DateOffset(years=3),
        "5Y": pd.DateOffset(years=5),
        "10Y": pd.DateOffset(years=10),
    }
    if period not in offsets:
        return np.nan
    end_date = close.index[-1]
    start_date = end_date - offsets[period]
    available_dates = close.index[close.index >= start_date]
    if len(available_dates) == 0:
        return np.nan
    return (close.iloc[-1] / close.loc[available_dates[0]]) - 1


def _calculate_cagr(close: pd.Series, years: int) -> float | None:
    end_date = close.index[-1]
    start_date = end_date - pd.DateOffset(years=years)
    available_dates = close.index[close.index >= start_date]
    if len(available_dates) == 0:
        return None
    start_price = close.loc[available_dates[0]]
    end_price = close.iloc[-1]
    actual_days = (end_date - available_dates[0]).days
    if actual_days <= 0 or start_price <= 0:
        return None
    actual_years = actual_days / 365.25
    return float((end_price / start_price) ** (1 / actual_years) - 1)


def _detect_crossovers(ma1: pd.Series, ma2: pd.Series) -> tuple[bool, bool]:
    if len(ma1) < 2 or len(ma2) < 2:
        return False, False
    golden_cross = bool(
        (ma1.iloc[-2] <= ma2.iloc[-2]) and (ma1.iloc[-1] > ma2.iloc[-1])
    )
    death_cross = bool((ma1.iloc[-2] >= ma2.iloc[-2]) and (ma1.iloc[-1] < ma2.iloc[-1]))
    return golden_cross, death_cross


def _detect_volume_trend(volume: pd.Series) -> str:
    if len(volume) < 20:
        return "insufficient_data"
    recent_avg = volume.iloc[-20:].mean()
    prior_avg = volume.iloc[-40:-20].mean() if len(volume) >= 40 else recent_avg
    if recent_avg > prior_avg * 1.1:
        return "increasing"
    if recent_avg < prior_avg * 0.9:
        return "decreasing"
    return "stable"


def _calculate_recovery_days(drawdown: pd.Series) -> int:
    max_dd_idx = drawdown.idxmin()
    after_max = drawdown[max_dd_idx:]
    recovery_idx = after_max[after_max >= 0]
    if len(recovery_idx) > 0:
        return (recovery_idx.index[0] - max_dd_idx).days
    return -1


def _calculate_monthly_returns(
    close: pd.Series, index: pd.DatetimeIndex
) -> tuple[dict[str, float], dict[str, float]]:
    if len(close) < 365:
        return {}, {}
    returns = close.pct_change().dropna()
    df = pd.DataFrame({"return": returns})
    df["month"] = df.index.month
    df["positive"] = df["return"] > 0
    monthly_avg = df.groupby("month")["return"].mean()
    monthly_win = df.groupby("month")["positive"].mean()
    returns_dict = {f"month_{int(m)}": float(r) for m, r in monthly_avg.items()}
    win_rate_dict = {f"month_{int(m)}": float(w) for m, w in monthly_win.items()}
    return returns_dict, win_rate_dict


def _calculate_quarterly_returns(
    close: pd.Series, index: pd.DatetimeIndex
) -> tuple[dict[str, float], dict[str, float]]:
    if len(close) < 365:
        return {}, {}
    returns = close.pct_change().dropna()
    df = pd.DataFrame({"return": returns})
    df["quarter"] = df.index.quarter
    df["positive"] = df["return"] > 0
    quarterly_avg = df.groupby("quarter")["return"].mean()
    quarterly_win = df.groupby("quarter")["positive"].mean()
    returns_dict = {f"q{int(q)}": float(r) for q, r in quarterly_avg.items()}
    win_rate_dict = {f"q{int(q)}": float(w) for q, w in quarterly_win.items()}
    return returns_dict, win_rate_dict


def _calculate_weekday_effect(
    close: pd.Series, index: pd.DatetimeIndex
) -> tuple[dict[str, float], dict[str, float]]:
    if len(close) < 5:
        return {}, {}
    returns = close.pct_change().dropna()
    df = pd.DataFrame({"return": returns})
    df["weekday"] = df.index.dayofweek
    df["positive"] = df["return"] > 0
    weekday_avg = df.groupby("weekday")["return"].mean()
    weekday_win = df.groupby("weekday")["positive"].mean()
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    returns_dict = {days[int(d)]: float(r) for d, r in weekday_avg.items()}
    win_rate_dict = {days[int(d)]: float(w) for d, w in weekday_win.items()}
    return returns_dict, win_rate_dict
