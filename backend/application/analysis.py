"""
Application service that orchestrates stock analysis.
"""

import asyncio
from datetime import datetime
import pandas as pd

from shared.responses import (
    StockAnalysisResponse,
    TechnicalOverviewResponse,
    FundamentalOverviewResponse,
    AIOutlookResponse,
    MetricResponse,
    PerformanceResponse,
)
from features.data.service import DataService
from features.technical.service import TechnicalService
from features.fundamental.service import FundamentalService
from features.ai.service import AIService
from features.advanced.service import AdvancedMetricsService
from core.helpers import get_current_price


class StockAnalyzer:
    """Orchestrates complete stock analysis"""

    def __init__(self):
        self.data_service = DataService()
        self.technical_service = TechnicalService()
        self.fundamental_service = FundamentalService()
        self.ai_service = AIService()
        self.advanced_service = AdvancedMetricsService()

    async def analyze(
        self,
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> StockAnalysisResponse:
        """Perform complete stock analysis without AI (AI is loaded on-demand)"""
        # Fetch data concurrently (OHLC in parallel with ticker info)
        ohlc, (fundamentals, company_info, info) = await asyncio.gather(
            self.data_service.get_ohlc(
                ticker, period=period, start_date=start_date, end_date=end_date
            ),
            self.data_service.get_ticker_info(ticker),
        )

        # Convert OHLC to DataFrame
        df = pd.DataFrame(
            {
                "open": ohlc.open,
                "high": ohlc.high,
                "low": ohlc.low,
                "close": ohlc.close,
                "volume": ohlc.volume,
            },
            index=ohlc.timestamp,
        )

        # Calculate technical indicators
        tech_indicators = self.technical_service.calculate_all(df)
        current_price = get_current_price(df)

        # Calculate advanced metrics
        advanced_metrics = self.advanced_service.calculate_all(df)

        # Technical overview
        technical_overview = TechnicalOverviewResponse(
            moving_averages=[
                MetricResponse(name="SMA 20", value=tech_indicators.sma_20, unit="$"),
                MetricResponse(name="SMA 50", value=tech_indicators.sma_50, unit="$"),
                MetricResponse(name="SMA 100", value=tech_indicators.sma_100, unit="$"),
                MetricResponse(name="SMA 200", value=tech_indicators.sma_200, unit="$"),
            ],
            momentum=[
                MetricResponse(name="RSI 14", value=tech_indicators.rsi_14, unit=""),
                MetricResponse(name="MACD", value=tech_indicators.macd, unit="$"),
            ],
            volatility=[
                MetricResponse(name="ATR 14", value=tech_indicators.atr_14, unit="$"),
                MetricResponse(
                    name="Volatility 30D",
                    value=tech_indicators.volatility_30d,
                    unit="%",
                ),
                MetricResponse(
                    name="Volatility 90D",
                    value=tech_indicators.volatility_90d,
                    unit="%",
                ),
            ],
        )

        # Fundamental overview - comprehensive coverage of all metrics
        fundamental_interpretations = self.fundamental_service.get_interpretations(
            fundamentals
        )

        fundamental_overview = FundamentalOverviewResponse(
            profitability=[
                MetricResponse(
                    name="ROE",
                    value=fundamentals.roe,
                    interpretation=fundamental_interpretations.get("roe"),
                    unit="%",
                ),
                MetricResponse(
                    name="Profit Margin", value=fundamentals.profit_margin, unit="%"
                ),
            ],
            valuation=[
                MetricResponse(
                    name="P/E Ratio (TTM)",
                    value=fundamentals.pe_ratio,
                    interpretation=fundamental_interpretations.get("pe_ratio"),
                ),
                MetricResponse(
                    name="Forward P/E",
                    value=fundamentals.forward_pe,
                    interpretation=fundamental_interpretations.get("forward_pe"),
                ),
                MetricResponse(
                    name="PEG Ratio",
                    value=fundamentals.peg_ratio,
                    interpretation=fundamental_interpretations.get("peg_ratio"),
                ),
            ],
            financial_strength=[
                MetricResponse(
                    name="Debt-to-Equity",
                    value=fundamentals.debt_to_equity,
                    interpretation=fundamental_interpretations.get("debt_to_equity"),
                ),
                MetricResponse(
                    name="Dividend Yield",
                    value=fundamentals.dividend_yield,
                    interpretation=fundamental_interpretations.get("dividend_yield"),
                    unit="%",
                ),
            ],
            growth=[
                MetricResponse(
                    name="Revenue Growth",
                    value=fundamentals.revenue_growth,
                    interpretation=fundamental_interpretations.get("revenue_growth"),
                    unit="%",
                ),
            ],
            # New categories with additional yfinance data
            market_data=[
                MetricResponse(
                    name="Previous Close", value=fundamentals.previous_close
                ),
                MetricResponse(name="Day High", value=fundamentals.day_high),
                MetricResponse(name="Day Low", value=fundamentals.day_low),
                MetricResponse(name="Bid", value=fundamentals.bid),
                MetricResponse(name="Ask", value=fundamentals.ask),
                MetricResponse(name="Volume", value=fundamentals.volume, unit="shares"),
                MetricResponse(
                    name="Avg Volume", value=fundamentals.average_volume, unit="shares"
                ),
                MetricResponse(name="52W High", value=fundamentals.fifty_two_week_high),
                MetricResponse(name="52W Low", value=fundamentals.fifty_two_week_low),
            ],
            liquidity_valuation=[
                MetricResponse(
                    name="Enterprise Value", value=fundamentals.enterprise_value
                ),
                MetricResponse(name="Price/Book", value=fundamentals.price_to_book),
                MetricResponse(name="Price/Sales", value=fundamentals.price_to_sales),
                MetricResponse(
                    name="EV/EBITDA", value=fundamentals.enterprise_to_ebitda
                ),
                MetricResponse(
                    name="Trailing PEG", value=fundamentals.trailing_peg_ratio
                ),
            ],
            earnings=[
                MetricResponse(name="EPS (TTM)", value=fundamentals.eps, unit="$"),
                MetricResponse(
                    name="Forward EPS", value=fundamentals.forward_eps, unit="$"
                ),
                MetricResponse(
                    name="Book Value", value=fundamentals.book_value, unit="$"
                ),
                MetricResponse(
                    name="Book/Share", value=fundamentals.book_per_share, unit="$"
                ),
                MetricResponse(
                    name="Earnings Growth", value=fundamentals.earnings_growth, unit="%"
                ),
                MetricResponse(
                    name="Quarterly Growth",
                    value=fundamentals.earnings_quarterly_growth,
                    unit="%",
                ),
            ],
            margins=[
                MetricResponse(
                    name="Return on Assets",
                    value=fundamentals.return_on_assets,
                    unit="%",
                ),
                MetricResponse(
                    name="Return on Investment",
                    value=fundamentals.return_on_investment,
                    unit="%",
                ),
                MetricResponse(
                    name="Gross Margins", value=fundamentals.gross_margins, unit="%"
                ),
                MetricResponse(
                    name="Operating Margins",
                    value=fundamentals.operating_margins,
                    unit="%",
                ),
            ],
        )

        # AI is NOT generated here - only returned as None (loaded on-demand via /analyze/ai)
        ai_outlook = None

        # Build chart data from OHLC with SMA calculations
        closes = list(ohlc.close)
        timestamps = list(ohlc.timestamp)

        # Calculate SMAs
        def calculate_sma(values: list, period: int) -> list:
            result = []
            for i in range(len(values)):
                if i < period - 1:
                    result.append(None)
                else:
                    sma = sum(values[i - period + 1 : i + 1]) / period
                    result.append(round(sma, 2))
            return result

        sma20 = calculate_sma(closes, 20)
        sma50 = calculate_sma(closes, 50)
        sma200 = calculate_sma(closes, 200)

        chart_data = [
            {
                "date": ts.strftime("%Y-%m-%d") if hasattr(ts, "strftime") else str(ts),
                "close": float(close),
                "sma20": sma20[i],
                "sma50": sma50[i],
                "sma200": sma200[i],
            }
            for i, (ts, close) in enumerate(zip(timestamps, closes))
        ]

        # Build response - include all available data
        return StockAnalysisResponse(
            ticker=ticker,
            company_name=company_info.name,
            sector=company_info.sector,
            industry=company_info.industry,
            current_price=current_price,
            currency=company_info.currency,
            market_cap=fundamentals.market_cap,
            technical_overview=technical_overview,
            fundamental_overview=fundamental_overview,
            ai_outlook=ai_outlook,
            disclaimer="⚠️ Not financial advice. For educational purposes only.",
            timestamp=datetime.now().isoformat(),
            data_start_date=ohlc.start_date.isoformat() if ohlc.start_date else None,
            data_end_date=ohlc.end_date.isoformat() if ohlc.end_date else None,
            chart_data=chart_data,
            # Additional company info fields
            website=company_info.website,
            description=company_info.description,
            full_time_employees=company_info.full_time_employees,
            country=company_info.country,
            state=company_info.state,
            city=company_info.city,
            phone=company_info.phone,
            fax=company_info.fax,
            # Advanced metrics from OHLC data (period determined by user selection)
            advanced_metrics=advanced_metrics,
            regular_market_change=fundamentals.regular_market_change,
            regular_market_change_percent=fundamentals.regular_market_change_percent,
            beta=fundamentals.beta,
            earnings_timestamp=fundamentals.earnings_timestamp,
            target_mean_price=fundamentals.target_mean_price,
            target_median_price=fundamentals.target_median_price,
            dividend_rate=fundamentals.dividend_rate,
            forward_dividend_yield=fundamentals.forward_dividend_yield,
            ebitda=fundamentals.ebitda,
            total_cash=fundamentals.total_cash,
            total_debt=fundamentals.total_debt,
            total_cash_per_share=fundamentals.total_cash_per_share,
            current_ratio=fundamentals.current_ratio,
            quick_ratio=fundamentals.quick_ratio,
            payout_ratio=fundamentals.payout_ratio,
            free_cash_flow=fundamentals.free_cash_flow,
            operating_cash_flow=fundamentals.operating_cash_flow,
            shares_outstanding=fundamentals.shares_outstanding,
            revenue_per_share=fundamentals.revenue_per_share,
            held_percent_insiders=fundamentals.held_percent_insiders,
            held_percent_institutions=fundamentals.held_percent_institutions,
            number_of_analyst_opinions=fundamentals.number_of_analyst_opinions,
            recommendation_key=fundamentals.recommendation_key,
            recommendation_mean=fundamentals.recommendation_mean,
            average_analyst_rating=fundamentals.average_analyst_rating,
            target_high_price=fundamentals.target_high_price,
            target_low_price=fundamentals.target_low_price,
            fifty_day_average=fundamentals.fifty_day_average,
            two_hundred_day_average=fundamentals.two_hundred_day_average,
            shares_short=fundamentals.shares_short,
            short_ratio=fundamentals.short_ratio,
            short_percent_of_float=fundamentals.short_percent_of_float,
            float_shares=fundamentals.float_shares,
            fifty_two_week_change=fundamentals.fifty_two_week_change,
            s_and_p_fifty_two_week_change=fundamentals.s_and_p_fifty_two_week_change,
            all_time_high=fundamentals.all_time_high,
            all_time_low=fundamentals.all_time_low,
            trailing_annual_dividend_rate=fundamentals.trailing_annual_dividend_rate,
            trailing_annual_dividend_yield=fundamentals.trailing_annual_dividend_yield,
            five_year_avg_dividend_yield=fundamentals.five_year_avg_dividend_yield,
        )

    async def generate_ai_outlook(
        self,
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> AIOutlookResponse:
        """Generate AI outlook on-demand (re-fetches data and generates AI analysis)"""
        # Fetch data concurrently
        ohlc, (fundamentals, company_info, info) = await asyncio.gather(
            self.data_service.get_ohlc(
                ticker, period=period, start_date=start_date, end_date=end_date
            ),
            self.data_service.get_ticker_info(ticker),
        )

        # Convert OHLC to DataFrame
        df = pd.DataFrame(
            {
                "open": ohlc.open,
                "high": ohlc.high,
                "low": ohlc.low,
                "close": ohlc.close,
                "volume": ohlc.volume,
            },
            index=ohlc.timestamp,
        )

        # Calculate indicators
        tech_indicators = self.technical_service.calculate_all(df)
        current_price = get_current_price(df)
        advanced_metrics = self.advanced_service.calculate_all(df)

        # Build summaries
        tech_summary = f"RSI: {tech_indicators.rsi_14}, MACD: {tech_indicators.macd}, MACD Signal: {tech_indicators.macd_signal}, SMA20: {tech_indicators.sma_20}, SMA50: {tech_indicators.sma_50}, SMA200: {tech_indicators.sma_200}, Price: {current_price:.2f}"
        fundamental_summary = f"P/E Ratio: {fundamentals.pe_ratio}, Forward P/E: {fundamentals.forward_pe}, ROE: {fundamentals.roe}%, Debt-to-Equity: {fundamentals.debt_to_equity}, Profit Margin: {fundamentals.profit_margin}%, Revenue Growth: {fundamentals.revenue_growth}%"
        news_summary = "News integration pending"

        # Prepare additional fundamentals for AI analysis (new metrics not in existing summary)
        additional_fundamentals = {
            "market_cap": fundamentals.market_cap,
            "ebitda": fundamentals.ebitda,
            "enterprise_value": fundamentals.enterprise_value,
            "price_to_book": fundamentals.price_to_book,
            "price_to_sales": fundamentals.price_to_sales,
            "ev_ebitda": fundamentals.enterprise_to_ebitda,
            "total_cash": fundamentals.total_cash,
            "total_debt": fundamentals.total_debt,
            "current_ratio": fundamentals.current_ratio,
            "quick_ratio": fundamentals.quick_ratio,
            "payout_ratio": fundamentals.payout_ratio,
            "cash_per_share": fundamentals.total_cash_per_share,
            "free_cash_flow": fundamentals.free_cash_flow,
            "operating_cash_flow": fundamentals.operating_cash_flow,
            "eps": fundamentals.eps,
            "forward_eps": fundamentals.forward_eps,
            "book_value": fundamentals.book_value,
            "return_on_assets": fundamentals.return_on_assets,
            "return_on_investment": fundamentals.return_on_investment,
            "gross_margins": fundamentals.gross_margins,
            "operating_margins": fundamentals.operating_margins,
            "number_of_analyst_opinions": fundamentals.number_of_analyst_opinions,
            "recommendation_mean": fundamentals.recommendation_mean,
            "target_high_price": fundamentals.target_high_price,
            "target_low_price": fundamentals.target_low_price,
            "fifty_day_average": fundamentals.fifty_day_average,
            "two_hundred_day_average": fundamentals.two_hundred_day_average,
            "shares_outstanding": fundamentals.shares_outstanding,
            "float_shares": fundamentals.float_shares,
            "insider_ownership": fundamentals.held_percent_insiders,
            "institutional_ownership": fundamentals.held_percent_institutions,
            "shares_short": fundamentals.shares_short,
            "short_ratio": fundamentals.short_ratio,
            "short_percent_of_float": fundamentals.short_percent_of_float,
            "trailing_annual_dividend_rate": fundamentals.trailing_annual_dividend_rate,
            "trailing_annual_dividend_yield": fundamentals.trailing_annual_dividend_yield,
            "dividend_rate": fundamentals.dividend_rate,
            "dividend_yield": fundamentals.dividend_yield,
            "beta": fundamentals.beta,
            "fifty_two_week_change": fundamentals.fifty_two_week_change,
            "s_and_p_fifty_two_week_change": fundamentals.s_and_p_fifty_two_week_change,
            "all_time_high": fundamentals.all_time_high,
            "all_time_low": fundamentals.all_time_low,
            "fifty_two_week_high": fundamentals.fifty_two_week_high,
            "fifty_two_week_low": fundamentals.fifty_two_week_low,
        }

        # Prepare advanced metrics for AI analysis
        advanced_metrics_dict = {
            "statistical": {
                "total_return": advanced_metrics.statistical.total_return,
                "annualized_return": advanced_metrics.statistical.annualized_return,
                "annualized_volatility": advanced_metrics.statistical.annualized_volatility,
                "sharpe_ratio": advanced_metrics.statistical.sharpe_ratio,
                "sortino_ratio": advanced_metrics.statistical.sortino_ratio,
                "calmar_ratio": advanced_metrics.statistical.calmar_ratio,
                "max_drawdown": advanced_metrics.statistical.max_drawdown,
                "var_95": advanced_metrics.statistical.var_95,
                "ulcer_index": advanced_metrics.statistical.ulcer_index,
                "recovery_days": advanced_metrics.statistical.recovery_days,
                "skewness": advanced_metrics.statistical.skewness,
                "kurtosis": advanced_metrics.statistical.kurtosis,
            },
            "technical": {
                "returns_1m": advanced_metrics.technical.returns_1m,
                "returns_3m": advanced_metrics.technical.returns_3m,
                "returns_6m": advanced_metrics.technical.returns_6m,
                "returns_1y": advanced_metrics.technical.returns_1y,
                "price_vs_sma_50": advanced_metrics.technical.price_vs_sma_50,
                "price_vs_sma_200": advanced_metrics.technical.price_vs_sma_200,
                "golden_cross_detected": advanced_metrics.technical.golden_cross_detected,
                "death_cross_detected": advanced_metrics.technical.death_cross_detected,
                "pivot_resistance_1": advanced_metrics.technical.pivot_resistance_1,
                "pivot_resistance_2": advanced_metrics.technical.pivot_resistance_2,
                "pivot_support_1": advanced_metrics.technical.pivot_support_1,
                "pivot_support_2": advanced_metrics.technical.pivot_support_2,
                "volume_avg_50d": advanced_metrics.technical.volume_avg_50d,
                "volume_trend": advanced_metrics.technical.volume_trend,
            },
            "seasonal": {
                "monthly_returns": advanced_metrics.seasonal.monthly_returns
                if advanced_metrics.seasonal
                else None,
                "quarterly_returns": advanced_metrics.seasonal.quarterly_returns
                if advanced_metrics.seasonal
                else None,
                "day_of_week_effect": advanced_metrics.seasonal.day_of_week_effect
                if advanced_metrics.seasonal
                else None,
            },
        }

        ai_interpretation = self.ai_service.interpret(
            ticker=ticker,
            company_name=company_info.name,
            technical_summary=tech_summary,
            fundamental_summary=fundamental_summary,
            news_summary=news_summary,
            advanced_metrics=advanced_metrics_dict,
            additional_fundamentals=additional_fundamentals,
        )

        return AIOutlookResponse(
            overall_summary=ai_interpretation.overall_summary,
            bull_case=ai_interpretation.bull_case,
            bear_case=ai_interpretation.bear_case,
            risk_factors=ai_interpretation.risk_factors,
            neutral_scenario=ai_interpretation.neutral_scenario,
            recommendation=ai_interpretation.recommendation,
            recommendation_rationale=ai_interpretation.recommendation_rationale,
            confidence_score=ai_interpretation.confidence_score,
        )

    async def calculate_performance(
        self, ticker: str, purchase_date: str, quantity: float, purchase_price: float
    ) -> PerformanceResponse:
        """Calculate stock performance from purchase date to current date"""
        try:
            # Get current price
            current_price = await self.data_service.get_current_price(ticker)

            # Calculate performance metrics
            total_cost = quantity * purchase_price
            current_value = quantity * current_price
            profit_loss = current_value - total_cost
            profit_loss_percentage = (
                (profit_loss / total_cost) * 100 if total_cost != 0 else 0
            )

            # Calculate annualized return
            purchase_date_dt = datetime.strptime(purchase_date, "%Y-%m-%d")
            current_date = datetime.now()
            days_held = (current_date - purchase_date_dt).days

            if days_held <= 0:
                raise ValueError("Purchase date must be in the past")

            years_held = days_held / 365.25
            annualized_return = (
                ((current_price / purchase_price) ** (1 / years_held)) - 1
                if years_held > 0
                else 0
            )
            annualized_return_percentage = annualized_return * 100

            # Get company info
            _, company_info, _ = await self.data_service.get_ticker_info(ticker)

            return PerformanceResponse(
                ticker=ticker,
                company_name=company_info.name,
                purchase_date=purchase_date,
                current_date=current_date.strftime("%Y-%m-%d"),
                quantity=quantity,
                purchase_price=purchase_price,
                current_price=current_price,
                total_cost=total_cost,
                current_value=current_value,
                profit_loss=profit_loss,
                profit_loss_percentage=profit_loss_percentage,
                annualized_return=annualized_return,
                annualized_return_percentage=annualized_return_percentage,
                disclaimer="⚠️ Not financial advice. For educational purposes only.",
                timestamp=datetime.now().isoformat(),
            )

        except Exception as e:
            raise ValueError(f"Performance calculation failed: {str(e)}")
