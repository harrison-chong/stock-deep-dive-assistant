"""
Core analysis services
Combines technical, fundamental, and AI analysis
"""

import pandas as pd
import numpy as np
import ta
from datetime import datetime, timedelta
import yfinance as yf
import httpx
import json
import re

from common.types import (
    OHLCData,
    CompanyInfo,
    FundamentalData,
    TechnicalIndicators,
    AIInterpretation,
)
from common.config import config


class DataService:
    """Fetch market and fundamental data"""

    @staticmethod
    async def get_ohlc(ticker: str, days: int = 252) -> OHLCData:
        """Fetch OHLC data from yfinance"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)

            data = yf.download(ticker, start=start_date, end=end_date, progress=False)

            if data.empty:
                raise ValueError(f"No data found for {ticker}")

            # Flatten multi-level columns if needed
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)

            # Ensure we have the right columns
            data.columns = [col.strip() for col in data.columns]

            return OHLCData(
                timestamp=data.index.tolist(),
                open=data["Open"].tolist(),
                high=data["High"].tolist(),
                low=data["Low"].tolist(),
                close=data["Close"].tolist(),
                volume=data["Volume"].astype(int).tolist(),
            )
        except Exception as e:
            raise ValueError(f"Failed to fetch data for {ticker}: {str(e)}")

    @staticmethod
    async def get_fundamentals(ticker: str) -> FundamentalData:
        """Fetch fundamental metrics from yfinance"""
        try:
            ticker_obj = yf.Ticker(ticker)
            info = ticker_obj.info

            return FundamentalData(
                ticker=ticker,
                market_cap=info.get("marketCap"),
                pe_ratio=info.get("trailingPE"),
                forward_pe=info.get("forwardPE"),
                eps=info.get("trailingEps"),
                revenue=info.get("totalRevenue"),
                revenue_growth=info.get("revenueGrowth"),
                roe=info.get("returnOnEquity"),
                debt_to_equity=info.get("debtToEquity"),
                free_cash_flow=info.get("operatingCashflow"),
                dividend_yield=info.get("dividendYield"),
                profit_margin=info.get("profitMargins"),
                peg_ratio=info.get("pegRatio"),
                industry=info.get("industry"),
                sector=info.get("sector"),
            )
        except Exception as e:
            raise ValueError(f"Failed to fetch fundamentals for {ticker}: {str(e)}")

    @staticmethod
    async def get_company_info(ticker: str) -> CompanyInfo:
        """Fetch company information"""
        try:
            ticker_obj = yf.Ticker(ticker)
            info = ticker_obj.info

            return CompanyInfo(
                ticker=ticker,
                name=info.get("longName", ticker),
                sector=info.get("sector"),
                industry=info.get("industry"),
                website=info.get("website"),
                description=info.get("longBusinessSummary"),
            )
        except Exception as e:
            raise ValueError(f"Failed to fetch company info for {ticker}: {str(e)}")

    @staticmethod
    async def get_industry_peers(ticker: str, limit: int = 5) -> list[str]:
        """
        Get industry peers
        TODO: Implement via Polygon API or maintain local database
        """
        return []


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
    """Calculate MACD"""
    macd_line = ta.trend.macd(close, window_fast=12, window_slow=26, window_sign=9)
    if macd_line is not None and len(macd_line) > 0:
        return float(macd_line.iloc[-1, 0]), float(macd_line.iloc[-1, 1])
    return None, None


class FundamentalService:
    """Analyze fundamental metrics"""

    @staticmethod
    def get_interpretations(data: FundamentalData) -> dict:
        """Generate plain-English interpretations of metrics"""
        return {
            "pe_ratio": _interpret_pe(data.pe_ratio),
            "forward_pe": _interpret_forward_pe(data.forward_pe),
            "roe": _interpret_roe(data.roe),
            "debt_to_equity": _interpret_debt_to_equity(data.debt_to_equity),
            "peg_ratio": _interpret_peg(data.peg_ratio),
            "dividend_yield": _interpret_dividend(data.dividend_yield),
            "revenue_growth": _interpret_growth(data.revenue_growth),
        }


def _interpret_pe(pe: float | None) -> str:
    if pe is None:
        return "Data unavailable"
    if pe < 15:
        return "Undervalued"
    elif pe < 25:
        return "Moderate valuation"
    else:
        return "Premium valuation"


def _interpret_forward_pe(forward_pe: float | None) -> str:
    if forward_pe is None:
        return "Data unavailable"
    if forward_pe < 15:
        return "Cheap on forward earnings"
    elif forward_pe < 25:
        return "Fair forward valuation"
    else:
        return "Expensive forward valuation"


def _interpret_roe(roe: float | None) -> str:
    if roe is None:
        return "Data unavailable"
    if roe > 0.20:
        return "Excellent ROE"
    elif roe > 0.15:
        return "Strong ROE"
    elif roe > 0.10:
        return "Decent ROE"
    else:
        return "Weak ROE"


def _interpret_debt_to_equity(ratio: float | None) -> str:
    if ratio is None:
        return "Data unavailable"
    if ratio < 0.5:
        return "Conservative leverage"
    elif ratio < 1.5:
        return "Moderate leverage"
    else:
        return "High leverage - risky"


def _interpret_peg(peg: float | None) -> str:
    if peg is None:
        return "Data unavailable"
    if peg < 1.0:
        return "Undervalued vs growth"
    elif peg < 2.0:
        return "Fair value"
    else:
        return "Overvalued vs growth"


def _interpret_dividend(div_yield: float | None) -> str:
    if div_yield is None or div_yield == 0:
        return "No dividend"
    if div_yield > 0.05:
        return "High yield"
    else:
        return "Modest yield"


def _interpret_growth(growth: float | None) -> str:
    if growth is None:
        return "Data unavailable"
    if growth > 0.15:
        return "Strong growth"
    elif growth > 0.05:
        return "Moderate growth"
    elif growth > 0:
        return "Slow growth"
    else:
        return "Declining"


class AIService:
    """AI-powered interpretation using OpenRouter"""

    def __init__(self):
        self.base_url = config.BASE_URL
        self.api_key = config.API_KEY
        self.model = config.MODEL_NAME

    async def interpret(
        self,
        ticker: str,
        company_name: str,
        technical_summary: str,
        fundamental_summary: str,
        news_summary: str,
    ) -> AIInterpretation:
        """Use LLM to generate holistic interpretation"""

        prompt = f"""
