"""Performance calculation service."""

import math
from datetime import datetime


def calculate_performance(
    ticker: str,
    company_name: str,
    quantity: float,
    purchase_price: float,
    purchase_date: str,
    current_price: float,
) -> dict:
    """Calculate comprehensive performance metrics."""
    total_cost = quantity * purchase_price
    current_value = quantity * current_price
    profit_loss = current_value - total_cost
    profit_loss_percentage = (profit_loss / total_cost * 100) if total_cost != 0 else 0
    purchase_date_dt = datetime.strptime(purchase_date, "%Y-%m-%d")
    current_date_dt = datetime.now()
    days_held = (current_date_dt - purchase_date_dt).days
    if days_held <= 0:
        raise ValueError("Purchase date must be in the past")
    years_held = days_held / 365.25
    MIN_HOLD_YEARS = 0.5
    if years_held >= MIN_HOLD_YEARS:
        annualized_return = (
            math.exp(math.log(current_price / purchase_price) / years_held) - 1
        )
    else:
        annualized_return = None
    annualized_return_percentage = (
        annualized_return * 100 if annualized_return is not None else None
    )
    return {
        "ticker": ticker,
        "company_name": company_name,
        "purchase_date": purchase_date,
        "current_date": current_date_dt.strftime("%Y-%m-%d"),
        "quantity": quantity,
        "purchase_price": purchase_price,
        "current_price": current_price,
        "total_cost": total_cost,
        "current_value": current_value,
        "profit_loss": profit_loss,
        "profit_loss_percentage": profit_loss_percentage,
        "annualized_return": annualized_return,
        "annualized_return_percentage": annualized_return_percentage,
        "disclaimer": "Not financial advice. Annualized return only calculated for holdings held 6+ months.",
        "timestamp": datetime.now().isoformat(),
    }
