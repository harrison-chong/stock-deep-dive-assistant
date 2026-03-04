"""
API routes
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime

from shared.requests import AnalysisRequest, PerformanceRequest
from shared.responses import (
    StockAnalysisResponse,
    PerformanceResponse,
    MarketMoversResponse,
)
from application.analysis import StockAnalyzer

router = APIRouter()
analyzer = StockAnalyzer()


@router.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: AnalysisRequest):
    """
    Comprehensive stock analysis endpoint
    """
    ticker = request.ticker.upper()

    from core.helpers import is_valid_ticker

    if not is_valid_ticker(ticker):
        raise HTTPException(status_code=400, detail="Invalid ticker format")

    try:
        # Use the orchestrator to perform analysis
        result = await analyzer.analyze(ticker)
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")


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
        # Get current price
        current_price = await analyzer.data_service.get_current_price(ticker)

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
        annualized_return = (
            ((current_price / request.purchase_price) ** (1 / years_held)) - 1
            if years_held > 0
            else 0
        )
        annualized_return_percentage = annualized_return * 100

        # Get company info
        company_info = await analyzer.data_service.get_company_info(ticker)

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
            disclaimer="⚠️ Not financial advice. For educational purposes only.",
            timestamp=datetime.now().isoformat(),
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Performance calculation failed")


@router.get("/market-movers", response_model=MarketMoversResponse)
async def get_market_movers():
    """
    Get top 5 and bottom 5 performing stocks in the past 24 hours
    """
    try:
        movers_data = await analyzer.data_service.get_market_movers()
        return MarketMoversResponse(
            top_performers=movers_data["top_performers"],
            bottom_performers=movers_data["bottom_performers"],
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch market movers")


@router.get("/health")
async def health_check() -> dict:
    """Health check endpoint"""
    return {"status": "ok"}
