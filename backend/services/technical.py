"""Technical analysis service — pure calculation logic."""

import pandas as pd
import numpy as np

from domain.models import TechnicalIndicators


def calculate_all(df: pd.DataFrame) -> TechnicalIndicators:
    """Calculate all technical indicators from OHLC DataFrame."""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"] if "volume" in df.columns else None
    current_price = float(close.iloc[-1]) if len(close) > 0 else None

    sma_20 = _safe_rolling(close, 20)
    sma_50 = _safe_rolling(close, 50)
    sma_100 = _safe_rolling(close, 100)
    sma_200 = _safe_rolling(close, 200)
    sma_365 = _safe_rolling(close, 365)

    ema_12 = _safe_ewm(close, 12)
    ema_26 = _safe_ewm(close, 26)
    ema_50 = _safe_ewm(close, 50)

    rsi_14 = _calc_rsi(close, 14) if len(close) >= 14 else None
    rsi_21 = _calc_rsi(close, 21) if len(close) >= 21 else None
    macd_val, macd_signal_val, macd_hist = (
        _calc_macd(close) if len(close) >= 26 else (None, None, None)
    )
    stoch_k, stoch_d = (
        _calc_stochastic(high, low, close) if len(close) >= 14 else (None, None)
    )
    williams_r = _calc_williams_r(high, low, close) if len(close) >= 14 else None

    bb_high = _bollinger_hband(close, 20) if len(close) >= 20 else None
    bb_mid = sma_20
    bb_low = _bollinger_lband(close, 20) if len(close) >= 20 else None
    bb_width = (
        float(bb_high - bb_low) if bb_high is not None and bb_low is not None else None
    )
    atr_14 = _atr(high, low, close, 14) if len(close) >= 14 else None
    atr_21 = _atr(high, low, close, 21) if len(close) >= 21 else None
    vol_30d = _volatility(close, 30) if len(close) >= 30 else None
    vol_90d = _volatility(close, 90) if len(close) >= 90 else None
    vol_365d = _volatility(close, 365) if len(close) >= 365 else None

    total_return = _calc_total_return(close, current_price)
    annualized_return = (
        _calc_annualized_return(close, current_price) if len(close) >= 252 else None
    )
    year_high = float(close.tail(252).max()) if len(close) >= 252 else None
    year_low = float(close.tail(252).min()) if len(close) >= 252 else None

    avg_volume_20d = (
        float(volume.tail(20).mean())
        if volume is not None and len(volume) >= 20
        else None
    )
    avg_volume_90d = (
        float(volume.tail(90).mean())
        if volume is not None and len(volume) >= 90
        else None
    )

    price_sma_200_ratio = (
        current_price / float(sma_200)
        if sma_200 is not None and current_price
        else None
    )

    return TechnicalIndicators(
        sma_20=_to_float(sma_20),
        sma_50=_to_float(sma_50),
        sma_100=_to_float(sma_100),
        sma_200=_to_float(sma_200),
        sma_365=_to_float(sma_365),
        ema_12=_to_float(ema_12),
        ema_26=_to_float(ema_26),
        ema_50=_to_float(ema_50),
        rsi_14=_to_float(rsi_14),
        rsi_21=_to_float(rsi_21),
        macd=_to_float(macd_val),
        macd_signal=_to_float(macd_signal_val),
        macd_histogram=_to_float(macd_hist),
        stoch_k=_to_float(stoch_k),
        stoch_d=_to_float(stoch_d),
        williams_r=_to_float(williams_r),
        bollinger_upper=_to_float(bb_high),
        bollinger_middle=_to_float(bb_mid),
        bollinger_lower=_to_float(bb_low),
        bollinger_width=bb_width,
        atr_14=_to_float(atr_14),
        atr_21=_to_float(atr_21),
        volatility_30d=_to_float(vol_30d),
        volatility_90d=_to_float(vol_90d),
        volatility_365d=_to_float(vol_365d),
        total_return=total_return,
        annualized_return=annualized_return,
        year_high=year_high,
        year_low=year_low,
        fifty_two_week_high=year_high,
        fifty_two_week_low=year_low,
        current_price=current_price,
        price_sma_200_ratio=price_sma_200_ratio,
        avg_volume_20d=avg_volume_20d,
        avg_volume_90d=avg_volume_90d,
    )


