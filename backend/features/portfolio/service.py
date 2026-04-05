"""
Portfolio management service.
"""

import json
import os
from datetime import datetime

from shared.domain import (
    PortfolioEntry,
    PortfolioBenchmark,
)
from shared.requests import PortfolioEntryRequest, PortfolioSellRequest
from shared.responses import (
    PortfolioEntryResponse,
    PortfolioListResponse,
    PortfolioPerformanceResponse,
    PortfolioSummaryResponse,
)
from features.data.service import DataService


class PortfolioService:
    """Manage user portfolio and performance calculations"""

    def __init__(self):
        self.data_service = DataService()
        self.portfolio_file = "portfolio.json"
        self.benchmarks = self._get_default_benchmarks()
        self.portfolio = self._load_portfolio()

    def _get_default_benchmarks(self) -> list[PortfolioBenchmark]:
        """Get default benchmark indices"""
        return [
            PortfolioBenchmark(
                id="sp500",
                name="S&P 500",
                ticker="^GSPC",
                description="US Large-Cap Index",
            ),
            PortfolioBenchmark(
                id="asx200",
                name="ASX 200",
                ticker="^AXJO",
                description="Australian Large-Cap Index",
            ),
        ]

    def _load_portfolio(self) -> list[PortfolioEntry]:
        """Load portfolio from file"""
        if not os.path.exists(self.portfolio_file):
            return []

        try:
            with open(self.portfolio_file, "r") as f:
                data = json.load(f)
            return [
                PortfolioEntry(
                    id=entry["id"],
                    ticker=entry["ticker"],
                    company_name=entry["company_name"],
                    purchase_date=datetime.strptime(entry["purchase_date"], "%Y-%m-%d"),
                    quantity=entry["quantity"],
                    purchase_price=entry["purchase_price"],
                    sold=entry.get("sold", False),
                    sell_date=datetime.strptime(entry["sell_date"], "%Y-%m-%d")
                    if entry.get("sell_date")
                    else None,
                    sell_price=entry.get("sell_price"),
                )
                for entry in data
            ]
        except Exception as e:
            print(f"Error loading portfolio: {e}")
            return []

    def _save_portfolio(self) -> None:
        """Save portfolio to file"""
        portfolio_data = [
            {
                "id": entry.id,
                "ticker": entry.ticker,
                "company_name": entry.company_name,
                "purchase_date": entry.purchase_date.strftime("%Y-%m-%d"),
                "quantity": entry.quantity,
                "purchase_price": entry.purchase_price,
                "sold": entry.sold,
                "sell_date": entry.sell_date.strftime("%Y-%m-%d")
                if entry.sell_date
                else None,
                "sell_price": entry.sell_price,
            }
            for entry in self.portfolio
        ]

        try:
            with open(self.portfolio_file, "w") as f:
                json.dump(portfolio_data, f, indent=2)
        except Exception as e:
            print(f"Error saving portfolio: {e}")

    async def add_stock(self, request: PortfolioEntryRequest) -> PortfolioEntryResponse:
        """Add a stock to the portfolio"""
        # Get company info
        company_info = await self.data_service.get_company_info(request.ticker)

        # Check if we already have this stock on the same date and price (consolidate regardless of sold status)
        existing_entry = next(
            (
                entry
                for entry in self.portfolio
                if entry.ticker == request.ticker.upper()
                and entry.purchase_date
                == datetime.strptime(request.purchase_date, "%Y-%m-%d")
                and entry.purchase_price == request.purchase_price
            ),
            None,
        )

        if existing_entry:
            # Consolidate with existing entry
            existing_entry.quantity += request.quantity
            self._save_portfolio()

            # Calculate current performance
            current_price = self.data_service.get_current_price(request.ticker)
            total_cost = existing_entry.quantity * existing_entry.purchase_price
            current_value = existing_entry.quantity * current_price
            profit_loss = current_value - total_cost
            profit_loss_percentage = (
                (profit_loss / total_cost) * 100 if total_cost != 0 else 0
            )

            # Calculate annualized return
            purchase_date = existing_entry.purchase_date
            current_date = datetime.now()
            days_held = (current_date - purchase_date).days
            years_held = days_held / 365.25
            annualized_return = (
                ((current_price / existing_entry.purchase_price) ** (1 / years_held))
                - 1
                if years_held > 0
                else 0
            )
            annualized_return_percentage = annualized_return * 100

            return PortfolioEntryResponse(
                id=existing_entry.id,
                ticker=existing_entry.ticker,
                company_name=existing_entry.company_name,
                purchase_date=request.purchase_date,
                quantity=existing_entry.quantity,
                purchase_price=existing_entry.purchase_price,
                current_price=current_price,
                current_value=current_value,
                profit_loss=profit_loss,
                profit_loss_percentage=profit_loss_percentage,
                annualized_return=annualized_return,
                annualized_return_percentage=annualized_return_percentage,
                status="active",
            )

        # Create new portfolio entry
        new_entry = PortfolioEntry(
            id=str(datetime.now().timestamp()),
            ticker=request.ticker.upper(),
            company_name=company_info.name,
            purchase_date=datetime.strptime(request.purchase_date, "%Y-%m-%d"),
            quantity=request.quantity,
            purchase_price=request.purchase_price,
        )

        # Add to portfolio
        self.portfolio.append(new_entry)
        self._save_portfolio()

        # Calculate current performance
        current_price = self.data_service.get_current_price(request.ticker)
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
        years_held = days_held / 365.25
        annualized_return = (
            ((current_price / request.purchase_price) ** (1 / years_held)) - 1
            if years_held > 0
            else 0
        )
        annualized_return_percentage = annualized_return * 100

        return PortfolioEntryResponse(
            id=new_entry.id,
            ticker=new_entry.ticker,
            company_name=new_entry.company_name,
            purchase_date=request.purchase_date,
            quantity=request.quantity,
            purchase_price=request.purchase_price,
            current_price=current_price,
            current_value=current_value,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_percentage,
            annualized_return=annualized_return,
            annualized_return_percentage=annualized_return_percentage,
            status="active",
        )

    async def sell_stock(self, request: PortfolioSellRequest) -> PortfolioEntryResponse:
        """Sell a stock from the portfolio"""
        # Find the portfolio entry
        entry = next((e for e in self.portfolio if e.id == request.id), None)
        if not entry:
            raise ValueError("Portfolio entry not found")

        if entry.sold:
            raise ValueError("Stock has already been sold")

        # Update entry with sale information
        entry.sold = True
        entry.sell_date = datetime.strptime(request.sell_date, "%Y-%m-%d")
        entry.sell_price = request.sell_price

        try:
            self._save_portfolio()
        except Exception as e:
            print(f"Error saving portfolio after sell: {e}")
            # Return success response even if save fails to prevent 404 errors
            # The entry is marked as sold in memory

        # Calculate sale performance
        total_cost = entry.quantity * entry.purchase_price
        sale_value = entry.quantity * request.sell_price
        profit_loss = sale_value - total_cost
        profit_loss_percentage = (
            (profit_loss / total_cost) * 100 if total_cost != 0 else 0
        )

        # Calculate annualized return
        purchase_date = entry.purchase_date
        sell_date = entry.sell_date
        days_held = (sell_date - purchase_date).days
        years_held = days_held / 365.25
        annualized_return = (
            ((request.sell_price / entry.purchase_price) ** (1 / years_held)) - 1
            if years_held > 0
            else 0
        )
        annualized_return_percentage = annualized_return * 100

        return PortfolioEntryResponse(
            id=entry.id,
            ticker=entry.ticker,
            company_name=entry.company_name,
            purchase_date=entry.purchase_date.strftime("%Y-%m-%d"),
            quantity=entry.quantity,
            purchase_price=entry.purchase_price,
            current_price=request.sell_price,
            current_value=sale_value,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_percentage,
            annualized_return=annualized_return,
            annualized_return_percentage=annualized_return_percentage,
            status="sold",
        )

    def get_portfolio(self) -> PortfolioListResponse:
        """Get all portfolio entries"""
        return PortfolioListResponse(
            portfolio=[
                PortfolioEntryResponse(
                    id=entry.id,
                    ticker=entry.ticker,
                    company_name=entry.company_name,
                    purchase_date=entry.purchase_date.strftime("%Y-%m-%d"),
                    quantity=entry.quantity,
                    purchase_price=entry.purchase_price,
                    current_price=0,
                    current_value=0,
                    profit_loss=0,
                    profit_loss_percentage=0,
                    annualized_return=0,
                    annualized_return_percentage=0,
                    status="sold" if entry.sold else "active",
                )
                for entry in self.portfolio
                if not entry.sold
            ],
            summary=self._calculate_summary(),
        )

    def _calculate_summary(self) -> dict[str, float]:
        """Calculate portfolio summary"""
        active_holdings = [entry for entry in self.portfolio if not entry.sold]
        total_investment = sum(
            entry.quantity * entry.purchase_price for entry in active_holdings
        )
        total_value = 0
        total_profit_loss = 0
        total_profit_loss_percentage = 0
        annualized_return = 0
        annualized_return_percentage = 0

        # Calculate current values and performance
        if active_holdings:
            try:
                for entry in active_holdings:
                    current_price = self.data_service.get_current_price(entry.ticker)
                    current_value = entry.quantity * current_price
                    total_value += current_value
                    total_profit_loss += current_value - (
                        entry.quantity * entry.purchase_price
                    )

                if total_investment > 0:
                    total_profit_loss_percentage = (
                        total_profit_loss / total_investment
                    ) * 100

            except Exception as e:
                print(f"Error calculating summary: {e}")

        return {
            "total_investment": total_investment,
            "total_value": total_value,
            "total_profit_loss": total_profit_loss,
            "total_profit_loss_percentage": total_profit_loss_percentage,
            "annualized_return": annualized_return,
            "annualized_return_percentage": annualized_return_percentage,
        }

    async def get_performance(self) -> PortfolioPerformanceResponse:
        """Calculate portfolio performance"""
        total_cost = 0
        current_value = 0
        total_profit_loss = 0
        total_profit_loss_percentage = 0
        annualized_return = 0
        annualized_return_percentage = 0
        holdings = []
        benchmark_comparison = {}

        # Calculate active holdings performance
        for entry in self.portfolio:
            if entry.sold:
                continue

            try:
                current_price = self.data_service.get_current_price(entry.ticker)
                holding_cost = entry.quantity * entry.purchase_price
                holding_value = entry.quantity * current_price
                holding_profit_loss = holding_value - holding_cost
                holding_profit_loss_percentage = (
                    (holding_profit_loss / holding_cost) * 100
                    if holding_cost != 0
                    else 0
                )

                # Calculate annualized return
                purchase_date = entry.purchase_date
                current_date = datetime.now()
                days_held = (current_date - purchase_date).days
                years_held = days_held / 365.25
                holding_annualized_return = (
                    ((current_price / entry.purchase_price) ** (1 / years_held)) - 1
                    if years_held > 0
                    else 0
                )
                holding_annualized_return_percentage = holding_annualized_return * 100

                holdings.append(
                    {
                        "ticker": entry.ticker,
                        "company_name": entry.company_name,
                        "quantity": entry.quantity,
                        "purchase_price": entry.purchase_price,
                        "current_price": current_price,
                        "cost_basis": holding_cost,
                        "current_value": holding_value,
                        "profit_loss": holding_profit_loss,
                        "profit_loss_percentage": holding_profit_loss_percentage,
                        "annualized_return": holding_annualized_return,
                        "annualized_return_percentage": holding_annualized_return_percentage,
                    }
                )

                total_cost += holding_cost
                current_value += holding_value
                total_profit_loss += holding_profit_loss

            except Exception as e:
                print(f"Error calculating performance for {entry.ticker}: {e}")
                continue

        # Calculate total portfolio metrics
        if total_cost > 0:
            total_profit_loss_percentage = (total_profit_loss / total_cost) * 100
            # Weighted average annualized return
            if holdings:
                annualized_return = sum(
                    h["annualized_return"] * (h["cost_basis"] / total_cost)
                    for h in holdings
                )
                annualized_return_percentage = annualized_return * 100

        # Calculate benchmark comparisons
        for benchmark in self.benchmarks:
            try:
                benchmark_data = await self.data_service.get_ohlc(
                    benchmark.ticker, period="1y"
                )
                if benchmark_data.close:
                    # Calculate benchmark return over the period of oldest holding
                    oldest_holding_date = min(
                        entry.purchase_date
                        for entry in self.portfolio
                        if not entry.sold
                    )

                    benchmark_start_price = next(
                        (
                            price
                            for date, price in zip(
                                benchmark_data.timestamp, benchmark_data.close
                            )
                            if date.date() >= oldest_holding_date.date()
                        ),
                        benchmark_data.close[0] if benchmark_data.close else 0,
                    )
                    benchmark_end_price = (
                        benchmark_data.close[-1] if benchmark_data.close else 0
                    )

                    if benchmark_start_price > 0 and benchmark_end_price > 0:
                        benchmark_return = (
                            benchmark_end_price - benchmark_start_price
                        ) / benchmark_start_price
                        benchmark_comparison[benchmark.name] = benchmark_return * 100
            except Exception as e:
                print(f"Error fetching benchmark data for {benchmark.name}: {e}")
                continue

        # Calculate monetary benchmark values
        benchmark_monetary_comparison = {}
        for benchmark_name, return_percentage in benchmark_comparison.items():
            if total_cost > 0:
                benchmark_monetary_value = total_cost * (1 + (return_percentage / 100))
                benchmark_monetary_comparison[benchmark_name] = benchmark_monetary_value
            else:
                benchmark_monetary_comparison[benchmark_name] = 0

        return PortfolioPerformanceResponse(
            total_cost=total_cost,
            current_value=current_value,
            total_profit_loss=total_profit_loss,
            total_profit_loss_percentage=total_profit_loss_percentage,
            annualized_return=annualized_return,
            annualized_return_percentage=annualized_return_percentage,
            benchmark_comparison=benchmark_comparison,
            benchmark_monetary_comparison=benchmark_monetary_comparison,
            holdings=holdings,
        )

    def get_summary(self) -> PortfolioSummaryResponse:
        """Get portfolio summary"""
        active_holdings = [entry for entry in self.portfolio if not entry.sold]
        total_investment = sum(
            entry.quantity * entry.purchase_price for entry in active_holdings
        )
        total_value = 0
        total_profit_loss = 0
        total_profit_loss_percentage = 0
        annualized_return = 0
        annualized_return_percentage = 0

        # Calculate current values and performance
        if active_holdings:
            try:
                for entry in active_holdings:
                    current_price = self.data_service.get_current_price(entry.ticker)
                    current_value = entry.quantity * current_price
                    total_value += current_value
                    total_profit_loss += current_value - (
                        entry.quantity * entry.purchase_price
                    )

                if total_investment > 0:
                    total_profit_loss_percentage = (
                        total_profit_loss / total_investment
                    ) * 100

            except Exception as e:
                print(f"Error calculating summary: {e}")

        return PortfolioSummaryResponse(
            total_investment=total_investment,
            total_value=total_value,
            total_profit_loss=total_profit_loss,
            total_profit_loss_percentage=total_profit_loss_percentage,
            holdings_count=len(active_holdings),
            annualized_return=annualized_return,
            annualized_return_percentage=annualized_return_percentage,
            benchmarks=[
                {
                    "id": b.id,
                    "name": b.name,
                    "ticker": b.ticker,
                    "description": b.description,
                }
                for b in self.benchmarks
            ],
            last_updated=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        )
