"""FastAPI dependencies."""

from sources.yahoo import YahooDataSource
from services.analyzer import StockAnalyzer


def get_data_source() -> YahooDataSource:
    """Dependency that provides the data source."""
    return YahooDataSource()


def get_analyzer() -> StockAnalyzer:
    """Dependency that provides the stock analyzer."""
    return StockAnalyzer(data_source=YahooDataSource())
