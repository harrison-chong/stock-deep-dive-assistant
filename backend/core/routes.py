"""
API routes
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime

from core.models import (
    AnalysisRequest,
    StockAnalysisResponse,
    MetricResponse,
    TechnicalOverviewResponse,
    FundamentalOverviewResponse,
    AIOutlookResponse,
)
from core.services import DataService, TechnicalService, FundamentalService, AIService
from core.helpers import is_valid_ticker, get_current_price, create_snapshot_summary
from core.types import OHLCData

router = APIRouter()
data_service = DataService()
tech_service = TechnicalService()
fundamental_service = FundamentalService()
ai_service = AIService()


@router.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: AnalysisRequest):
    """
    Comprehensive stock analysis endpoint
    """
    ticker = request.ticker.upper()

    if not is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        # Fetch data
        ohlc = await data_service.get_ohlc(ticker)
        fundamentals = await data_service.get_fundamentals(ticker)
        company_info = await data_service.get_company_info(ticker)

        # Convert OHLC to DataFrame
        df = ohlc.to_dataframe() if hasattr(ohlc, "to_dataframe") else _ohlc_to_df(ohlc)

        # Calculate indicators
        tech_indicators = tech_service.calculate_all(df)
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
        fundamental_interpretations = fundamental_service.get_interpretations(
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

        ai_interpretation = await ai_service.interpret(
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

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")


def _ohlc_to_df(ohlc: "OHLCData"):
    """Convert OHLCData to DataFrame"""
    import pandas as pd

    return pd.DataFrame(
        {
            "open": ohlc.open,
            "high": ohlc.high,
            "low": ohlc.low,
            "close": ohlc.close,
            "volume": ohlc.volume,
        },
        index=ohlc.timestamp,
    )
