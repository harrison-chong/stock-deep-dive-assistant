"""
Watchlist management service - tracks stocks you're considering buying.
"""

import json
import os
from datetime import datetime

from shared.domain import WatchlistEntry
from shared.requests import WatchlistEntryRequest
from shared.responses import (
    WatchlistEntryResponse,
    WatchlistSummaryResponse,
    WatchlistListResponse,
)
from features.data.service import DataService
from common.logging import app_logger


class WatchlistService:
    """Manage stock watchlist and performance calculations"""

    def __init__(self):
        self.data_service = DataService()
        # Use absolute path based on module location
        module_dir = os.path.dirname(os.path.abspath(__file__))
        self.watchlist_file = os.path.join(
            module_dir, "..", "..", "data", "watchlist.json"
        )
        self.watchlist = self._load_watchlist()

    def _load_watchlist(self) -> list[WatchlistEntry]:
        """Load watchlist from file"""
        if not os.path.exists(self.watchlist_file):
            return []

        try:
            with open(self.watchlist_file, "r") as f:
                data = json.load(f)
            return [
                WatchlistEntry(
                    id=entry["id"],
                    ticker=entry["ticker"],
                    entry_price=entry["entry_price"],
                    entry_date=datetime.strptime(entry["entry_date"], "%Y-%m-%d")
                    if entry.get("entry_date")
                    else datetime.now(),
                    notes=entry.get("notes", ""),
                    added_by=entry.get("added_by", ""),
                    added_date=datetime.strptime(entry["added_date"], "%Y-%m-%d")
                    if entry.get("added_date")
                    else datetime.now(),
                )
                for entry in data
            ]
        except Exception as e:
            app_logger.warning(f"Error loading watchlist: {e}")
            return []

    def _save_watchlist(self) -> None:
        """Save watchlist to file"""
        watchlist_data = [
            {
                "id": entry.id,
                "ticker": entry.ticker,
                "entry_price": entry.entry_price,
                "entry_date": entry.entry_date.strftime("%Y-%m-%d"),
                "notes": entry.notes,
                "added_by": entry.added_by,
                "added_date": entry.added_date.strftime("%Y-%m-%d"),
            }
            for entry in self.watchlist
        ]

        # Ensure directory exists
        directory = os.path.dirname(self.watchlist_file)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

        try:
            with open(self.watchlist_file, "w") as f:
                json.dump(watchlist_data, f, indent=2)
        except Exception as e:
            raise RuntimeError(f"Failed to save watchlist: {e}") from e

    async def add_stock(self, request: WatchlistEntryRequest) -> WatchlistEntryResponse:
        """Add a stock to the watchlist"""
        ticker = request.ticker.upper()

        # Check if ticker already exists in watchlist
        if any(entry.ticker == ticker for entry in self.watchlist):
            raise ValueError(f"{ticker} is already in watchlist")

        # Determine entry_date - default to today
        if request.entry_date:
            entry_date = datetime.strptime(request.entry_date, "%Y-%m-%d")
        else:
            entry_date = datetime.now()

        # Determine entry_price:
        # 1. If explicitly provided, use it
        # 2. If entry_date is today or in the future, use current price
        # 3. Otherwise fetch the closing price on entry_date
        if request.entry_price > 0:
            entry_price = request.entry_price
        elif entry_date.date() >= datetime.now().date():
            entry_price = self.data_service.get_current_price(ticker)
        else:
            entry_price = self.data_service.get_price_on_date(
                ticker, request.entry_date
            )

        # Get current price for gain/loss calculation
        current_price = self.data_service.get_current_price(ticker)

        gain_loss_percentage = (
            (current_price - entry_price) / entry_price * 100 if entry_price > 0 else 0
        )

        # Create new watchlist entry
        new_entry = WatchlistEntry(
            id=str(datetime.now().timestamp()),
            ticker=ticker,
            entry_price=entry_price,
            entry_date=entry_date,
            notes=request.notes,
            added_by=request.added_by,
            added_date=datetime.now(),
        )

        # Add to watchlist
        self.watchlist.append(new_entry)
        self._save_watchlist()

        return WatchlistEntryResponse(
            id=new_entry.id,
            ticker=new_entry.ticker,
            entry_price=new_entry.entry_price,
            entry_date=new_entry.entry_date.strftime("%Y-%m-%d"),
            current_price=current_price,
            gain_loss_percentage=gain_loss_percentage,
            notes=new_entry.notes,
            added_by=new_entry.added_by,
            added_date=new_entry.added_date.strftime("%Y-%m-%d"),
        )

    def delete_stock(self, id: str) -> bool:
        """Delete a stock from the watchlist"""
        original_length = len(self.watchlist)
        self.watchlist = [entry for entry in self.watchlist if entry.id != id]

        if len(self.watchlist) < original_length:
            self._save_watchlist()
            return True
        return False

    def get_watchlist(
        self, added_by: str | None = None, fetch_current_price: bool = True
    ) -> WatchlistListResponse:
        """Get all watchlist entries, optionally filtered by added_by.
        If fetch_current_price is False, skip fetching live prices (faster initial load).
        """
        entries = self.watchlist
        if added_by:
            entries = [e for e in entries if e.added_by == added_by]

        watchlist_responses = []
        total_gain_loss = 0
        stocks_above = 0
        stocks_below = 0

        for entry in entries:
            if fetch_current_price:
                try:
                    current_price = self.data_service.get_current_price(entry.ticker)
                    gain_loss_percentage = (
                        (current_price - entry.entry_price) / entry.entry_price * 100
                        if entry.entry_price > 0
                        else 0
                    )
                    total_gain_loss += gain_loss_percentage

                    if gain_loss_percentage >= 0:
                        stocks_above += 1
                    else:
                        stocks_below += 1

                    watchlist_responses.append(
                        WatchlistEntryResponse(
                            id=entry.id,
                            ticker=entry.ticker,
                            entry_price=entry.entry_price,
                            entry_date=entry.entry_date.strftime("%Y-%m-%d"),
                            current_price=current_price,
                            gain_loss_percentage=gain_loss_percentage,
                            notes=entry.notes,
                            added_by=entry.added_by,
                            added_date=entry.added_date.strftime("%Y-%m-%d"),
                        )
                    )
                except Exception as e:
                    app_logger.warning(
                        f"Error getting current price for {entry.ticker}: {e}"
                    )
                    watchlist_responses.append(
                        WatchlistEntryResponse(
                            id=entry.id,
                            ticker=entry.ticker,
                            entry_price=entry.entry_price,
                            entry_date=entry.entry_date.strftime("%Y-%m-%d"),
                            current_price=0,
                            gain_loss_percentage=0,
                            notes=entry.notes,
                            added_by=entry.added_by,
                            added_date=entry.added_date.strftime("%Y-%m-%d"),
                        )
                    )
            else:
                # Skip fetching prices - show entry data without current price
                watchlist_responses.append(
                    WatchlistEntryResponse(
                        id=entry.id,
                        ticker=entry.ticker,
                        entry_price=entry.entry_price,
                        entry_date=entry.entry_date.strftime("%Y-%m-%d"),
                        current_price=entry.entry_price,  # Use entry price so gain_loss = 0
                        gain_loss_percentage=0,
                        notes=entry.notes,
                        added_by=entry.added_by,
                        added_date=entry.added_date.strftime("%Y-%m-%d"),
                    )
                )

        # Calculate summary
        total_stocks = len(entries)
        average_gain_loss = total_gain_loss / total_stocks if total_stocks > 0 else 0

        summary = WatchlistSummaryResponse(
            total_stocks=total_stocks,
            average_gain_loss_percentage=average_gain_loss,
            stocks_above_entry=stocks_above,
            stocks_below_entry=stocks_below,
        )

        return WatchlistListResponse(
            watchlist=watchlist_responses,
            summary=summary,
        )