def _safe_rolling(series: pd.Series, window: int) -> pd.Series | None:
    return (
        series.rolling(window=window).mean().iloc[-1] if len(series) >= window else None
    )


def _safe_ewm(series: pd.Series, span: int) -> pd.Series | None:
    return (
        series.ewm(span=span, adjust=False).mean().iloc[-1]
        if len(series) >= span
        else None
    )


def _to_float(val) -> float | None:
    return float(val) if val is not None else None


def _calc_rsi(close: pd.Series, period: int = 14) -> float | None:
    try:
        from ta.momentum import RSIIndicator

        rsi = RSIIndicator(close, window=period)
        return float(rsi.rsi().iloc[-1]) if len(close) >= period else None
    except Exception:
        return None


def _calc_macd(close: pd.Series) -> tuple[float | None, float | None, float | None]:
    from ta.trend import MACD

    macd_indicator = MACD(close, window_fast=12, window_slow=26, window_sign=9)
    macd_line = macd_indicator.macd()
    signal_line = macd_indicator.macd_signal()
    histogram = macd_indicator.macd_diff()
    return (
        float(macd_line.iloc[-1])
        if macd_line is not None and len(macd_line) > 0
        else None,
        float(signal_line.iloc[-1])
        if signal_line is not None and len(signal_line) > 0
        else None,
        float(histogram.iloc[-1])
        if histogram is not None and len(histogram) > 0
        else None,
    )


def _calc_stochastic(
    high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
) -> tuple[float | None, float | None]:
    try:
        from ta.momentum import StochasticOscillator

        stoch = StochasticOscillator(high, low, close, window=period, smooth_window=3)
        k = stoch.stoch()
        d = stoch.stoch_signal()
        return (
            float(k.iloc[-1]) if k is not None and len(k) > 0 else None,
            float(d.iloc[-1]) if d is not None and len(d) > 0 else None,
        )
    except Exception:
        return None, None


def _calc_williams_r(
    high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
) -> float | None:
    try:
        from ta.momentum import WilliamsRIndicator

        williams = WilliamsRIndicator(high, low, close, lbp=period)
        wr = williams.williams_r()
        return float(wr.iloc[-1]) if wr is not None and len(wr) > 0 else None
    except Exception:
        return None


def _bollinger_hband(close: pd.Series, window: int = 20) -> float | None:
    try:
        from ta.volatility import BollingerBands

        bb = BollingerBands(close, window=window, window_dev=2)
        return float(bb.bollinger_hband().iloc[-1]) if len(close) >= window else None
    except Exception:
        return None


def _bollinger_lband(close: pd.Series, window: int = 20) -> float | None:
    try:
        from ta.volatility import BollingerBands

        bb = BollingerBands(close, window=window, window_dev=2)
        return float(bb.bollinger_lband().iloc[-1]) if len(close) >= window else None
    except Exception:
        return None


def _atr(
    high: pd.Series, low: pd.Series, close: pd.Series, window: int
) -> float | None:
    try:
        from ta.volatility import average_true_range

        return (
            float(average_true_range(high, low, close, window=window).iloc[-1])
            if len(close) >= window
            else None
        )
    except Exception:
        return None


def _volatility(close: pd.Series, window: int) -> float | None:
    if len(close) < window:
        return None
    return float(
        close.pct_change().rolling(window=window).std().iloc[-1] * np.sqrt(252) * 100
    )


def _calc_total_return(close: pd.Series, current_price: float | None) -> float | None:
    if len(close) == 0 or current_price is None:
        return None
    first_close = float(close.iloc[0])
    if first_close > 0:
        return ((current_price - first_close) / first_close) * 100
    return None


def _calc_annualized_return(
    close: pd.Series, current_price: float | None
) -> float | None:
    if len(close) < 252 or current_price is None:
        return None
    first_close = float(close.iloc[0])
    if first_close <= 0:
        return None
    years = len(close) / 252
    if years <= 0:
        return None
    return (((current_price / first_close) ** (1 / years)) - 1) * 100
