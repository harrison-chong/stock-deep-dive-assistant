"""Abstract data source interface."""

from abc import ABC, abstractmethod

from domain.models import OHLCData


class DataSource(ABC):
    """Abstract interface for data sources."""

    @abstractmethod
    async def fetch_ohlc(
        self,
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> "OHLCData":
        """Fetch OHLC data for a ticker."""
        ...

    @abstractmethod
    async def fetch_ticker_info(self, ticker: str) -> dict:
        """Fetch raw ticker info as a dict."""
        ...

    @abstractmethod
    async def fetch_current_price(self, ticker: str) -> float:
        """Fetch current price for a single ticker."""
        ...

    @abstractmethod
    async def fetch_current_prices(self, tickers: list[str]) -> dict[str, float]:
        """Batch fetch current prices for multiple tickers."""
        ...

    @abstractmethod
    async def fetch_price_on_date(self, ticker: str, date: str) -> float:
        """Fetch closing price on or after a specific date."""
        ...
