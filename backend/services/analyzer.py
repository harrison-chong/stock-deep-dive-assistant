"""Stock analysis orchestrator service."""

from datetime import datetime, timedelta
from typing import Any
import time as time_module

import pandas as pd

from domain.models import (
    TickerInfo,
    CompanyInfo,
    ValuationMetrics,
    ProfitabilityMetrics,
    GrowthMetrics,
    DividendMetrics,
    FinancialHealth,
    OwnershipData,
    AnalystData,
    MarketData,
    AIInterpretation,
)
from infrastructure.logging import app_logger
from sources.base import DataSource
from services import fundamental as fundamental_service
from services import technical as technical_service
from services import advanced as advanced_service
from services import ai as ai_service


def _pct(val: float | None) -> float | None:
    """Convert decimal ratio to percentage (e.g., 0.15 -> 15.0)."""
    return (val or 0) * 100 if val is not None else None


class StockAnalyzer:
    """Orchestrates complete stock analysis."""

    def __init__(self, data_source: DataSource):
        self.data_source = data_source
        # OHLC cache: ticker -> (fetched_at, OHLCData), 5-minute TTL
        self._ohlc_cache: dict[str, tuple[datetime, Any]] = {}

    def _reconstruct_ohlc(self, data: dict) -> Any:
        """Reconstruct OHLCData from a dict (e.g., passed from frontend)."""
        from domain.models import OHLCData
        from datetime import datetime as dt

        timestamps = data.get("timestamp", [])
        return OHLCData(
            timestamp=[
                dt.fromisoformat(ts) if isinstance(ts, str) else ts for ts in timestamps
            ],
            open=data.get("open", []),
            high=data.get("high", []),
            low=data.get("low", []),
            close=data.get("close", []),
            volume=data.get("volume", []),
            start_date=dt.fromisoformat(data["start_date"])
            if data.get("start_date")
            else None,
            end_date=dt.fromisoformat(data["end_date"])
            if data.get("end_date")
            else None,
        )

    async def _get_ohlc(
        self,
        ticker: str,
        period: str | None,
        start_date: str | None,
        end_date: str | None,
    ) -> Any:
        """Return cached OHLC if fresh (< 5 min), otherwise fetch and cache."""
        now = datetime.now()
        cache_key = f"{ticker}"
        if cache_key in self._ohlc_cache:
            cached_time, cached = self._ohlc_cache[cache_key]
            if now - cached_time < timedelta(minutes=5):
                app_logger.debug(f"Reusing cached OHLC for {ticker}")
                return cached

        ohlc = await self.data_source.fetch_ohlc(
            ticker, period=period, start_date=start_date, end_date=end_date
        )
        self._ohlc_cache[cache_key] = (now, ohlc)
        return ohlc

    async def analyze(
        self,
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> dict:
        """Perform complete stock analysis without AI."""
        _maybe_cold_start_delay()
        ohlc = await self._get_ohlc(ticker, period, start_date, end_date)
        info_dict = await self.data_source.fetch_ticker_info_cached(ticker)

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

        ticker_info = _parse_ticker_info(ticker, info_dict)
        tech_indicators = technical_service.calculate_all(df)
        advanced_metrics = advanced_service.calculate_all(df)
        current_price = float(df["close"].iloc[-1]) if not df.empty else None

        return _build_analysis_response(
            ticker, ticker_info, ohlc, tech_indicators, advanced_metrics, current_price
        )

    async def generate_ai_outlook(
        self,
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        ohlc_data: dict | None = None,
        ticker_info_data: dict | None = None,
    ) -> AIInterpretation:
        """Generate AI outlook on-demand."""
        _maybe_cold_start_delay()
        if ohlc_data is None or ticker_info_data is None:
            ohlc = await self._get_ohlc(ticker, period, start_date, end_date)
            info_dict = await self.data_source.fetch_ticker_info_cached(ticker)
        else:
            ohlc = self._reconstruct_ohlc(ohlc_data)
            info_dict = ticker_info_data

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

        ticker_info = _parse_ticker_info(ticker, info_dict)
        tech_indicators = technical_service.calculate_all(df)
        current_price = float(df["close"].iloc[-1]) if not df.empty else None
        advanced_metrics = advanced_service.calculate_all(df)

        tech_summary = f"RSI: {tech_indicators.rsi_14}, MACD: {tech_indicators.macd}, SMA20: {tech_indicators.sma_20}, SMA50: {tech_indicators.sma_50}, SMA200: {tech_indicators.sma_200}, Price: {current_price:.2f}"

        dte = (
            ticker_info.financial_health.total_debt
            / ticker_info.financial_health.total_cash
            if (
                ticker_info.financial_health.total_cash
                and ticker_info.financial_health.total_cash > 0
            )
            else None
        )
        fundamental_summary = f"P/E: {ticker_info.valuation.pe_ratio}, Forward P/E: {ticker_info.valuation.forward_pe}, ROE: {ticker_info.profitability.roe}%, Debt-to-Equity: {dte}, Profit Margin: {ticker_info.profitability.profit_margin}%, Revenue Growth: {ticker_info.growth.revenue_growth}%"

        additional_fundamentals = {
            "market_cap": ticker_info.valuation.market_cap,
            "ebitda": ticker_info.financial_health.ebitda,
            "enterprise_value": ticker_info.valuation.enterprise_value,
            "price_to_book": ticker_info.valuation.price_to_book,
            "price_to_sales": ticker_info.valuation.price_to_sales,
            "ev_ebitda": ticker_info.valuation.enterprise_to_ebitda,
            "total_cash": ticker_info.financial_health.total_cash,
            "total_debt": ticker_info.financial_health.total_debt,
            "current_ratio": ticker_info.financial_health.current_ratio,
            "quick_ratio": ticker_info.financial_health.quick_ratio,
            "payout_ratio": ticker_info.dividend.payout_ratio,
            "cash_per_share": ticker_info.financial_health.total_cash_per_share,
            "free_cash_flow": ticker_info.financial_health.free_cash_flow,
            "operating_cash_flow": ticker_info.financial_health.operating_cash_flow,
            "eps": ticker_info.eps,
            "forward_eps": ticker_info.forward_eps,
            "book_value": ticker_info.book_value,
            "return_on_assets": ticker_info.profitability.return_on_assets,
            "return_on_investment": ticker_info.profitability.return_on_investment,
            "gross_margins": ticker_info.profitability.gross_margins,
            "operating_margins": ticker_info.profitability.operating_margins,
            "number_of_analyst_opinions": ticker_info.analyst.number_of_analyst_opinions,
            "recommendation_mean": ticker_info.analyst.recommendation_mean,
            "target_high_price": ticker_info.analyst.target_high_price,
            "target_low_price": ticker_info.analyst.target_low_price,
            "fifty_day_average": ticker_info.market.fifty_day_average,
            "two_hundred_day_average": ticker_info.market.two_hundred_day_average,
            "shares_outstanding": ticker_info.ownership.shares_outstanding,
            "float_shares": ticker_info.ownership.float_shares,
            "insider_ownership": ticker_info.ownership.held_percent_insiders,
            "institutional_ownership": ticker_info.ownership.held_percent_institutions,
            "shares_short": ticker_info.ownership.shares_short,
            "short_ratio": ticker_info.ownership.short_ratio,
            "short_percent_of_float": ticker_info.ownership.short_percent_of_float,
            "trailing_annual_dividend_rate": ticker_info.dividend.trailing_annual_dividend_rate,
            "trailing_annual_dividend_yield": ticker_info.dividend.trailing_annual_dividend_yield,
            "dividend_rate": ticker_info.dividend.dividend_rate,
            "dividend_yield": ticker_info.dividend.dividend_yield,
            "beta": ticker_info.market.beta,
            "fifty_two_week_change": ticker_info.market.fifty_two_week_change,
            "s_and_p_fifty_two_week_change": ticker_info.market.s_and_p_fifty_two_week_change,
            "all_time_high": ticker_info.market.all_time_high,
            "all_time_low": ticker_info.market.all_time_low,
            "fifty_two_week_high": ticker_info.market.fifty_two_week_high,
            "fifty_two_week_low": ticker_info.market.fifty_two_week_low,
        }

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

        return ai_service.interpret(
            ticker=ticker,
            company_name=ticker_info.company.name,
            technical_summary=tech_summary,
            fundamental_summary=fundamental_summary,
            news_summary="News integration pending",
            advanced_metrics=advanced_metrics_dict,
            additional_fundamentals=additional_fundamentals,
        )


def _parse_ticker_info(ticker: str, info: dict) -> TickerInfo:
    """Parse raw Yahoo Finance info dict into domain model."""
    return TickerInfo(
        ticker=ticker,
        company=CompanyInfo(
            ticker=ticker,
            name=info.get("longName", ticker),
            sector=info.get("sector"),
            industry=info.get("industry"),
            website=info.get("website"),
            description=info.get("longBusinessSummary"),
            currency=info.get("currency"),
            full_time_employees=info.get("fullTimeEmployees"),
            country=info.get("country"),
            state=info.get("state"),
            city=info.get("city"),
            phone=info.get("phone"),
            fax=info.get("fax"),
        ),
        valuation=ValuationMetrics(
            market_cap=info.get("marketCap"),
            pe_ratio=info.get("trailingPE"),
            forward_pe=info.get("forwardPE"),
            peg_ratio=info.get("pegRatio"),
            price_to_book=info.get("priceToBook"),
            price_to_sales=info.get("priceToSalesTrailing12Months"),
            enterprise_value=info.get("enterpriseValue"),
            enterprise_to_ebitda=info.get("enterpriseToEbitda"),
        ),
        profitability=ProfitabilityMetrics(
            profit_margin=_pct(info.get("profitMargins")),
            gross_margins=_pct(info.get("grossMargins")),
            operating_margins=_pct(info.get("operatingMargins")),
            roe=_pct(info.get("returnOnEquity")),
            return_on_assets=_pct(info.get("returnOnAssets")),
            return_on_investment=_pct(info.get("returnOnInvestment")),
        ),
        growth=GrowthMetrics(
            revenue_growth=_pct(info.get("revenueGrowth")),
            earnings_growth=_pct(info.get("earningsGrowth")),
            earnings_quarterly_growth=_pct(info.get("earningsQuarterlyGrowth")),
        ),
        dividend=DividendMetrics(
            dividend_yield=info.get("dividendYield"),
            dividend_rate=info.get("dividendRate"),
            payout_ratio=_pct(info.get("payoutRatio")),
            trailing_annual_dividend_rate=info.get("trailingAnnualDividendRate"),
            trailing_annual_dividend_yield=_pct(
                info.get("trailingAnnualDividendYield")
            ),
            five_year_avg_dividend_yield=info.get("fiveYearAvgDividendYield"),
        ),
        financial_health=FinancialHealth(
            ebitda=info.get("ebitda"),
            total_cash=info.get("totalCash"),
            total_debt=info.get("totalDebt"),
            total_cash_per_share=info.get("totalCashPerShare"),
            current_ratio=info.get("currentRatio"),
            quick_ratio=info.get("quickRatio"),
            free_cash_flow=info.get("freeCashflow"),
            operating_cash_flow=info.get("operatingCashflow"),
            payout_ratio=_pct(info.get("payoutRatio")),
            revenue_per_share=info.get("revenuePerShare"),
        ),
        ownership=OwnershipData(
            shares_outstanding=info.get("sharesOutstanding"),
            float_shares=info.get("floatShares"),
            held_percent_insiders=_pct(info.get("heldPercentInsiders")),
            held_percent_institutions=_pct(info.get("heldPercentInstitutions")),
            shares_short=info.get("sharesShort"),
            short_ratio=info.get("shortRatio"),
            short_percent_of_float=_pct(info.get("shortPercentOfFloat")),
            implied_shares_outstanding=info.get("impliedSharesOutstanding"),
        ),
        analyst=AnalystData(
            number_of_analyst_opinions=info.get("numberOfAnalystOpinions"),
            recommendation_key=info.get("recommendationKey"),
            recommendation_mean=info.get("recommendationMean"),
            average_analyst_rating=info.get("averageAnalystRating"),
            target_mean_price=info.get("targetMeanPrice"),
            target_median_price=info.get("targetMedianPrice"),
            target_high_price=info.get("targetHighPrice"),
            target_low_price=info.get("targetLowPrice"),
        ),
        market=MarketData(
            previous_close=info.get("previousClose"),
            day_high=info.get("dayHigh"),
            day_low=info.get("dayLow"),
            bid=info.get("bid"),
            ask=info.get("ask"),
            volume=info.get("volume"),
            average_volume=info.get("averageVolume"),
            fifty_two_week_high=info.get("fiftyTwoWeekHigh"),
            fifty_two_week_low=info.get("fiftyTwoWeekLow"),
            fifty_two_week_change=_pct(info.get("52WeekChange")),
            s_and_p_fifty_two_week_change=_pct(info.get("SandP52WeekChange")),
            all_time_high=info.get("allTimeHigh"),
            all_time_low=info.get("allTimeLow"),
            fifty_day_average=info.get("fiftyDayAverage"),
            two_hundred_day_average=info.get("twoHundredDayAverage"),
            beta=info.get("beta"),
            regular_market_change=info.get("regularMarketChange"),
            regular_market_change_percent=info.get("regularMarketChangePercent"),
            earnings_timestamp=info.get("earningsTimestamp"),
            forward_dividend_yield=info.get("dividendYield"),
        ),
        eps=info.get("trailingEps"),
        forward_eps=info.get("forwardEps"),
        book_value=info.get("bookValue"),
        book_per_share=info.get("bookPerShare"),
    )


def _build_analysis_response(
    ticker, ticker_info, ohlc, tech_indicators, advanced_metrics, current_price
) -> dict:
    """Build the analysis response dict."""
    interpretations = fundamental_service.get_interpretations(ticker_info)
    closes = list(ohlc.close)
    timestamps = list(ohlc.timestamp)

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

    val = ticker_info.valuation
    profit = ticker_info.profitability
    growth = ticker_info.growth
    div = ticker_info.dividend
    fin = ticker_info.financial_health
    mkt = ticker_info.market
    analyst = ticker_info.analyst
    own = ticker_info.ownership

    dte = (
        fin.total_debt / fin.total_cash
        if (fin.total_cash and fin.total_cash > 0)
        else None
    )

    fundamental_categories = {
        "profitability": [
            {
                "name": "ROE",
                "value": profit.roe,
                "interpretation": interpretations.get("roe"),
                "unit": "%",
            },
            {"name": "Profit Margin", "value": profit.profit_margin, "unit": "%"},
        ],
        "valuation": [
            {
                "name": "P/E Ratio (TTM)",
                "value": val.pe_ratio,
                "interpretation": interpretations.get("pe_ratio"),
            },
            {
                "name": "Forward P/E",
                "value": val.forward_pe,
                "interpretation": interpretations.get("forward_pe"),
            },
            {
                "name": "PEG Ratio",
                "value": val.peg_ratio,
                "interpretation": interpretations.get("peg_ratio"),
            },
        ],
        "financial_strength": [
            {
                "name": "Debt-to-Equity",
                "value": dte,
                "interpretation": interpretations.get("debt_to_equity"),
            },
            {
                "name": "Dividend Yield",
                "value": div.dividend_yield,
                "interpretation": interpretations.get("dividend_yield"),
                "unit": "%",
            },
        ],
        "growth": [
            {
                "name": "Revenue Growth",
                "value": growth.revenue_growth,
                "interpretation": interpretations.get("revenue_growth"),
                "unit": "%",
            }
        ],
        "market_data": [
            {"name": "Previous Close", "value": mkt.previous_close},
            {"name": "Day High", "value": mkt.day_high},
            {"name": "Day Low", "value": mkt.day_low},
            {"name": "Volume", "value": mkt.volume, "unit": "shares"},
            {"name": "Avg Volume", "value": mkt.average_volume, "unit": "shares"},
            {"name": "52W High", "value": mkt.fifty_two_week_high},
            {"name": "52W Low", "value": mkt.fifty_two_week_low},
        ],
        "liquidity_valuation": [
            {"name": "Enterprise Value", "value": val.enterprise_value},
            {"name": "Price/Book", "value": val.price_to_book},
            {"name": "Price/Sales", "value": val.price_to_sales},
            {"name": "EV/EBITDA", "value": val.enterprise_to_ebitda},
        ],
        "earnings": [
            {"name": "EPS (TTM)", "value": ticker_info.eps, "unit": "$"},
            {"name": "Forward EPS", "value": ticker_info.forward_eps, "unit": "$"},
            {"name": "Book Value", "value": ticker_info.book_value, "unit": "$"},
            {"name": "Earnings Growth", "value": growth.earnings_growth, "unit": "%"},
            {
                "name": "Quarterly Growth",
                "value": growth.earnings_quarterly_growth,
                "unit": "%",
            },
        ],
        "margins": [
            {"name": "Return on Assets", "value": profit.return_on_assets, "unit": "%"},
            {
                "name": "Return on Investment",
                "value": profit.return_on_investment,
                "unit": "%",
            },
            {"name": "Gross Margins", "value": profit.gross_margins, "unit": "%"},
            {
                "name": "Operating Margins",
                "value": profit.operating_margins,
                "unit": "%",
            },
        ],
    }

    technical_categories = {
        "moving_averages": [
            {"name": "SMA 20", "value": tech_indicators.sma_20, "unit": "$"},
            {"name": "SMA 50", "value": tech_indicators.sma_50, "unit": "$"},
            {"name": "SMA 100", "value": tech_indicators.sma_100, "unit": "$"},
            {"name": "SMA 200", "value": tech_indicators.sma_200, "unit": "$"},
        ],
        "momentum": [
            {"name": "RSI 14", "value": tech_indicators.rsi_14, "unit": ""},
            {"name": "MACD", "value": tech_indicators.macd, "unit": "$"},
        ],
        "volatility": [
            {"name": "ATR 14", "value": tech_indicators.atr_14, "unit": "$"},
            {
                "name": "Volatility 30D",
                "value": tech_indicators.volatility_30d,
                "unit": "%",
            },
            {
                "name": "Volatility 90D",
                "value": tech_indicators.volatility_90d,
                "unit": "%",
            },
        ],
    }

    return {
        "ticker": ticker,
        "company_name": ticker_info.company.name,
        "sector": ticker_info.company.sector,
        "industry": ticker_info.company.industry,
        "current_price": current_price,
        "currency": ticker_info.company.currency,
        "market_cap": val.market_cap,
        "technical_overview": technical_categories,
        "fundamental_overview": fundamental_categories,
        "ai_outlook": None,
        "disclaimer": "Not financial advice. For educational purposes only.",
        "timestamp": datetime.now().isoformat(),
        "data_start_date": ohlc.start_date.isoformat() if ohlc.start_date else None,
        "data_end_date": ohlc.end_date.isoformat() if ohlc.end_date else None,
        "chart_data": chart_data,
        "website": ticker_info.company.website,
        "description": ticker_info.company.description,
        "full_time_employees": ticker_info.company.full_time_employees,
        "country": ticker_info.company.country,
        "state": ticker_info.company.state,
        "city": ticker_info.company.city,
        "phone": ticker_info.company.phone,
        "fax": ticker_info.company.fax,
        "advanced_metrics": advanced_metrics,
        "regular_market_change": mkt.regular_market_change,
        "regular_market_change_percent": mkt.regular_market_change_percent,
        "beta": mkt.beta,
        "earnings_timestamp": mkt.earnings_timestamp,
        "target_mean_price": analyst.target_mean_price,
        "target_median_price": analyst.target_median_price,
        "dividend_rate": div.dividend_rate,
        "forward_dividend_yield": mkt.forward_dividend_yield,
        "ebitda": fin.ebitda,
        "total_cash": fin.total_cash,
        "total_debt": fin.total_debt,
        "total_cash_per_share": fin.total_cash_per_share,
        "current_ratio": fin.current_ratio,
        "quick_ratio": fin.quick_ratio,
        "payout_ratio": div.payout_ratio,
        "free_cash_flow": fin.free_cash_flow,
        "operating_cash_flow": fin.operating_cash_flow,
        "shares_outstanding": own.shares_outstanding,
        "revenue_per_share": fin.revenue_per_share,
        "held_percent_insiders": own.held_percent_insiders,
        "held_percent_institutions": own.held_percent_institutions,
        "number_of_analyst_opinions": analyst.number_of_analyst_opinions,
        "recommendation_key": analyst.recommendation_key,
        "recommendation_mean": analyst.recommendation_mean,
        "average_analyst_rating": analyst.average_analyst_rating,
        "target_high_price": analyst.target_high_price,
        "target_low_price": analyst.target_low_price,
        "fifty_day_average": mkt.fifty_day_average,
        "two_hundred_day_average": mkt.two_hundred_day_average,
        "shares_short": own.shares_short,
        "short_ratio": own.short_ratio,
        "short_percent_of_float": own.short_percent_of_float,
        "float_shares": own.float_shares,
        "fifty_two_week_change": mkt.fifty_two_week_change,
        "s_and_p_fifty_two_week_change": mkt.s_and_p_fifty_two_week_change,
        "all_time_high": mkt.all_time_high,
        "all_time_low": mkt.all_time_low,
        "trailing_annual_dividend_rate": div.trailing_annual_dividend_rate,
        "trailing_annual_dividend_yield": div.trailing_annual_dividend_yield,
        "five_year_avg_dividend_yield": div.five_year_avg_dividend_yield,
    }


def calculate_sma(values: list[float], period: int) -> list[float | None]:
    """Calculate Simple Moving Average for a list of values."""
    result: list[float | None] = []
    for i in range(len(values)):
        if i < period - 1:
            result.append(None)
        else:
            result.append(round(sum(values[i - period + 1 : i + 1]) / period, 2))
    return result


_last_yahoo_request_time: float = 0
COLD_START_DELAY: float = 2.0  # seconds
_IDLE_THRESHOLD: float = 300  # 5 minutes


def _maybe_cold_start_delay() -> None:
    """Delay on cold start to avoid Yahoo Finance rate limit bursts."""
    global _last_yahoo_request_time
    now = time_module.monotonic()
    if now - _last_yahoo_request_time > _IDLE_THRESHOLD:
        app_logger.info(
            f"Cold start detected, sleeping {COLD_START_DELAY}s before Yahoo request"
        )
        time_module.sleep(COLD_START_DELAY)
    _last_yahoo_request_time = now
