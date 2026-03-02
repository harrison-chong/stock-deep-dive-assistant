"""
Data fetching service.
"""

import pandas as pd
from datetime import datetime, timedelta
import yfinance as yf

from shared.domain import OHLCData, FundamentalData, CompanyInfo


class DataService:
    """Fetch market and fundamental data from Yahoo Finance"""

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
