"""Watchlist JSON file persistence."""

import json
import os
from datetime import datetime

from domain.models import WatchlistEntry
from domain.exceptions import DataSourceError
from infrastructure.logging import app_logger


WATCHLIST_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "data",
    "watchlist.json",
)
DATE_FORMAT = "%Y-%m-%d"


def load_watchlist() -> list[WatchlistEntry]:
    """Load watchlist entries from JSON file."""
    try:
        with open(WATCHLIST_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return [
            WatchlistEntry(
                id=entry["id"],
                ticker=entry["ticker"],
                entry_price=entry["entry_price"],
                entry_date=datetime.strptime(entry["entry_date"], DATE_FORMAT)
                if entry.get("entry_date")
                else datetime.now(),
                notes=entry.get("notes", ""),
                added_by=entry.get("added_by", ""),
                added_date=datetime.strptime(entry["added_date"], DATE_FORMAT)
                if entry.get("added_date")
                else datetime.now(),
            )
            for entry in data
        ]
    except json.JSONDecodeError as e:
        app_logger.error(f"Watchlist file corrupted (invalid JSON): {e}")
        return []
    except PermissionError as e:
        app_logger.error(f"Watchlist file permission denied: {e}")
        return []
    except OSError as e:
        app_logger.error(f"Error loading watchlist: {e}")
        return []


def save_watchlist(entries: list[WatchlistEntry]) -> None:
    """Save watchlist entries to JSON file."""
    watchlist_data = [
        {
            "id": entry.id,
            "ticker": entry.ticker,
            "entry_price": entry.entry_price,
            "entry_date": entry.entry_date.strftime(DATE_FORMAT),
            "notes": entry.notes,
            "added_by": entry.added_by,
            "added_date": entry.added_date.strftime(DATE_FORMAT),
        }
        for entry in entries
    ]

    directory = os.path.dirname(WATCHLIST_FILE)
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)

    try:
        with open(WATCHLIST_FILE, "w", encoding="utf-8") as f:
            json.dump(watchlist_data, f, indent=2)
    except (OSError, PermissionError) as e:
        raise DataSourceError(f"Failed to save watchlist: {e}") from e
