"""Watchlist service — business logic for watchlist operations."""

from datetime import datetime

from domain.models import WatchlistEntry
from sources.base import DataSource
from infrastructure.persistence import load_watchlist, save_watchlist, DATE_FORMAT


def _calc_gain_loss_pct(current_price: float, entry_price: float) -> float:
    """Calculate gain/loss percentage."""
    return (current_price - entry_price) / entry_price * 100 if entry_price > 0 else 0


async def add_stock(
    ticker: str,
    entry_price: float,
    entry_date: datetime | None,
    notes: str,
    added_by: str,
    data_source: DataSource,
) -> dict:
    """Add a stock to the watchlist."""
    ticker = ticker.upper()
    watchlist = load_watchlist()

    # O(1) lookup using dict comprehension
    tickers_in_watchlist = {entry.ticker for entry in watchlist}
    if ticker in tickers_in_watchlist:
        raise ValueError(f"{ticker} is already in watchlist")

    # Fetch current price once for both entry price and current price
    current_price = await data_source.fetch_current_price(ticker)

    if entry_price > 0:
        price = entry_price
    elif entry_date and entry_date.date() >= datetime.now().date():
        price = current_price
    elif entry_date:
        price = await data_source.fetch_price_on_date(
            ticker, entry_date.strftime(DATE_FORMAT)
        )
    else:
        price = current_price

    gain_loss_percentage = _calc_gain_loss_pct(current_price, price)

    new_entry = WatchlistEntry(
        id=str(datetime.now().timestamp()),
        ticker=ticker,
        entry_price=price,
        entry_date=entry_date or datetime.now(),
        notes=notes,
        added_by=added_by,
        added_date=datetime.now(),
    )

    watchlist.append(new_entry)
    save_watchlist(watchlist)

    return {
        "id": new_entry.id,
        "ticker": new_entry.ticker,
        "entry_price": new_entry.entry_price,
        "entry_date": new_entry.entry_date.strftime(DATE_FORMAT),
        "current_price": current_price,
        "gain_loss_percentage": gain_loss_percentage,
        "notes": new_entry.notes,
        "added_by": new_entry.added_by,
        "added_date": new_entry.added_date.strftime(DATE_FORMAT),
    }


def delete_stock(id: str) -> bool:
    """Delete a stock from the watchlist."""
    watchlist = load_watchlist()
    original_length = len(watchlist)
    watchlist = [entry for entry in watchlist if entry.id != id]
    if len(watchlist) < original_length:
        save_watchlist(watchlist)
        return True
    return False


async def get_watchlist(
    added_by: str | None = None, data_source: DataSource | None = None
) -> dict:
    """Get all watchlist entries with summary."""
    entries = load_watchlist()
    if added_by:
        entries = [e for e in entries if e.added_by == added_by]

    # Batch fetch current prices if data_source provided
    current_prices = {}
    if data_source and entries:
        tickers = [e.ticker for e in entries]
        try:
            current_prices = await data_source.fetch_current_prices(tickers)
        except Exception:
            pass  # Fallback to entry prices if fetch fails

    total_gain_loss = 0
    stocks_above = 0
    stocks_below = 0

    responses = []
    for entry in entries:
        current_price = current_prices.get(entry.ticker, entry.entry_price)
        gain_loss_percentage = _calc_gain_loss_pct(current_price, entry.entry_price)
        total_gain_loss += gain_loss_percentage
        if gain_loss_percentage >= 0:
            stocks_above += 1
        else:
            stocks_below += 1

        responses.append(
            {
                "id": entry.id,
                "ticker": entry.ticker,
                "entry_price": entry.entry_price,
                "entry_date": entry.entry_date.strftime(DATE_FORMAT),
                "current_price": current_price,
                "gain_loss_percentage": gain_loss_percentage,
                "notes": entry.notes,
                "added_by": entry.added_by,
                "added_date": entry.added_date.strftime(DATE_FORMAT),
            }
        )

    total_stocks = len(entries)
    average_gain_loss = total_gain_loss / total_stocks if total_stocks > 0 else 0

    return {
        "watchlist": responses,
        "summary": {
            "total_stocks": total_stocks,
            "average_gain_loss_percentage": average_gain_loss,
            "stocks_above_entry": stocks_above,
            "stocks_below_entry": stocks_below,
        },
    }
