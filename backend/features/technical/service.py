"""
Technical analysis service.
"""

import pandas as pd
import numpy as np
import ta

from shared.domain import TechnicalIndicators


class TechnicalService:
    """Calculate technical indicators"""

    @staticmethod
    def calculate_all(df: pd.DataFrame) -> TechnicalIndicators:
        """Calculate all technical indicators"""
        close = df["close"]
        high = df["high"]
        low = df["low"]
        volume = df["volume"] if "volume" in df.columns else None
        current_price = float(close.iloc[-1]) if len(close) > 0 else None

        # --- SHORT-TERM MOVING AVERAGES ---
        sma_20 = close.rolling(window=20).mean().iloc[-1] if len(close) >= 20 else None
        sma_50 = close.rolling(window=50).mean().iloc[-1] if len(close) >= 50 else None

        # --- MEDIUM-TERM MOVING AVERAGES ---
        sma_100 = (
            close.rolling(window=100).mean().iloc[-1] if len(close) >= 100 else None
        )
        sma_200 = (
            close.rolling(window=200).mean().iloc[-1] if len(close) >= 200 else None
        )

        # --- LONG-TERM MOVING AVERAGES ---
        sma_365 = (
            close.rolling(window=365).mean().iloc[-1] if len(close) >= 365 else None
        )

        # --- EXPONENTIAL MOVING AVERAGES ---
        ema_12 = (
            close.ewm(span=12, adjust=False).mean().iloc[-1]
            if len(close) >= 12
            else None
        )
        ema_26 = (
            close.ewm(span=26, adjust=False).mean().iloc[-1]
            if len(close) >= 26
            else None
        )
        ema_50 = (
            close.ewm(span=50, adjust=False).mean().iloc[-1]
            if len(close) >= 50
            else None
        )

        # --- MOMENTUM INDICATORS ---
        rsi_14 = _calc_rsi(close, 14) if len(close) >= 14 else None
        rsi_21 = _calc_rsi(close, 21) if len(close) >= 21 else None

        # MACD
        macd_val, macd_signal_val, macd_hist = (
            _calc_macd(close) if len(close) >= 26 else (None, None, None)
        )

        # Stochastic oscillator
        stoch_k, stoch_d = (
            _calc_stochastic(high, low, close) if len(close) >= 14 else (None, None)
        )

        # Williams %R
        williams_r = _calc_williams_r(high, low, close) if len(close) >= 14 else None

        # --- VOLATILITY INDICATORS ---
        # Bollinger Bands
        bb_high = (
            ta.volatility.bollinger_hband(close, window=20, window_dev=2).iloc[-1]
            if len(close) >= 20
            else None
        )
        bb_mid = close.rolling(window=20).mean().iloc[-1] if len(close) >= 20 else None
        bb_low = (
            ta.volatility.bollinger_lband(close, window=20, window_dev=2).iloc[-1]
            if len(close) >= 20
            else None
        )

        # Bollinger Band width
        bb_width = None
        if bb_high is not None and bb_low is not None:
            bb_width = float(bb_high - bb_low)

        # ATR
        atr_14 = (
            ta.volatility.average_true_range(high, low, close, window=14).iloc[-1]
            if len(close) >= 14
            else None
        )
        atr_21 = (
            ta.volatility.average_true_range(high, low, close, window=21).iloc[-1]
            if len(close) >= 21
            else None
        )

        # Volatility calculations
        vol_30d = (
            close.pct_change().rolling(window=30).std().iloc[-1] * np.sqrt(252)
            if len(close) >= 30
            else None
        )
        vol_90d = (
            close.pct_change().rolling(window=90).std().iloc[-1] * np.sqrt(252)
            if len(close) >= 90
            else None
        )
        vol_365d = (
            close.pct_change().rolling(window=365).std().iloc[-1] * np.sqrt(252)
            if len(close) >= 365
            else None
        )

        # --- PERFORMANCE METRICS ---
        # Total return
        total_return = None
        if len(close) > 0:
            first_close = float(close.iloc[0])
            if first_close > 0 and current_price is not None:
                total_return = ((current_price - first_close) / first_close) * 100

        # Annualized return
        annualized_return = None
        if len(close) > 252 and total_return is not None:
            trading_days = len(close)
            years = trading_days / 252
            annualized_return = (
                ((((current_price / float(close.iloc[0])) ** (1 / years)) - 1) * 100)
                if years > 0
                else None
            )

        # Year high/low
        year_high = None
        year_low = None
        if len(close) >= 252:
            year_high = float(close.tail(252).max())
            year_low = float(close.tail(252).min())

        # 52-week high/low (same as year high/low)
        fifty_two_week_high = year_high
        fifty_two_week_low = year_low

        # Price to SMA 200 ratio
        price_sma_200_ratio = None
        if sma_200 is not None and float(sma_200) > 0 and current_price is not None:
            price_sma_200_ratio = current_price / float(sma_200)

        # --- VOLUME INDICATORS ---
        avg_volume_20d = None
        avg_volume_90d = None
        if volume is not None:
            if len(volume) >= 20:
                avg_volume_20d = float(volume.tail(20).mean())
            if len(volume) >= 90:
                avg_volume_90d = float(volume.tail(90).mean())

        return TechnicalIndicators(
            # Short-term MVAs
            sma_20=float(sma_20) if sma_20 else None,
            sma_50=float(sma_50) if sma_50 else None,
            # Medium-term MVAs
            sma_100=float(sma_100) if sma_100 else None,
            sma_200=float(sma_200) if sma_200 else None,
            # Long-term MVAs
            sma_365=float(sma_365) if sma_365 else None,
            # EMAs
            ema_12=float(ema_12) if ema_12 else None,
            ema_26=float(ema_26) if ema_26 else None,
            ema_50=float(ema_50) if ema_50 else None,
            # Momentum
            rsi_14=float(rsi_14) if rsi_14 else None,
            rsi_21=float(rsi_21) if rsi_21 else None,
            macd=float(macd_val) if macd_val else None,
            macd_signal=float(macd_signal_val) if macd_signal_val else None,
            macd_histogram=float(macd_hist) if macd_hist else None,
            stoch_k=float(stoch_k) if stoch_k is not None else None,
            stoch_d=float(stoch_d) if stoch_d is not None else None,
            williams_r=float(williams_r) if williams_r is not None else None,
            # Volatility
            bollinger_upper=float(bb_high) if bb_high else None,
            bollinger_middle=float(bb_mid) if bb_mid else None,
            bollinger_lower=float(bb_low) if bb_low else None,
            bollinger_width=bb_width,
            atr_14=float(atr_14) if atr_14 else None,
            atr_21=float(atr_21) if atr_21 else None,
            volatility_30d=float(vol_30d) if vol_30d else None,
            volatility_90d=float(vol_90d) if vol_90d else None,
            volatility_365d=float(vol_365d) if vol_365d else None,
            # Performance
            total_return=total_return,
            annualized_return=annualized_return,
            year_high=year_high,
            year_low=year_low,
            fifty_two_week_high=fifty_two_week_high,
            fifty_two_week_low=fifty_two_week_low,
            current_price=current_price,
            price_sma_200_ratio=price_sma_200_ratio,
            # Volume
            avg_volume_20d=avg_volume_20d,
            avg_volume_90d=avg_volume_90d,
        )


