"""Yahoo Finance data source adapter."""

import asyncio
from asyncio import Semaphore
from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf
from yfinance.exceptions import YFRateLimitError

from sources.base import DataSource
from domain.models import OHLCData
from domain.exceptions import TickerNotFoundError, RateLimitError
from infrastructure.logging import app_logger

# Module-level singleton: serializes all Yahoo Finance API calls across all
# DataSource instances to prevent burst-triggered rate limits on cold starts.
_yahoo_semaphore = Semaphore(1)

# Module-level cache for ticker info: ticker -> (fetched_at, raw_info_dict)
_ticker_info_cache: dict[str, tuple[datetime, dict]] = {}


async def _retry_with_backoff(func, max_retries: int = 3, base_delay: float = 5.0):
    """Retry a function with exponential backoff on rate limit errors."""
    async with _yahoo_semaphore:
        for attempt in range(max_retries):
            try:
                return func()
            except YFRateLimitError:
                if attempt == max_retries - 1:
                    raise RateLimitError("Yahoo Finance rate limit exceeded")
                delay = base_delay * (2**attempt)
                app_logger.warning(
                    f"Rate limit hit, retrying in {delay}s... (attempt {attempt + 1}/{max_retries})"
                )
                await asyncio.sleep(delay)


class YahooDataSource(DataSource):
    """Yahoo Finance implementation of DataSource interface."""

    async def fetch_ohlc(
        self,
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> OHLCData:
        """Fetch OHLC data from Yahoo Finance."""

        def fetch() -> pd.DataFrame:
            if start_date and end_date:
                return yf.download(
                    ticker, start=start_date, end=end_date, progress=False, repair=True
                )
            elif period:
                return yf.download(ticker, period=period, progress=False, repair=True)
            else:
                return yf.download(ticker, period="5y", progress=False, repair=True)

        data = await _retry_with_backoff(fetch)
        if data.empty:
            raise TickerNotFoundError(
                f"Ticker '{ticker}' not found in Yahoo Finance. "
                "It may be delisted, invalid, or have no available data."
            )

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

    async def fetch_ticker_info(self, ticker: str) -> dict:
        """Fetch raw ticker info from Yahoo Finance."""

        def fetch() -> dict:
            ticker_obj = yf.Ticker(ticker)
            return ticker_obj.info

        info = await _retry_with_backoff(fetch)
        return info

    async def fetch_ticker_info_cached(self, ticker: str) -> dict:
        """Fetch ticker info with 5-minute in-memory cache."""
        now = datetime.now()
        if ticker in _ticker_info_cache:
            cached_time, cached_data = _ticker_info_cache[ticker]
            if now - cached_time < timedelta(minutes=5):
                app_logger.debug(f"Returning cached ticker info for {ticker}")
                return cached_data

        def fetch() -> dict:
            ticker_obj = yf.Ticker(ticker)
            return ticker_obj.info

        info = await _retry_with_backoff(fetch)
        _ticker_info_cache[ticker] = (now, info)
        return info

    async def fetch_current_price(self, ticker: str) -> float:
        """Fetch current price for a ticker."""

        def fetch() -> pd.DataFrame:
            return yf.download(ticker, period="1d", progress=False, repair=True)

        data = await _retry_with_backoff(fetch)
        if data.empty:
            raise TickerNotFoundError(f"No data found for '{ticker}'.")
        return float(data["Close"].iloc[-1].item())

    async def fetch_current_prices(self, tickers: list[str]) -> dict[str, float]:
        """Batch fetch current prices for multiple tickers."""
        if not tickers:
            return {}

        def fetch() -> pd.DataFrame:
            return yf.download(
                tickers, period="1d", progress=False, repair=True, group_by="ticker"
            )

        try:
            data = await _retry_with_backoff(fetch)
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

    async def fetch_price_on_date(self, ticker: str, date: str) -> float:
        """Fetch closing price on or after a specific date."""
        requested_date = datetime.strptime(date, "%Y-%m-%d")
        start = requested_date - timedelta(days=5)
        end = requested_date + timedelta(days=7)

        def fetch() -> pd.DataFrame:
            return yf.download(
                ticker,
                start=start.strftime("%Y-%m-%d"),
                end=end.strftime("%Y-%m-%d"),
                progress=False,
                repair=True,
            )

        data = await _retry_with_backoff(fetch)
        if data.empty:
            raise TickerNotFoundError(f"No data found for '{ticker}' around {date}.")

        data_dates = data.index.tolist()
        for i, d in enumerate(data_dates):
            if d.date() >= requested_date.date():
                return float(data["Close"].iloc[i].item())

        return float(data["Close"].iloc[-1].item())
