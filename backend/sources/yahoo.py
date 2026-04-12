"""Yahoo Finance data source adapter."""

import asyncio
import random
from asyncio import Semaphore
from datetime import datetime, timedelta
from typing import Callable, TypeVar

import pandas as pd
import yfinance as yf
from yfinance.exceptions import YFRateLimitError

from sources.base import DataSource
from domain.models import OHLCData
from domain.exceptions import TickerNotFoundError, RateLimitError
from infrastructure.logging import app_logger

T = TypeVar("T")

# Module-level singleton: serializes all Yahoo Finance API calls across all
# DataSource instances to prevent burst-triggered rate limits on cold starts.
_yahoo_semaphore = Semaphore(1)

# Minimum delay between Yahoo Finance API calls (seconds).
# This spaces out requests to avoid triggering rate limits, especially
# important on Render.com free tier where IPs are shared.
_YAHOO_CALL_DELAY = 0.5

# Exponential backoff settings for rate limit retries
# Base delay in seconds - starting point for exponential backoff
_BACKOFF_BASE_SECONDS = 2.0
# Maximum delay cap in seconds
_BACKOFF_MAX_SECONDS = 32.0
# Jitter factor - delay is multiplied by (1 ± jitter) for randomness
_BACKOFF_JITTER = 0.3

# Module-level cache for ticker info: ticker -> (fetched_at, raw_info_dict)
_ticker_info_cache: dict[str, tuple[datetime, dict]] = {}

# Cache for failed requests: cache_key -> (failed_at, retry_after_seconds)
# Prevents hammering Yahoo after a rate limit hit.
_failed_request_cache: dict[str, tuple[datetime, int]] = {}
_FAILED_REQUEST_TTL_SECONDS = 60
_RATE_LIMIT_MSG = "Rate limit hit. Please try again."


def _is_request_cached_failure(cache_key: str) -> bool:
    """Check if a request recently failed and should be retried only after TTL."""
    if cache_key not in _failed_request_cache:
        return False
    failed_at, retry_after = _failed_request_cache[cache_key]
    if datetime.now() - failed_at < timedelta(seconds=retry_after):
        return True
    # Expired entry
    del _failed_request_cache[cache_key]
    return False


def _calculate_backoff_delay(attempt: int) -> float:
    """Calculate delay for a given retry attempt using exponential backoff with jitter.

    Delay = min(BACKOFF_MAX, BACKOFF_BASE * 2^(attempt-1)) * (1 ± JITTER)
    Attempt 1: ~2s, Attempt 2: ~4s, Attempt 3: ~8s, Attempt 4: ~16s, Attempt 5+: 32s (capped)
    """
    raw_delay = _BACKOFF_BASE_SECONDS * (2 ** (attempt - 1))
    capped_delay = min(raw_delay, _BACKOFF_MAX_SECONDS)
    jitter_range = capped_delay * _BACKOFF_JITTER
    actual_delay = capped_delay + random.uniform(-jitter_range, jitter_range)
    return max(0.1, actual_delay)  # Ensure at least 100ms between attempts


async def _fetch_with_semaphore(func: Callable[[], T], cache_key: str = "") -> T:
    """Execute a Yahoo Finance fetch call with semaphore serialization and retry.

    The semaphore prevents burst traffic. Rate limit errors trigger exponential
    backoff retry with jitter (up to 10 attempts), then bubble up as RateLimitError.
    Failed requests are cached briefly to avoid hammering Yahoo after a limit hit.
    """
    if cache_key and _is_request_cached_failure(cache_key):
        raise RateLimitError("_RATE_LIMIT_MSG")

    MAX_RETRIES = 10

    async with _yahoo_semaphore:
        # Check again after acquiring semaphore (another request may have populated cache)
        if cache_key and _is_request_cached_failure(cache_key):
            raise RateLimitError("_RATE_LIMIT_MSG")

        for attempt in range(1, MAX_RETRIES + 1):
            if attempt > 1:
                delay = _calculate_backoff_delay(attempt - 1)
                app_logger.debug(f"Rate limit retry {attempt}, waiting {delay:.1f}s")
                await asyncio.sleep(delay)
            else:
                await asyncio.sleep(_YAHOO_CALL_DELAY)

            try:
                result = func()
                # Clear any cached failure on success
                if cache_key and cache_key in _failed_request_cache:
                    del _failed_request_cache[cache_key]
                return result
            except YFRateLimitError as e:
                app_logger.warning(
                    f"Yahoo Finance rate limit hit on attempt {attempt}, "
                    f"will retry with backoff: {e}"
                )

        # All retries exhausted — cache the failure and raise
        if cache_key:
            _failed_request_cache[cache_key] = (
                datetime.now(),
                _FAILED_REQUEST_TTL_SECONDS,
            )
        raise RateLimitError("_RATE_LIMIT_MSG")


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

        data = await _fetch_with_semaphore(
            fetch,
            cache_key=f"ohlc:{ticker}:{period}:{start_date}:{end_date}",
        )
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

        info = await _fetch_with_semaphore(fetch, cache_key=f"info:{ticker}")
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

        info = await _fetch_with_semaphore(fetch, cache_key=f"info:{ticker}")
        _ticker_info_cache[ticker] = (now, info)
        return info

    async def fetch_current_price(self, ticker: str) -> float:
        """Fetch current price for a ticker."""

        def fetch() -> pd.DataFrame:
            return yf.download(ticker, period="1d", progress=False, repair=True)

        data = await _fetch_with_semaphore(fetch, cache_key=f"price:{ticker}")
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
            data = await _fetch_with_semaphore(
                fetch, cache_key=f"prices:{','.join(tickers)}"
            )
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

        data = await _fetch_with_semaphore(
            fetch, cache_key=f"price_on_date:{ticker}:{date}"
        )
        if data.empty:
            raise TickerNotFoundError(f"No data found for '{ticker}' around {date}.")

        data_dates = data.index.tolist()
        for i, d in enumerate(data_dates):
            if d.date() >= requested_date.date():
                return float(data["Close"].iloc[i].item())

        return float(data["Close"].iloc[-1].item())