def _calc_rsi(close: pd.Series, period: int = 14) -> float | None:
    """Calculate RSI"""
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return float(rsi.iloc[-1]) if len(rsi) > 0 else None


def _calc_macd(
    close: pd.Series,
) -> tuple[float | None, float | None, float | None]:
    """Calculate MACD, signal line, and histogram"""
    from ta.trend import MACD

    macd_indicator = MACD(close, window_fast=12, window_slow=26, window_sign=9)
    macd_line = macd_indicator.macd()
    signal_line = macd_indicator.macd_signal()
    histogram = macd_indicator.macd_diff()

    macd_val = None
    signal_val = None
    hist_val = None

    if macd_line is not None and len(macd_line) > 0:
        macd_val = float(macd_line.iloc[-1])

    if signal_line is not None and len(signal_line) > 0:
        signal_val = float(signal_line.iloc[-1])

    if histogram is not None and len(histogram) > 0:
        hist_val = float(histogram.iloc[-1])

    return macd_val, signal_val, hist_val


def _calc_stochastic(
    high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
) -> tuple[float | None, float | None]:
    """Calculate Stochastic oscillator K and D"""
    try:
        from ta.momentum import StochasticOscillator

        stoch = StochasticOscillator(high, low, close, window=period, smooth_window=3)
        stoch_k = stoch.stoch()
        stoch_d = stoch.stoch_signal()

        k_val = (
            float(stoch_k.iloc[-1])
            if stoch_k is not None and len(stoch_k) > 0
            else None
        )
        d_val = (
            float(stoch_d.iloc[-1])
            if stoch_d is not None and len(stoch_d) > 0
            else None
        )

        return k_val, d_val
    except Exception:
        return None, None


def _calc_williams_r(
    high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
) -> float | None:
    """Calculate Williams %R"""
    try:
        from ta.momentum import WilliamsRIndicator

        williams = WilliamsRIndicator(high, low, close, lbp=period)
        wr = williams.williams_r()

        return float(wr.iloc[-1]) if wr is not None and len(wr) > 0 else None
    except Exception:
        return None, None
