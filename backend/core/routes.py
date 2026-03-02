"""
API routes
"""

from fastapi import APIRouter, HTTPException

from shared.requests import AnalysisRequest
from shared.responses import StockAnalysisResponse
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


@router.get("/health")
async def health_check() -> dict:
    """Health check endpoint"""
    return {"status": "ok"}
