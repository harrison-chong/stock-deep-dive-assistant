"""API routes."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import Any

from domain.exceptions import TickerNotFoundError, RateLimitError
from infrastructure.logging import app_logger
from api.dependencies import get_data_source, get_analyzer
from services.analyzer import StockAnalyzer, calculate_sma
from services.watchlist import (
    add_stock as wl_add_stock,
    delete_stock as wl_delete_stock,
    get_watchlist as wl_get_watchlist,
)


router = APIRouter()


def _is_valid_ticker(ticker: str) -> bool:
    """Check if ticker format is reasonable."""
    return 1 < len(ticker) < 10 and ticker.replace(".", "").isalnum()


@router.post("/analyze")
async def analyze_stock(request: dict, analyzer: StockAnalyzer = Depends(get_analyzer)):
    """Comprehensive stock analysis endpoint."""
    ticker = request.get("ticker", "").upper()

    if not _is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        result = await analyzer.analyze(
            ticker,
            period=request.get("period"),
            start_date=request.get("start_date"),
            end_date=request.get("end_date"),
        )
        return result
    except TickerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except Exception as e:
        app_logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.post("/analyze/ai")
async def generate_ai_analysis(
    request: dict, analyzer: StockAnalyzer = Depends(get_analyzer)
):
    """Generate AI analysis on-demand."""
    ticker = request.get("ticker", "").upper()

    if not _is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        result = await analyzer.generate_ai_outlook(
            ticker,
            period=request.get("period"),
            start_date=request.get("start_date"),
            end_date=request.get("end_date"),
        )
        return result
    except TickerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except Exception as e:
        app_logger.error(f"AI Error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI analysis failed")


@router.post("/chart-data")
async def get_chart_data(request: dict, data_source: Any = Depends(get_data_source)):
    """Lightweight endpoint to fetch only chart data (OHLC)."""
    ticker = request.get("ticker", "").upper()

    if not _is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        ohlc = await data_source.fetch_ohlc(
            ticker,
            period=request.get("period"),
            start_date=request.get("start_date"),
            end_date=request.get("end_date"),
        )

        closes = list(ohlc.close)
        timestamps = list(ohlc.timestamp)

        sma20 = calculate_sma(closes, 20)
        sma50 = calculate_sma(closes, 50)
        sma200 = calculate_sma(closes, 200)

        chart_data = [
            {
                "date": ts.strftime("%Y-%m-%d") if hasattr(ts, "strftime") else str(ts),
                "close": float(close),
                "sma20": sma20[i],
                "sma50": sma50[i],
                "sma200": sma200[i],
            }
            for i, (ts, close) in enumerate(zip(timestamps, closes))
        ]

        return {
            "ticker": ticker,
            "chart_data": chart_data,
            "data_start_date": ohlc.start_date.isoformat() if ohlc.start_date else None,
            "data_end_date": ohlc.end_date.isoformat() if ohlc.end_date else None,
        }

    except TickerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except Exception as e:
        app_logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chart data")


@router.post("/performance")
async def calculate_performance(
    request: dict, data_source: Any = Depends(get_data_source)
):
    """Calculate stock performance from purchase date to current date."""
    from services.performance import calculate_performance as perf_calc

    ticker = request.get("ticker", "").upper()

    if not _is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        info = await data_source.fetch_ticker_info(ticker)
        company_name = info.get("longName", ticker)

        current_price = await data_source.fetch_current_price(ticker)

        result = perf_calc(
            ticker=ticker,
            company_name=company_name,
            quantity=float(request.get("quantity", 0)),
            purchase_price=float(request.get("purchase_price", 0)),
            purchase_date=request.get("purchase_date", ""),
            current_price=current_price,
        )
        return result

    except TickerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        app_logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Performance calculation failed")


@router.post("/watchlist")
async def add_to_watchlist(request: dict, data_source: Any = Depends(get_data_source)):
    """Add a stock to the watchlist."""
    from datetime import datetime

    ticker = request.get("ticker", "").upper()

    if not _is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        entry_date = None
        if request.get("entry_date"):
            entry_date = datetime.strptime(request.get("entry_date"), "%Y-%m-%d")

        result = await wl_add_stock(
            ticker=ticker,
            entry_price=float(request.get("entry_price", 0)),
            entry_date=entry_date,
            notes=request.get("notes", ""),
            added_by=request.get("added_by", ""),
            data_source=data_source,
        )
        return result
    except TickerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        app_logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add stock to watchlist")


@router.delete("/watchlist/{id}")
async def delete_from_watchlist(id: str):
    """Delete a stock from the watchlist."""
    try:
        success = wl_delete_stock(id)
        if not success:
            raise HTTPException(status_code=404, detail="Watchlist entry not found")
        return {"status": "ok", "message": "Stock removed from watchlist"}
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to delete stock from watchlist"
        )


@router.get("/watchlist")
async def get_watchlist(added_by: str | None = None, data_source: Any = Depends(get_data_source)):
    """Get all watchlist entries."""
    try:
        return await wl_get_watchlist(added_by=added_by, data_source=data_source)
    except Exception as e:
        app_logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve watchlist")


@router.get("/market/summary")
async def get_market_summary():
    """Get market summary with major indices."""
    try:
        import yfinance as yf

        market = yf.Market("US")
        summary = market.summary

        indices = []
        for symbol, data in summary.items():
            if isinstance(data, dict):
                indices.append(
                    {
                        "symbol": symbol,
                        "name": data.get("shortName", symbol),
                        "price": data.get("regularMarketPrice"),
                        "change": data.get("regularMarketChange"),
                        "change_percent": data.get("regularMarketChangePercent"),
                    }
                )

        return {
            "indices": indices,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        app_logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch market summary")