Analyze this stock briefly ({ticker} - {company_name}):

Technical: {technical_summary}
Fundamental: {fundamental_summary}
News: {news_summary}

Respond in JSON format:
{{
    "overall_summary": "1-2 sentences",
    "bull_case": "Key reasons to be optimistic",
    "bear_case": "Key risks",
    "risk_factors": ["Risk 1", "Risk 2"],
    "neutral_scenario": "Base case",
    "recommendation": "Avoid, Hold, or Consider",
    "confidence_score": 75
}}

Not financial advice. For educational purposes only.
"""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a financial analyst. Provide balanced analysis without giving advice.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.7,
                        "max_tokens": 800,
                    },
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]

            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            parsed = json.loads(json_match.group() if json_match else content)

            return AIInterpretation(
                overall_summary=parsed.get("overall_summary", ""),
                bull_case=parsed.get("bull_case", ""),
                bear_case=parsed.get("bear_case", ""),
                risk_factors=parsed.get("risk_factors", []),
                neutral_scenario=parsed.get("neutral_scenario", ""),
                recommendation=parsed.get("recommendation", "Hold"),
                confidence_score=float(parsed.get("confidence_score", 50)),
            )

        except Exception as e:
            print(f"AI error: {str(e)}")
            return AIInterpretation(
                overall_summary="AI service unavailable",
                bull_case="See data above",
                bear_case="See data above",
                risk_factors=[],
                neutral_scenario="Pending",
                recommendation="Hold",
                confidence_score=0,
            )
