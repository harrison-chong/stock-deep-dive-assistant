"""
Data fetching service.
"""

import time
from datetime import datetime, timedelta
import pandas as pd
import yfinance as yf
from yfinance.exceptions import YFRateLimitError

from shared.domain import OHLCData, FundamentalData, CompanyInfo
from common.logging import app_logger


def retry_with_backoff(func, max_retries=3, base_delay=5.0):
    """Retry a function with exponential backoff on rate limit errors."""
    for attempt in range(max_retries):
        try:
            return func()
        except YFRateLimitError:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2**attempt)
            app_logger.warning(
                f"Rate limit hit, retrying in {delay}s... (attempt {attempt + 1}/{max_retries})"
            )
            time.sleep(delay)
        except Exception:
            raise


class DataService:
    """Fetch market and fundamental data from Yahoo Finance"""

    @staticmethod
    async def get_ohlc(
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> OHLCData:
        """Fetch OHLC data from yfinance using period OR start/end dates"""

        def fetch():
            if start_date and end_date:
                return yf.download(
                    ticker, start=start_date, end=end_date, progress=False, repair=True
                )
            elif period:
                return yf.download(ticker, period=period, progress=False, repair=True)
            else:
                return yf.download(ticker, period="5y", progress=False, repair=True)

        data = retry_with_backoff(fetch)
        if data.empty:
            raise ValueError(
                f"Ticker '{ticker}' not found in Yahoo Finance. It may be delisted, invalid, or have no available data. Please check the ticker symbol and try again."
            )

        # Flatten multi-level columns if needed
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
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

    @staticmethod
    async def get_ticker_info(ticker: str) -> tuple[FundamentalData, CompanyInfo, dict]:
        """
        Fetch both fundamental metrics and company info from a single API call.
        This avoids duplicate yf.Ticker() calls.
        Returns the fundamentals, company info, and the raw info dict.
        """

        def fetch():
            ticker_obj = yf.Ticker(ticker)
            return ticker_obj.info

        info = retry_with_backoff(fetch)

        fundamentals = FundamentalData(
            ticker=ticker,
            market_cap=info.get("marketCap"),
            pe_ratio=info.get("trailingPE"),
            forward_pe=info.get("forwardPE"),
            eps=info.get("trailingEps"),
            revenue=info.get("totalRevenue"),
            revenue_growth=(info.get("revenueGrowth") or 0) * 100,
            roe=(info.get("returnOnEquity") or 0) * 100,
            debt_to_equity=info.get("debtToEquity"),
            free_cash_flow=info.get("freeCashflow"),
            # dividendYield from yfinance is already in % (0.41 = 0.41%), NOT decimal
            dividend_yield=info.get("dividendYield"),
            profit_margin=(info.get("profitMargins") or 0) * 100,
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
            return_on_assets=(info.get("returnOnAssets") or 0) * 100,
            return_on_investment=(info.get("returnOnInvestment") * 100)
            if info.get("returnOnInvestment") is not None
            else None,
            gross_margins=(info.get("grossMargins") or 0) * 100,
            operating_margins=(info.get("operatingMargins") or 0) * 100,
            earnings_quarterly_growth=(info.get("earningsQuarterlyGrowth") or 0) * 100,
            earnings_growth=(info.get("earningsGrowth") or 0) * 100,
            regular_market_change=info.get("regularMarketChange"),
            regular_market_change_percent=info.get("regularMarketChangePercent"),
            beta=info.get("beta"),
            earnings_timestamp=info.get("earningsTimestamp"),
            target_mean_price=info.get("targetMeanPrice"),
            target_median_price=info.get("targetMedianPrice"),
            dividend_rate=info.get("dividendRate"),
            forward_dividend_yield=info.get("dividendYield"),
            # Additional yfinance fields
            ebitda=info.get("ebitda"),
            revenue_per_share=info.get("revenuePerShare"),
            payout_ratio=(info.get("payoutRatio") or 0) * 100,
            total_cash=info.get("totalCash"),
            total_debt=info.get("totalDebt"),
            total_cash_per_share=info.get("totalCashPerShare"),
            current_ratio=info.get("currentRatio"),
            quick_ratio=info.get("quickRatio"),
            shares_outstanding=info.get("sharesOutstanding"),
            float_shares=info.get("floatShares"),
            implied_shares_outstanding=info.get("impliedSharesOutstanding"),
            held_percent_insiders=(info.get("heldPercentInsiders") or 0) * 100,
            held_percent_institutions=(info.get("heldPercentInstitutions") or 0) * 100,
            number_of_analyst_opinions=info.get("numberOfAnalystOpinions"),
            recommendation_key=info.get("recommendationKey"),
            recommendation_mean=info.get("recommendationMean"),
            average_analyst_rating=info.get("averageAnalystRating"),
            target_high_price=info.get("targetHighPrice"),
            target_low_price=info.get("targetLowPrice"),
            fifty_day_average=info.get("fiftyDayAverage"),
            two_hundred_day_average=info.get("twoHundredDayAverage"),
            fifty_two_week_change=(info.get("52WeekChange") or 0) * 100,
            s_and_p_fifty_two_week_change=(info.get("SandP52WeekChange") or 0) * 100,
            shares_short=info.get("sharesShort"),
            short_ratio=info.get("shortRatio"),
            short_percent_of_float=(info.get("shortPercentOfFloat") or 0) * 100,
            trailing_annual_dividend_rate=info.get("trailingAnnualDividendRate"),
            # trailingAnnualDividendYield is a decimal (0.04 = 4%), multiply by 100 to get %
            trailing_annual_dividend_yield=(
                info.get("trailingAnnualDividendYield") or 0
            )
            * 100,
            # fiveYearAvgDividendYield is already in % form (2.9 = 2.9%)
            five_year_avg_dividend_yield=info.get("fiveYearAvgDividendYield"),
            ex_dividend_date=info.get("exDividendDate"),
            dividend_date=info.get("dividendDate"),
            last_dividend_date=info.get("lastDividendDate"),
            last_dividend_value=info.get("lastDividendValue"),
            all_time_high=info.get("allTimeHigh"),
            all_time_low=info.get("allTimeLow"),
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

        def fetch():
            return yf.download(ticker, period="1d", progress=False, repair=True)

        data = retry_with_backoff(fetch)
        if data.empty:
            raise ValueError(f"No data found for '{ticker}'.")
        return float(data["Close"].iloc[-1].item())

    @staticmethod
    def get_current_prices(tickers: list[str]) -> dict[str, float]:
        """
        Get current prices for multiple tickers in a single API call.
        Returns a dict of ticker -> price. Missing/invalid tickers are omitted.
        """
        if not tickers:
            return {}

        def fetch():
            return yf.download(
                tickers, period="1d", progress=False, repair=True, group_by="ticker"
            )

        try:
            data = retry_with_backoff(fetch)
        except Exception:
            return {}

        prices = {}
        for ticker in tickers:
            try:
                if isinstance(data.columns, pd.MultiIndex):
                    close = data[ticker]["Close"]
                else:
                    close = data["Close"]
                if not close.empty and pd.notna(close.iloc[-1]):
                    prices[ticker] = float(close.iloc[-1].item())
            except (KeyError, IndexError, ValueError):
                continue
        return prices

    @staticmethod
    def get_price_on_date(ticker: str, date: str) -> float:
        """
        Get the closing price for a ticker on or after a specific date.
        Fetches a small window (5 days before to 7 days after) and returns the first close on or after the date.
        """

        requested_date = datetime.strptime(date, "%Y-%m-%d")
        start = requested_date - timedelta(days=5)
        end = requested_date + timedelta(days=7)

        def fetch():
            return yf.download(
                ticker,
                start=start.strftime("%Y-%m-%d"),
                end=end.strftime("%Y-%m-%d"),
                progress=False,
                repair=True,
            )

        data = retry_with_backoff(fetch)
        if data.empty:
            raise ValueError(f"No data found for '{ticker}' around {date}.")

        # Find first close on or after the requested date
        data_dates = data.index.tolist()
        for i, d in enumerate(data_dates):
            if d.date() >= requested_date.date():
                return float(data["Close"].iloc[i].item())

        # If none found, return the last available close (edge case)
        return float(data["Close"].iloc[-1].item())
