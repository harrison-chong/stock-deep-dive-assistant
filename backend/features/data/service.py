"""
Data fetching service.
"""

import pandas as pd
import yfinance as yf

from shared.domain import OHLCData, FundamentalData, CompanyInfo


class DataService:
    """Fetch market and fundamental data from Yahoo Finance"""

    @staticmethod
    async def get_ohlc(ticker: str, period: str = "max") -> OHLCData:
        """Fetch OHLC data from yfinance using period parameter"""
        try:
            data = yf.download(ticker, period=period, progress=False)

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
                start_date=data.index[0],
                end_date=data.index[-1],
            )
        except Exception as e:
            raise ValueError(f"Failed to fetch data for {ticker}: {str(e)}")

    @staticmethod
    async def get_ticker_info(ticker: str) -> tuple[FundamentalData, CompanyInfo, dict]:
        """
        Fetch both fundamental metrics and company info from a single API call.
        This avoids duplicate yf.Ticker() calls.
        Returns the fundamentals, company info, and the raw info dict.
        """
        try:
            ticker_obj = yf.Ticker(ticker)
            info = ticker_obj.info

            fundamentals = FundamentalData(
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
                previous_close=info.get("previousClose"),
                day_high=info.get("dayHigh"),
                day_low=info.get("dayLow"),
                bid=info.get("bid"),
                ask=info.get("ask"),
                volume=info.get("volume"),
                average_volume=info.get("averageVolume"),
                fifty_two_week_high=info.get("fiftyTwoWeekHigh"),
                fifty_two_week_low=info.get("fiftyTwoWeekLow"),
                enterprise_value=info.get("enterpriseValue"),
                price_to_book=info.get("priceToBook"),
                price_to_sales=info.get("priceToSalesTrailing12Months"),
                enterprise_to_ebitda=info.get("enterpriseToEbitda"),
                trailing_peg_ratio=info.get("trailingPegRatio"),
                forward_eps=info.get("forwardEps"),
                book_value=info.get("bookValue"),
                book_per_share=info.get("bookPerShare"),
                return_on_assets=info.get("returnOnAssets"),
                return_on_investment=info.get("returnOnInvestment"),
                gross_margins=info.get("grossMargins"),
                operating_margins=info.get("operatingMargins"),
                earnings_quarterly_growth=info.get("earningsQuarterlyGrowth"),
                earnings_growth=info.get("earningsGrowth"),
            )

            company_info = CompanyInfo(
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
            )

            return fundamentals, company_info, info
        except Exception as e:
            raise ValueError(f"Failed to fetch ticker info for {ticker}: {str(e)}")

    @staticmethod
    async def get_industry_peers(ticker: str, limit: int = 5) -> list[str]:
        """
        Get industry peers
        TODO: Implement via Polygon API or maintain local database
        """
        return []

    @staticmethod
    def get_current_price(ticker: str) -> float:
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
