"""Application logging setup."""

import logging
import sys


def setup_logging(
    name: str = "stock-deep-dive", level: int = logging.INFO
) -> logging.Logger:
    """Configure application logging."""
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


app_logger = setup_logging()
