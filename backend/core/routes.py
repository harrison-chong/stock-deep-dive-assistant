"""
API routes
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime

from shared.requests import (
    AnalysisRequest,
    PerformanceRequest,
    WatchlistEntryRequest,
    ChartDataRequest,
)
from shared.responses import (
    StockAnalysisResponse,
    PerformanceResponse,
    WatchlistEntryResponse,
    WatchlistListResponse,
    ChartDataResponse,
    MarketSummaryResponse,
    AIOutlookResponse,
)
from application.analysis import StockAnalyzer
from features.watchlist.service import WatchlistService
from yfinance.exceptions import YFRateLimitError

router = APIRouter()
analyzer = StockAnalyzer()
watchlist_service = WatchlistService()


@router.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: AnalysisRequest):
    """
    Comprehensive stock analysis endpoint (without AI - AI loaded on-demand via /analyze/ai)
    """
    ticker = request.ticker.upper()

    from core.helpers import is_valid_ticker

    if not is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        # Use the orchestrator to perform analysis with period or start/end dates
        result = await analyzer.analyze(
            ticker,
            period=request.period,
            start_date=request.start_date,
            end_date=request.end_date,
        )
        return result

    except YFRateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.post("/analyze/ai", response_model=AIOutlookResponse)
async def generate_ai_analysis(request: AnalysisRequest):
    """
    Generate AI analysis on-demand (after initial analysis loads).
    Re-fetches data and generates AI interpretation via OpenRouter.
    """
    ticker = request.ticker.upper()

    from core.helpers import is_valid_ticker

    if not is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        result = await analyzer.generate_ai_outlook(
            ticker,
            period=request.period,
            start_date=request.start_date,
            end_date=request.end_date,
        )
        return result

    except YFRateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"AI Error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI analysis failed")


@router.post("/chart-data", response_model=ChartDataResponse)
async def get_chart_data(request: ChartDataRequest):
    """
    Lightweight endpoint to fetch only chart data (OHLC).
    Does NOT calculate expensive advanced metrics.
    """
    ticker = request.ticker.upper()

    from core.helpers import is_valid_ticker

    if not is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        ohlc = await analyzer.data_service.get_ohlc(
            ticker,
            period=request.period,
            start_date=request.start_date,
            end_date=request.end_date,
        )

        # Calculate SMAs for the chart
        closes = list(ohlc.close)
        timestamps = list(ohlc.timestamp)

        def calculate_sma(values: list, period: int) -> list:
            result = []
            for i in range(len(values)):
                if i < period - 1:
                    result.append(None)
                else:
                    sma = sum(values[i - period + 1 : i + 1]) / period
                    result.append(round(sma, 2))
            return result

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

        return ChartDataResponse(
            ticker=ticker,
            chart_data=chart_data,
            data_start_date=ohlc.start_date.isoformat() if ohlc.start_date else None,
            data_end_date=ohlc.end_date.isoformat() if ohlc.end_date else None,
        )

    except YFRateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chart data")


@router.post("/performance", response_model=PerformanceResponse)
async def calculate_performance(request: PerformanceRequest):
    """
    Calculate stock performance from purchase date to current date
    """
    ticker = request.ticker.upper()

    from core.helpers import is_valid_ticker

    if not is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        # Get ticker info once to avoid multiple API calls
        _, company_info, info = await analyzer.data_service.get_ticker_info(ticker)

        # Extract current price from info
        current_price = info.get("currentPrice")
        if current_price is not None:
            current_price = float(current_price)
        else:
            # Fallback to regularMarketPrice if currentPrice not available
            regular_market_price = info.get("regularMarketPrice")
            if regular_market_price is not None:
                current_price = float(regular_market_price)
            else:
                # Last resort: fetch 1 day of data if price not in info
                ohlc = await analyzer.data_service.get_ohlc(ticker, days=1)
                if not ohlc.close:
                    raise ValueError(f"No data found for {ticker}")
                current_price = float(ohlc.close[-1])

        # Calculate performance metrics
        total_cost = request.quantity * request.purchase_price
        current_value = request.quantity * current_price
        profit_loss = current_value - total_cost
        profit_loss_percentage = (
            (profit_loss / total_cost) * 100 if total_cost != 0 else 0
        )

        # Calculate annualized return
        purchase_date = datetime.strptime(request.purchase_date, "%Y-%m-%d")
        current_date = datetime.now()
        days_held = (current_date - purchase_date).days

        if days_held <= 0:
            raise HTTPException(
                status_code=400, detail="Purchase date must be in the past"
            )

        years_held = days_held / 365.25
        # Only calculate annualized return if held for at least 6 months
        # Short-term annualized returns are misleading and explode for brief holds
        MIN_HOLD_YEARS = 0.5
        if years_held >= MIN_HOLD_YEARS:
            price_ratio = current_price / request.purchase_price
            import math

            annualized_return = math.exp(math.log(price_ratio) / years_held) - 1
        else:
            annualized_return = None
        annualized_return_percentage = (
            annualized_return * 100 if annualized_return is not None else None
        )

        return PerformanceResponse(
            ticker=ticker,
            company_name=company_info.name,
            purchase_date=request.purchase_date,
            current_date=current_date.strftime("%Y-%m-%d"),
            quantity=request.quantity,
            purchase_price=request.purchase_price,
            current_price=current_price,
            total_cost=total_cost,
            current_value=current_value,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_percentage,
            annualized_return=annualized_return,
            annualized_return_percentage=annualized_return_percentage,
            disclaimer="⚠️ Not financial advice. For educational purposes only. Annualized return only calculated for holdings held 6+ months.",
            timestamp=datetime.now().isoformat(),
        )

    except YFRateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Performance calculation failed")


@router.post("/watchlist", response_model=WatchlistEntryResponse)
async def add_to_watchlist(request: WatchlistEntryRequest):
    """
    Add a stock to the watchlist
    """
    ticker = request.ticker.upper()

    from core.helpers import is_valid_ticker

    if not is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        result = await watchlist_service.add_stock(request)
        return result

    except YFRateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Yahoo Finance is rate limited. Please try again in a few minutes.",
        )
    except ValueError as e:
        error_msg = str(e)
        if "delisted" in error_msg.lower() or "no data found" in error_msg.lower():
            raise HTTPException(
                status_code=404,
                detail=f"Ticker '{ticker}' not found in Yahoo Finance. It may be delisted or invalid. Please check and try again.",
            )
        raise HTTPException(status_code=404, detail=error_msg)
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add stock to watchlist")


@router.delete("/watchlist/{id}")
async def delete_from_watchlist(id: str):
    """
    Delete a stock from the watchlist
    """
    try:
        success = watchlist_service.delete_stock(id)
        if not success:
            raise HTTPException(status_code=404, detail="Watchlist entry not found")
        return {"status": "ok", "message": "Stock removed from watchlist"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to delete stock from watchlist"
        )


@router.get("/watchlist", response_model=WatchlistListResponse)
async def get_watchlist(added_by: str | None = None):
    """
    Get all watchlist entries, optionally filtered by added_by
    """
    try:
        watchlist = watchlist_service.get_watchlist(added_by=added_by)
        return watchlist

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve watchlist")


@router.get("/watchlist/filter/added_by")
async def get_watchlist_filter_options():
    """
    Get unique added_by values for filtering
    """
    try:
        return {"options": watchlist_service.get_unique_added_by()}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get filter options")


@router.get("/health")
async def health_check() -> dict:
    """Health check endpoint"""
    return {"status": "ok"}


@router.get("/market/summary", response_model=MarketSummaryResponse)
async def get_market_summary():
    """
    Get market summary with major indices (S&P 500, Dow, Nasdaq, Russell, VIX, Gold)
    """
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

        return MarketSummaryResponse(
            indices=indices,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch market summary")
