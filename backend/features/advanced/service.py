"""
Advanced metrics calculation service.

Calculates comprehensive statistical, technical, and seasonal
metrics from historical OHLC data.
"""

import pandas as pd
import numpy as np
from shared.domain import (
    AdvancedMetrics,
    StatisticalMetrics,
    TechnicalPerformance,
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
        seasonal = AdvancedMetricsService._calculate_seasonal(close, df.index)

        return AdvancedMetrics(
            statistical=statistical,
            technical=technical,
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

        # Annualized CAGR for specific periods
        cagr_2y = AdvancedMetricsService._calculate_cagr(close, 2)  # 2-year CAGR
        cagr_3y = AdvancedMetricsService._calculate_cagr(close, 3)  # 3-year CAGR
        cagr_5y = AdvancedMetricsService._calculate_cagr(close, 5)  # 5-year CAGR

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

    @staticmethod
    def _calculate_seasonal(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> SeasonalAnalysis:
        """Calculate seasonal and cyclical patterns.

        Monthly/quarterly returns show the AVERAGE return for each calendar period,
        calculated across the last 5 years of available data (or all data if less than 5 years).
        """
        # Use only last 5 years of data for seasonal analysis (or all available if less)
        max_years = 5
        cutoff_date = index[-1] - pd.DateOffset(years=max_years)
        recent_mask = index >= cutoff_date
        close_recent = close[recent_mask]

        # Monthly returns - average return for each calendar month across last 5 years
        monthly_returns, monthly_win_rate = (
            AdvancedMetricsService._calculate_monthly_returns(
                close_recent, index[recent_mask]
            )
        )

        # Find best and worst month
        if monthly_returns:
            best_month_key = max(monthly_returns, key=monthly_returns.get)
            worst_month_key = min(monthly_returns, key=monthly_returns.get)
            best_month = (best_month_key, monthly_returns[best_month_key])
            worst_month = (worst_month_key, monthly_returns[worst_month_key])
        else:
            best_month = None
            worst_month = None

        # Quarterly returns - average return for each calendar quarter across last 5 years
        quarterly_returns, quarterly_win_rate = (
            AdvancedMetricsService._calculate_quarterly_returns(
                close_recent, index[recent_mask]
            )
        )

        # Find best and worst quarter
        if quarterly_returns:
            best_quarter_key = max(quarterly_returns, key=quarterly_returns.get)
            worst_quarter_key = min(quarterly_returns, key=quarterly_returns.get)
            best_quarter = (best_quarter_key, quarterly_returns[best_quarter_key])
            worst_quarter = (worst_quarter_key, quarterly_returns[worst_quarter_key])
        else:
            best_quarter = None
            worst_quarter = None

        # Day of week effect - average return for each weekday across all years
        weekday_returns, weekday_win_rate = (
            AdvancedMetricsService._calculate_weekday_effect(close, index)
        )

        # Earnings season impact (simplified - would need earnings dates)
        earnings_impact = None

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
    def _calculate_cagr(close: pd.Series, years: int) -> float | None:
        """Calculate annualized CAGR over specified number of years."""
        end_date = close.index[-1]
        start_date = end_date - pd.DateOffset(years=years)

        # Find closest available start date
        available_dates = close.index[close.index >= start_date]
        if len(available_dates) == 0:
            return None

        start_date_actual = available_dates[0]
        start_price = close.loc[start_date_actual]
        end_price = close.iloc[-1]

        # Calculate actual years held
        actual_days = (end_date - start_date_actual).days
        if actual_days <= 0:
            return None
        actual_years = actual_days / 365.25

        # Annualized CAGR formula: (end/start)^(1/years) - 1
        if start_price <= 0 or actual_years <= 0:
            return None

        cagr = (end_price / start_price) ** (1 / actual_years) - 1
        return float(cagr)

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

    @staticmethod
    def _calculate_monthly_returns(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> tuple[dict[str, float], dict[str, float]]:
        """Calculate average returns and win rate by calendar month across all years in dataset."""
        if len(close) < 365:  # Need at least 1 year of data
            return {}, {}

        returns = close.pct_change().dropna()
        returns_df = pd.DataFrame({"return": returns})
        returns_df["month"] = returns_df.index.month
        returns_df["positive"] = returns_df["return"] > 0

        monthly_avg = returns_df.groupby("month")["return"].mean()
        monthly_win = returns_df.groupby("month")["positive"].mean()

        returns_dict = {f"month_{int(m)}": float(r) for m, r in monthly_avg.items()}
        win_rate_dict = {f"month_{int(m)}": float(w) for m, w in monthly_win.items()}

        return returns_dict, win_rate_dict

    @staticmethod
    def _calculate_quarterly_returns(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> tuple[dict[str, float], dict[str, float]]:
        """Calculate average returns and win rate by calendar quarter across all years in dataset."""
        if len(close) < 365:  # Need at least 1 year of data
            return {}, {}

        returns = close.pct_change().dropna()
        returns_df = pd.DataFrame({"return": returns})
        returns_df["quarter"] = returns_df.index.quarter
        returns_df["positive"] = returns_df["return"] > 0

        quarterly_avg = returns_df.groupby("quarter")["return"].mean()
        quarterly_win = returns_df.groupby("quarter")["positive"].mean()

        returns_dict = {f"q{int(q)}": float(r) for q, r in quarterly_avg.items()}
        win_rate_dict = {f"q{int(q)}": float(w) for q, w in quarterly_win.items()}

        return returns_dict, win_rate_dict

    @staticmethod
    def _calculate_weekday_effect(
        close: pd.Series, index: pd.DatetimeIndex
    ) -> tuple[dict[str, float], dict[str, float]]:
        """Calculate average returns and win rate by day of week across all years in dataset."""
        if len(close) < 5:
            return {}, {}

        returns = close.pct_change().dropna()
        returns_df = pd.DataFrame({"return": returns})
        returns_df["weekday"] = returns_df.index.dayofweek
        returns_df["positive"] = returns_df["return"] > 0

        weekday_avg = returns_df.groupby("weekday")["return"].mean()
        weekday_win = returns_df.groupby("weekday")["positive"].mean()

        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        returns_dict = {days[int(d)]: float(r) for d, r in weekday_avg.items()}
        win_rate_dict = {days[int(d)]: float(w) for d, w in weekday_win.items()}

        return returns_dict, win_rate_dict
