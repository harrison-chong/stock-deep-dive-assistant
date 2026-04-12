"""Tests for YahooDataSource ticker info caching."""

import pytest
from unittest.mock import patch
from sources.yahoo import YahooDataSource, _ticker_info_cache


class TestFetchTickerInfoCached:
    """Tests for ticker info caching."""

    def setup_method(self):
        """Clear cache before each test."""
        _ticker_info_cache.clear()

    @patch("sources.yahoo._retry_with_backoff")
    @pytest.mark.asyncio
    async def test_returns_fresh_data_on_first_call(self, mock_retry):
        """First call fetches from Yahoo."""
        mock_retry.return_value = {"shortName": "Apple Inc.", "sector": "Technology"}
        source = YahooDataSource()
        result = await source.fetch_ticker_info_cached("AAPL")
        assert result["shortName"] == "Apple Inc."
        mock_retry.assert_called_once()

    @patch("sources.yahoo._retry_with_backoff")
    @pytest.mark.asyncio
    async def test_returns_cached_data_on_second_call_within_5min(self, mock_retry):
        """Second call within 5 minutes returns cached data (no new Yahoo call)."""
        mock_retry.return_value = {"shortName": "Apple Inc.", "sector": "Technology"}
        source = YahooDataSource()

        result1 = await source.fetch_ticker_info_cached("AAPL")
        result2 = await source.fetch_ticker_info_cached("AAPL")

        assert result1 == result2
        assert result1["shortName"] == "Apple Inc."
        # Should only have called Yahoo once (second call served from cache)
        assert mock_retry.call_count == 1
