"""
Application service that orchestrates stock analysis.
"""

import asyncio
from datetime import datetime

from shared.domain import (
    OHLCData,
    CompanyInfo,
    FundamentalData,
    TechnicalIndicators,
    AIInterpretation,
)
from shared.requests import AnalysisRequest
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
from core.helpers import get_current_price, create_snapshot_summary


class StockAnalyzer:
    """Orchestrates complete stock analysis"""

    def __init__(self):
        self.data_service = DataService()
        self.technical_service = TechnicalService()
        self.fundamental_service = FundamentalService()
        self.ai_service = AIService()

    async def analyze(self, ticker: str) -> StockAnalysisResponse:
        """Perform complete stock analysis"""
        # Fetch data concurrently
        ohlc, fundamentals, company_info = await asyncio.gather(
            self.data_service.get_ohlc(ticker),
            self.data_service.get_fundamentals(ticker),
            self.data_service.get_company_info(ticker),
        )

        # Convert OHLC to DataFrame
        import pandas as pd

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

        # Fundamental overview
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
        )

        # Snapshot summary
        snapshot = create_snapshot_summary(
            ticker=ticker,
            current_price=current_price,
            sma_200=tech_indicators.sma_200,
            pe_ratio=fundamentals.pe_ratio,
            fcf=fundamentals.free_cash_flow,
            rsi=tech_indicators.rsi_14,
        )

        # AI interpretation
        tech_summary = f"RSI: {tech_indicators.rsi_14}, MACD: {tech_indicators.macd}, SMA200: {tech_indicators.sma_200}, Price: {current_price:.2f}"
        fundamental_summary = f"P/E: {fundamentals.pe_ratio}, ROE: {fundamentals.roe}, D/E: {fundamentals.debt_to_equity}"
        news_summary = "News integration pending"

        ai_interpretation = self.ai_service.interpret(
            ticker=ticker,
            company_name=company_info.name,
            technical_summary=tech_summary,
            fundamental_summary=fundamental_summary,
            news_summary=news_summary,
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

        # Build response
        return StockAnalysisResponse(
            ticker=ticker,
            company_name=company_info.name,
            sector=company_info.sector,
            industry=company_info.industry,
            current_price=current_price,
            market_cap=fundamentals.market_cap,
            snapshot_summary=snapshot,
            technical_overview=technical_overview,
            fundamental_overview=fundamental_overview,
            ai_outlook=ai_outlook,
            disclaimer="⚠️ Not financial advice. For educational purposes only.",
            timestamp=datetime.now().isoformat(),
        )

    async def calculate_performance(self, ticker: str, purchase_date: str, quantity: float, purchase_price: float) -> PerformanceResponse:
        """Calculate stock performance from purchase date to current date"""
        try:
            # Get current price
            current_price = await self.data_service.get_current_price(ticker)
            
            # Calculate performance metrics
            total_cost = quantity * purchase_price
            current_value = quantity * current_price
            profit_loss = current_value - total_cost
            profit_loss_percentage = (profit_loss / total_cost) * 100 if total_cost != 0 else 0
            
            # Calculate annualized return
            purchase_date_dt = datetime.strptime(purchase_date, "%Y-%m-%d")
            current_date = datetime.now()
            days_held = (current_date - purchase_date_dt).days
            
            if days_held <= 0:
                raise ValueError("Purchase date must be in the past")
            
            years_held = days_held / 365.25
            annualized_return = ((current_price / purchase_price) ** (1 / years_held)) - 1 if years_held > 0 else 0
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
