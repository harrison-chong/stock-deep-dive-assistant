"""
Advanced metrics calculation service.

Calculates comprehensive statistical, technical, pattern recognition, and seasonal
metrics from historical OHLC data.
"""

import pandas as pd
import numpy as np
from shared.domain import (
    AdvancedMetrics,
    StatisticalMetrics,
    TechnicalPerformance,
    PatternDetection,
    SeasonalAnalysis,
)


class AdvancedMetricsService:
    """Service for calculating advanced metrics from OHLC data."""

    @staticmethod
    def calculate_all(
        df: pd.DataFrame, risk_free_rate: float = 0.02
    ) -> AdvancedMetrics:
        """
        Calculate all advanced metrics.

        Args:
            df: DataFrame with columns: open, high, low, close, volume and DatetimeIndex
            risk_free_rate: Annual risk-free rate (default 2%)

        Returns:
            AdvancedMetrics object containing all calculated metrics
        """
        # Make a copy to avoid modifying original
        df = df.copy()
        close = df["close"]
        high = df["high"]
        low = df["low"]
        volume = df["volume"]

        # Calculate returns
        daily_returns = close.pct_change().dropna()

        # Ensure index is datetime for resampling
        if not isinstance(df.index, pd.DatetimeIndex):
            raise ValueError("DataFrame index must be DatetimeIndex")

        statistical = AdvancedMetricsService._calculate_statistical(
            close, daily_returns, risk_free_rate
        )
        technical = AdvancedMetricsService._calculate_technical(
            close, high, low, volume, df.index
        )
        patterns = AdvancedMetricsService._calculate_patterns(close, high, low, volume)
        seasonal = AdvancedMetricsService._calculate_seasonal(close, df.index)

        return AdvancedMetrics(
            statistical=statistical,
            technical=technical,
            patterns=patterns,
            seasonal=seasonal,
        )

    @staticmethod
    def _calculate_statistical(
        close: pd.Series, daily_returns: pd.Series, risk_free_rate: float
    ) -> StatisticalMetrics:
        """Calculate statistical and risk-adjusted metrics."""
        total_return = (close.iloc[-1] / close.iloc[0]) - 1
        years = len(close) / 252  # Trading days per year
        annualized_return = (1 + total_return) ** (1 / years) - 1 if years > 0 else 0
        annualized_volatility = daily_returns.std() * np.sqrt(252)

        # Sharpe ratio
        excess_return = annualized_return - risk_free_rate
        sharpe_ratio = (
            excess_return / annualized_volatility if annualized_volatility != 0 else 0
        )

        # Sortino ratio (downside deviation)
        downside_returns = daily_returns[daily_returns < 0]
        downside_deviation = (
            downside_returns.std() * np.sqrt(252) if len(downside_returns) > 0 else 0
        )
        sortino_ratio = (
            excess_return / downside_deviation if downside_deviation != 0 else 0
        )

        # Maximum drawdown
        rolling_max = close.expanding().max()
        drawdown = (close - rolling_max) / rolling_max
        max_drawdown = drawdown.min()

        # CAGR
        cagr = (close.iloc[-1] / close.iloc[0]) ** (1 / years) - 1 if years > 0 else 0

        # Calmar ratio
        calmar_ratio = cagr / abs(max_drawdown) if max_drawdown != 0 else 0

        # Value at Risk (95% confidence, 1-day)
        var_95 = np.percentile(daily_returns, 5)

        # Skewness and Kurtosis
        skewness = daily_returns.skew()
        kurtosis = daily_returns.kurtosis()

        # Ulcer Index
        drawdown_squared = drawdown**2
        ulcer_index = np.sqrt(drawdown_squared.mean())

        # Recovery days (time to recover from max drawdown)
        recovery_days = AdvancedMetricsService._calculate_recovery_days(drawdown)

        # Beta and Alpha (if benchmark provided)
        beta = 0.0
        alpha = 0.0
        r_squared = 0.0
        # Note: would need benchmark_returns parameter

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
            beta=float(beta),
            alpha=float(alpha),
            r_squared=float(r_squared),
        )

    @staticmethod
    def _calculate_technical(
        close: pd.Series,
        high: pd.Series,
        low: pd.Series,
        volume: pd.Series,
        index: pd.DatetimeIndex,
    ) -> TechnicalPerformance:
        """Calculate technical performance metrics."""
        # Multi-period returns
        returns_1m = AdvancedMetricsService._period_return(close, "1M")
        returns_3m = AdvancedMetricsService._period_return(close, "3M")
        returns_6m = AdvancedMetricsService._period_return(close, "6M")
        returns_1y = AdvancedMetricsService._period_return(close, "1Y")
        returns_3y = AdvancedMetricsService._period_return(close, "3Y")
        returns_5y = AdvancedMetricsService._period_return(close, "5Y")
        returns_10y = AdvancedMetricsService._period_return(close, "10Y")

        # Moving average crossovers
        ma_50 = close.rolling(window=50).mean()
        ma_200 = close.rolling(window=200).mean()
        golden_cross, death_cross = AdvancedMetricsService._detect_crossovers(
            ma_50, ma_200
        )

        # Relative strength (vs SMA)
        price_vs_ma50 = (
            (close.iloc[-1] / ma_50.iloc[-1] - 1) if not pd.isna(ma_50.iloc[-1]) else 0
        )
        price_vs_ma200 = (
            (close.iloc[-1] / ma_200.iloc[-1] - 1)
            if not pd.isna(ma_200.iloc[-1])
            else 0
        )

        # Pivot points (recent high/low)
        recent_high = high.iloc[-20:].max()  # 20-day high
        recent_low = low.iloc[-20:].min()  # 20-day low
        resistance_1 = recent_high + (recent_high - recent_low) * 0.382
        resistance_2 = recent_high + (recent_high - recent_low) * 0.618
        support_1 = recent_low - (recent_high - recent_low) * 0.382
        support_2 = recent_low - (recent_high - recent_low) * 0.618

        # Volume trend
        avg_volume_50 = (
            volume.rolling(window=50).mean().iloc[-1]
            if len(volume) >= 50
            else volume.mean()
        )
        volume_trend = AdvancedMetricsService._detect_volume_trend(volume)

        return TechnicalPerformance(
            returns_1m=float(returns_1m) if not pd.isna(returns_1m) else None,
            returns_3m=float(returns_3m) if not pd.isna(returns_3m) else None,
            returns_6m=float(returns_6m) if not pd.isna(returns_6m) else None,
            returns_1y=float(returns_1y) if not pd.isna(returns_1y) else None,
            returns_3y=float(returns_3y) if not pd.isna(returns_3y) else None,
            returns_5y=float(returns_5y) if not pd.isna(returns_5y) else None,
            returns_10y=float(returns_10y) if not pd.isna(returns_10y) else None,
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

    @staticmethod
    def _calculate_patterns(
        close: pd.Series, high: pd.Series, low: pd.Series, volume: pd.Series
    ) -> PatternDetection:
        """Detect chart patterns and technical signals."""
        # Simple pattern detection (in production would use more sophisticated algorithms)
        double_top = AdvancedMetricsService._detect_double_top(high)
        double_bottom = AdvancedMetricsService._detect_double_bottom(low)
        head_shoulders = False  # Placeholder
        inverted_head_shoulders = False  # Placeholder
        triangle = False  # Placeholder
        flag = False  # Placeholder
        cup_handle = False  # Placeholder

        # ADX (Average Directional Index) - simplified
        adx = AdvancedMetricsService._calculate_adx(high, low, close)

        # Gap analysis
        gap_up, gap_down = AdvancedMetricsService._detect_gaps(close)

        return PatternDetection(
            head_and_shoulders=head_shoulders,
            inverted_head_and_shoulders=inverted_head_shoulders,
            double_top=double_top,
            double_bottom=double_bottom,
            triangle_pattern=triangle,
            flag_pattern=flag,
            cup_and_handle=cup_handle,
            adx=float(adx),
            gap_up_detected=gap_up,
            gap_down_detected=gap_down,
            support_break=False,
            resistance_break=False,
        )

    @staticmethod
    def _calculate_seasonal(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> SeasonalAnalysis:
        """Calculate seasonal and cyclical patterns."""
        # Monthly returns
        monthly_returns = AdvancedMetricsService._calculate_monthly_returns(
            close, index
        )

        # Quarterly returns
        quarterly_returns = AdvancedMetricsService._calculate_quarterly_returns(
            close, index
        )

        # Day of week effect
        weekday_returns = AdvancedMetricsService._calculate_weekday_effect(close, index)

        # Earnings season impact (simplified - would need earnings dates)
        earnings_impact = None

        return SeasonalAnalysis(
            monthly_returns=monthly_returns,
            quarterly_returns=quarterly_returns,
            day_of_week_effect=weekday_returns,
            earnings_season_impact=earnings_impact,
        )

    @staticmethod
    def _period_return(close: pd.Series, period: str) -> float:
        """Calculate return over specified period."""
        if period == "1M":
            offset = pd.DateOffset(months=1)
        elif period == "3M":
            offset = pd.DateOffset(months=3)
        elif period == "6M":
            offset = pd.DateOffset(months=6)
        elif period == "1Y":
            offset = pd.DateOffset(years=1)
        elif period == "3Y":
            offset = pd.DateOffset(years=3)
        elif period == "5Y":
            offset = pd.DateOffset(years=5)
        elif period == "10Y":
            offset = pd.DateOffset(years=10)
        else:
            return np.nan

        # Find the closest date offset from the end
        end_date = close.index[-1]
        start_date = end_date - offset

        # Find closest available start date
        available_dates = close.index[close.index >= start_date]
        if len(available_dates) == 0:
            return np.nan

        start_date_actual = available_dates[0]
        start_price = close.loc[start_date_actual]
        end_price = close.iloc[-1]

        return (end_price / start_price) - 1

    @staticmethod
    def _detect_crossovers(ma1: pd.Series, ma2: pd.Series) -> tuple[bool, bool]:
        """Detect golden cross (MA50 > MA200) and death cross (MA50 < MA200)."""
        if len(ma1) < 2 or len(ma2) < 2:
            return False, False

        # Check recent values
        latest_ma1 = ma1.iloc[-1]
        latest_ma2 = ma2.iloc[-1]
        prev_ma1 = ma1.iloc[-2]
        prev_ma2 = ma2.iloc[-2]

        golden_cross = (prev_ma1 <= prev_ma2) and (latest_ma1 > latest_ma2)
        death_cross = (prev_ma1 >= prev_ma2) and (latest_ma1 < latest_ma2)

        return golden_cross, death_cross

    @staticmethod
    def _detect_volume_trend(volume: pd.Series) -> str:
        """Detect volume trend: increasing, decreasing, or stable."""
        if len(volume) < 20:
            return "insufficient_data"

        recent_avg = volume.iloc[-20:].mean()
        prior_avg = volume.iloc[-40:-20].mean() if len(volume) >= 40 else recent_avg

        if recent_avg > prior_avg * 1.1:
            return "increasing"
        elif recent_avg < prior_avg * 0.9:
            return "decreasing"
        else:
            return "stable"

    @staticmethod
    def _detect_double_top(high: pd.Series) -> bool:
        """Simple double top detection (placeholder)."""
        # In production, would analyze peaks with tolerance
        return False

    @staticmethod
    def _detect_double_bottom(low: pd.Series) -> bool:
        """Simple double bottom detection (placeholder)."""
        # In production, would analyze troughs with tolerance
        return False

    @staticmethod
    def _calculate_adx(
        high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
    ) -> float:
        """Calculate Average Directional Index (ADX)."""
        # Simplified ADX calculation
        if len(high) < period + 1:
            return 0.0

        # Calculate +DM and -DM
        plus_dm = high.diff()
        minus_dm = low.diff()
        plus_dm = plus_dm.where(plus_dm > 0, 0)
        minus_dm = minus_dm.where(minus_dm < 0, 0).abs()

        # True Range
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

        # Smoothed averages
        tr_smooth = tr.rolling(window=period).mean()
        plus_dm_smooth = plus_dm.rolling(window=period).mean()
        minus_dm_smooth = minus_dm.rolling(window=period).mean()

        # +DI and -DI
        plus_di = 100 * (plus_dm_smooth / tr_smooth)
        minus_di = 100 * (minus_dm_smooth / tr_smooth)

        # DX
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
        adx = dx.rolling(window=period).mean()

        return float(adx.iloc[-1]) if not pd.isna(adx.iloc[-1]) else 0.0

    @staticmethod
    def _detect_gaps(
        close: pd.Series, threshold_pct: float = 0.02
    ) -> tuple[bool, bool]:
        """Detect price gaps (opening gap from previous close)."""
        if len(close) < 2:
            return False, False

        # Calculate gap percentage (current open vs previous close)
        # Note: need open prices for accurate gap detection
        # Using high-low spread as proxy
        gap_detected_up = False
        gap_detected_down = False

        # Placeholder implementation - would need actual open prices
        return gap_detected_up, gap_detected_down

    @staticmethod
    def _calculate_monthly_returns(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> dict[str, float]:
        """Calculate average returns by month."""
        if len(close) < 30:
            return {}

        returns = close.pct_change().dropna()
        returns_df = pd.DataFrame({"return": returns})

        monthly = returns_df.groupby(returns_df.index.month).mean()["return"]
        return {f"month_{int(m)}": float(r) for m, r in monthly.items()}

    @staticmethod
    def _calculate_quarterly_returns(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> dict[str, float]:
        """Calculate average returns by quarter."""
        if len(close) < 60:
            return {}

        returns = close.pct_change().dropna()
        returns_df = pd.DataFrame({"return": returns})

        quarterly = returns_df.groupby(returns_df.index.quarter).mean()["return"]
        return {f"q{int(q)}": float(r) for q, r in quarterly.items()}

    @staticmethod
    def _calculate_weekday_effect(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> dict[str, float]:
        """Calculate average returns by day of week."""
        if len(close) < 5:
            return {}

        returns = close.pct_change().dropna()
        returns_df = pd.DataFrame({"return": returns})

        weekday = returns_df.groupby(returns_df.index.dayofweek).mean()["return"]
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        return {days[int(d)]: float(r) for d, r in weekday.items()}

    @staticmethod
    def _calculate_recovery_days(drawdown: pd.Series) -> int:
        """Calculate days to recover from max drawdown."""
        max_dd_idx = drawdown.idxmin()

        # Find when drawdown returns to 0 or positive after max drawdown
        after_max = drawdown[max_dd_idx:]
        recovery_idx = after_max[after_max >= 0]

        if len(recovery_idx) > 0:
            recovery_date = recovery_idx.index[0]
            recovery_duration = (recovery_date - max_dd_idx).days
            return recovery_duration
        else:
            return -1  # Never recovered
