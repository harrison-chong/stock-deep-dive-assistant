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

    async def analyze(self, ticker: str, period: str = "5y") -> StockAnalysisResponse:
        """Perform complete stock analysis"""
        # Fetch data concurrently (OHLC in parallel with ticker info)
        ohlc, (fundamentals, company_info, info) = await asyncio.gather(
            self.data_service.get_ohlc(ticker, period=period),
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
                MetricResponse(name="SMA 20", value=tech_indicators.sma_20),
                MetricResponse(name="SMA 50", value=tech_indicators.sma_50),
                MetricResponse(name="SMA 100", value=tech_indicators.sma_100),
                MetricResponse(name="SMA 200", value=tech_indicators.sma_200),
            ],
            momentum=[
                MetricResponse(name="RSI 14", value=tech_indicators.rsi_14),
                MetricResponse(name="MACD", value=tech_indicators.macd),
            ],
            volatility=[
                MetricResponse(name="ATR 14", value=tech_indicators.atr_14),
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
                    name="P/E Ratio",
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
                MetricResponse(name="Forward EPS", value=fundamentals.forward_eps),
                MetricResponse(name="Book Value", value=fundamentals.book_value),
                MetricResponse(name="Book/Share", value=fundamentals.book_per_share),
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

        # AI interpretation
        tech_summary = f"RSI: {tech_indicators.rsi_14}, MACD: {tech_indicators.macd}, MACD Signal: {tech_indicators.macd_signal}, SMA20: {tech_indicators.sma_20}, SMA50: {tech_indicators.sma_50}, SMA200: {tech_indicators.sma_200}, Price: {current_price:.2f}"
        fundamental_summary = f"P/E Ratio: {fundamentals.pe_ratio}, Forward P/E: {fundamentals.forward_pe}, ROE: {fundamentals.roe}%, Debt-to-Equity: {fundamentals.debt_to_equity}, Profit Margin: {fundamentals.profit_margin}%, Revenue Growth: {fundamentals.revenue_growth}%"
        news_summary = "News integration pending"

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
        )

        ai_outlook = AIOutlookResponse(
            overall_summary=ai_interpretation.overall_summary,
            bull_case=ai_interpretation.bull_case,
            bear_case=ai_interpretation.bear_case,
            risk_factors=ai_interpretation.risk_factors,
            neutral_scenario=ai_interpretation.neutral_scenario,
            recommendation=ai_interpretation.recommendation,
            recommendation_rationale=ai_interpretation.recommendation_rationale,
            confidence_score=ai_interpretation.confidence_score,
        )

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
            # Additional company info fields
            website=company_info.website,
            description=company_info.description,
            full_time_employees=company_info.full_time_employees,
            country=company_info.country,
            state=company_info.state,
            city=company_info.city,
            phone=company_info.phone,
            fax=company_info.fax,
            # Raw yfinance info dict for maximum data exposure
            extra_info=info,
            # Advanced metrics from OHLC data (period determined by user selection)
            advanced_metrics=advanced_metrics,
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
            company_info = await self.data_service.get_company_info(ticker)

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
