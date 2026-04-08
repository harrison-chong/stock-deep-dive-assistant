"""
Performance calculation service.
"""

import math
from datetime import datetime
from dataclasses import dataclass


@dataclass
class PerformanceMetrics:
    """Calculated performance metrics for a stock position."""

    ticker: str
    company_name: str
    purchase_date: str
    current_date: str
    quantity: float
    purchase_price: float
    current_price: float
    total_cost: float
    current_value: float
    profit_loss: float
    profit_loss_percentage: float
    annualized_return: float | None
    annualized_return_percentage: float | None
    disclaimer: str
    timestamp: str


class PerformanceService:
    """Calculate stock performance metrics."""

    def calculate_performance(
        self,
        ticker: str,
        company_name: str,
        quantity: float,
        purchase_price: float,
        purchase_date: str,
        current_price: float,
    ) -> PerformanceMetrics:
        """
        Calculate comprehensive performance metrics for a stock position.

        Args:
            ticker: Stock ticker symbol
            company_name: Company name
            quantity: Number of shares
            purchase_price: Price per share at purchase
            purchase_date: Date of purchase (YYYY-MM-DD format)
            current_price: Current price per share

        Returns:
            PerformanceMetrics with all calculated values
        """
        total_cost = quantity * purchase_price
        current_value = quantity * current_price
        profit_loss = current_value - total_cost
        profit_loss_percentage = (
            (profit_loss / total_cost) * 100 if total_cost != 0 else 0
        )

        # Calculate annualized return
        purchase_date_dt = datetime.strptime(purchase_date, "%Y-%m-%d")
        current_date_dt = datetime.now()
        days_held = (current_date_dt - purchase_date_dt).days

        if days_held <= 0:
            raise ValueError("Purchase date must be in the past")

        years_held = days_held / 365.25
        # Only calculate annualized return if held for at least 6 months
        # Short-term annualized returns are misleading and explode for brief holds
        MIN_HOLD_YEARS = 0.5
        if years_held >= MIN_HOLD_YEARS:
            price_ratio = current_price / purchase_price
            annualized_return = math.exp(math.log(price_ratio) / years_held) - 1
        else:
            annualized_return = None

        annualized_return_percentage = (
            annualized_return * 100 if annualized_return is not None else None
        )

        return PerformanceMetrics(
            ticker=ticker,
            company_name=company_name,
            purchase_date=purchase_date,
            current_date=current_date_dt.strftime("%Y-%m-%d"),
            quantity=quantity,
            purchase_price=purchase_price,
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
