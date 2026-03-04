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
                currency=info.get("currency"),
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

    @staticmethod
    async def get_current_price(ticker: str) -> float:
        """
        Get the current price for a ticker
        """
        try:
            data = yf.download(ticker, period="1d", progress=False)
            if data.empty:
                raise ValueError(f"No data found for {ticker}")
            return float(data["Close"].iloc[-1].item())
        except Exception as e:
            raise ValueError(f"Failed to fetch current price for {ticker}: {str(e)}")

    @staticmethod
    def _get_sector_etf(sector: str | None) -> str | None:
        """Map sector names to their ETF symbols"""
        sector_etf_map = {
            "Technology": "XLK",
            "Healthcare": "XLV",
            "Financials": "XLF",
            "Industrials": "XLI",
            "Consumer Cyclical": "XLY",
            "Consumer Defensive": "XLP",
            "Energy": "XLE",
            "Utilities": "XLU",
            "Real Estate": "XLRE",
            "Materials": "XLB",
            "Communication Services": "XLC",
        }
        return sector_etf_map.get(sector)

    @staticmethod
    async def get_sector_performance(ticker: str, sector: str | None) -> dict:
        """
        Get performance comparison between stock and its sector
        """
        try:
            sector_etf = DataService._get_sector_etf(sector)

            # Fetch stock data
            stock_data = yf.download(ticker, period="1y", progress=False)
            if stock_data.empty:
                raise ValueError(f"No data found for {ticker}")

            # Calculate returns
            stock_prices = stock_data["Close"]
            stock_1d_return = (
                ((stock_prices.iloc[-1] / stock_prices.iloc[-2]) - 1) * 100
                if len(stock_prices) > 1
                else None
            )
            stock_3m_return = (
                ((stock_prices.iloc[-1] / stock_prices.iloc[-63]) - 1) * 100
                if len(stock_prices) > 63
                else None
            )
            stock_1y_return = (
                ((stock_prices.iloc[-1] / stock_prices.iloc[0]) - 1) * 100
                if len(stock_prices) > 0
                else None
            )

            sector_1d_return = None
            sector_3m_return = None
            sector_1y_return = None

            # Fetch sector ETF data if available
            if sector_etf:
                sector_data = yf.download(sector_etf, period="1y", progress=False)
                if not sector_data.empty:
                    sector_prices = sector_data["Close"]
                    sector_1d_return = (
                        ((sector_prices.iloc[-1] / sector_prices.iloc[-2]) - 1) * 100
                        if len(sector_prices) > 1
                        else None
                    )
                    sector_3m_return = (
                        ((sector_prices.iloc[-1] / sector_prices.iloc[-63]) - 1) * 100
                        if len(sector_prices) > 63
                        else None
                    )
                    sector_1y_return = (
                        ((sector_prices.iloc[-1] / sector_prices.iloc[0]) - 1) * 100
                        if len(sector_prices) > 0
                        else None
                    )

            return {
                "sector_name": sector,
                "stock_1d_return": stock_1d_return,
                "stock_3m_return": stock_3m_return,
                "stock_1y_return": stock_1y_return,
                "sector_1d_return": sector_1d_return,
                "sector_3m_return": sector_3m_return,
                "sector_1y_return": sector_1y_return,
            }
        except Exception:
            # Return None values if sector performance can't be fetched
            return {
                "sector_name": sector,
                "stock_1d_return": None,
                "stock_3m_return": None,
                "stock_1y_return": None,
                "sector_1d_return": None,
                "sector_3m_return": None,
                "sector_1y_return": None,
            }

    @staticmethod
    async def get_market_movers() -> dict:
        """
        Get top and bottom 5 performing stocks in the past 24 hours
        Uses a curated list of popular US and Australian stocks
        """
        # Curated list of popular US and Australian stocks
        popular_stocks = [
            # US Stocks
            "AAPL",
            "MSFT",
            "GOOGL",
            "AMZN",
            "NVDA",
            "META",
            "TSLA",
            "JPM",
            "V",
            "JNJ",
            # Australian Stocks
            "BHP.AX",
            "CBA.AX",
            "WBC.AX",
            "MQG.AX",
            "ASX.AX",
        ]

        movers = []

        for ticker in popular_stocks:
            try:
                # Fetch current and previous day price
                data = yf.download(ticker, period="5d", progress=False)
                if data.empty or len(data) < 2:
                    print(f"Skipping {ticker}: insufficient data")
                    continue

                close_prices = data["Close"]
                # Use .item() to extract scalar value from Series
                current_price = float(close_prices.iloc[-1].item())
                previous_price = float(close_prices.iloc[-2].item())

                change_percent = (
                    (current_price - previous_price) / previous_price
                ) * 100

                # Get company info
                ticker_obj = yf.Ticker(ticker)
                info = ticker_obj.info
                company_name = info.get("longName", ticker)
                currency = info.get("currency", "USD")

                movers.append(
                    {
                        "ticker": ticker,
                        "company_name": company_name,
                        "change_percent": change_percent,
                        "current_price": current_price,
                        "currency": currency,
                    }
                )
            except Exception as e:
                print(f"Error fetching {ticker}: {str(e)}")
                continue

        # Sort by change percent
        movers.sort(key=lambda x: x["change_percent"], reverse=True)

        print(f"Total movers fetched: {len(movers)}")

        top_performers = movers[:5]
        bottom_performers = movers[-5:]

        return {
            "top_performers": top_performers,
            "bottom_performers": bottom_performers,
        }
