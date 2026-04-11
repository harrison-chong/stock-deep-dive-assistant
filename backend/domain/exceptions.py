"""Domain-specific exceptions."""


class DataSourceError(Exception):
    """Base exception for data source failures."""


class TickerNotFoundError(DataSourceError):
    """Raised when a ticker cannot be found."""


class RateLimitError(DataSourceError):
    """Raised when external API rate limit is hit."""


class ValidationError(Exception):
    """Raised when data validation fails."""
