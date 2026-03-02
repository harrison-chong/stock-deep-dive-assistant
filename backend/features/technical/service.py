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

        # Moving averages
        sma_20 = close.rolling(window=20).mean().iloc[-1] if len(close) >= 20 else None
        sma_50 = close.rolling(window=50).mean().iloc[-1] if len(close) >= 50 else None
        sma_100 = (
            close.rolling(window=100).mean().iloc[-1] if len(close) >= 100 else None
        )
        sma_200 = (
            close.rolling(window=200).mean().iloc[-1] if len(close) >= 200 else None
        )

        # Exponential moving averages
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

        # RSI
        rsi_14 = _calc_rsi(close, 14) if len(close) >= 14 else None

        # MACD
        macd_val, macd_signal = _calc_macd(close) if len(close) >= 26 else (None, None)

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

        # ATR
        atr_14 = (
            ta.volatility.average_true_range(high, low, close, window=14).iloc[-1]
            if len(close) >= 14
            else None
        )

        # Volatility
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

        return TechnicalIndicators(
            sma_20=float(sma_20) if sma_20 else None,
            sma_50=float(sma_50) if sma_50 else None,
            sma_100=float(sma_100) if sma_100 else None,
            sma_200=float(sma_200) if sma_200 else None,
            ema_12=float(ema_12) if ema_12 else None,
            ema_26=float(ema_26) if ema_26 else None,
            rsi_14=float(rsi_14) if rsi_14 else None,
            macd=float(macd_val) if macd_val else None,
            macd_signal=float(macd_signal) if macd_signal else None,
            bollinger_upper=float(bb_high) if bb_high else None,
            bollinger_middle=float(bb_mid) if bb_mid else None,
            bollinger_lower=float(bb_low) if bb_low else None,
            atr_14=float(atr_14) if atr_14 else None,
            volatility_30d=float(vol_30d) if vol_30d else None,
            volatility_90d=float(vol_90d) if vol_90d else None,
        )


def _calc_rsi(close: pd.Series, period: int = 14) -> float | None:
    """Calculate RSI"""
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return float(rsi.iloc[-1])


def _calc_macd(close: pd.Series) -> tuple[float | None, float | None]:
    """Calculate MACD and signal line using ta library"""
    from ta.trend import MACD

    macd_indicator = MACD(close, window_fast=12, window_slow=26, window_sign=9)
    macd_line = macd_indicator.macd()
    signal_line = macd_indicator.macd_signal()

    if macd_line is not None and len(macd_line) > 0:
        macd_val = float(macd_line.iloc[-1])
        signal_val = (
            float(signal_line.iloc[-1])
            if signal_line is not None and len(signal_line) > 0
            else None
        )
        return macd_val, signal_val
    return None, None
