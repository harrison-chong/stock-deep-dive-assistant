"""
AI analysis service using OpenRouter.
"""

import json
import re

from shared.domain import AIInterpretation
from common.config import config
from common.client import client
from common.utils import render_template
from common.logging import app_logger


class AIService:
    """AI-powered interpretation using OpenRouter"""

    def __init__(self):
        self.model = config.MODEL_NAME

    def interpret(
        self,
        ticker: str,
        company_name: str,
        technical_summary: str,
        fundamental_summary: str,
        news_summary: str,
        advanced_metrics: dict | None = None,
        additional_fundamentals: dict | None = None,
    ) -> AIInterpretation:
        """Use LLM to generate holistic interpretation"""

        # Format advanced metrics for the prompt
        if advanced_metrics:
            stat = advanced_metrics.get("statistical", {})
            tech = advanced_metrics.get("technical", {})
            seasonal = advanced_metrics.get("seasonal", {})

            formatted_metrics = {
                "statistical": {
                    "total_return": f"{(stat.get('total_return') or 0) * 100:.2f}"
                    if stat.get("total_return") is not None
                    else "N/A",
                    "annualized_return": f"{(stat.get('annualized_return') or 0) * 100:.2f}"
                    if stat.get("annualized_return") is not None
                    else "N/A",
                    "volatility": f"{(stat.get('annualized_volatility') or 0) * 100:.2f}"
                    if stat.get("annualized_volatility") is not None
                    else "N/A",
                    "sharpe_ratio": f"{stat.get('sharpe_ratio', 0):.2f}"
                    if stat.get("sharpe_ratio") is not None
                    else "N/A",
                    "sortino_ratio": f"{stat.get('sortino_ratio', 0):.2f}"
                    if stat.get("sortino_ratio") is not None
                    else "N/A",
                    "calmar_ratio": f"{stat.get('calmar_ratio', 0):.2f}"
                    if stat.get("calmar_ratio") is not None
                    else "N/A",
                    "max_drawdown": f"{(stat.get('max_drawdown') or 0) * 100:.2f}"
                    if stat.get("max_drawdown") is not None
                    else "N/A",
                    "var_95": f"{(stat.get('var_95') or 0) * 100:.2f}"
                    if stat.get("var_95") is not None
                    else "N/A",
                    "ulcer_index": f"{stat.get('ulcer_index', 0):.2f}"
                    if stat.get("ulcer_index") is not None
                    else "N/A",
                    "recovery_days": str(stat.get("recovery_days", "N/A"))
                    if stat.get("recovery_days") is not None
                    else "N/A",
                    "skewness": f"{stat.get('skewness', 0):.2f}"
                    if stat.get("skewness") is not None
                    else "N/A",
                    "kurtosis": f"{stat.get('kurtosis', 0):.2f}"
                    if stat.get("kurtosis") is not None
                    else "N/A",
                },
                "technical": {
                    "returns_1m": f"{(tech.get('returns_1m') or 0) * 100:.2f}"
                    if tech.get("returns_1m") is not None
                    else "N/A",
                    "returns_3m": f"{(tech.get('returns_3m') or 0) * 100:.2f}"
                    if tech.get("returns_3m") is not None
                    else "N/A",
                    "returns_6m": f"{(tech.get('returns_6m') or 0) * 100:.2f}"
                    if tech.get("returns_6m") is not None
                    else "N/A",
                    "returns_1y": f"{(tech.get('returns_1y') or 0) * 100:.2f}"
                    if tech.get("returns_1y") is not None
                    else "N/A",
                    "price_vs_sma_50": f"{(tech.get('price_vs_sma_50') or 0) * 100:.2f}"
                    if tech.get("price_vs_sma_50") is not None
                    else "N/A",
                    "price_vs_sma_200": f"{(tech.get('price_vs_sma_200') or 0) * 100:.2f}"
                    if tech.get("price_vs_sma_200") is not None
                    else "N/A",
                    "golden_cross": "Yes"
                    if tech.get("golden_cross_detected")
                    else "No",
                    "death_cross": "Yes" if tech.get("death_cross_detected") else "No",
                    "pivot_resistance_1": f"{tech.get('pivot_resistance_1', 0):.2f}"
                    if tech.get("pivot_resistance_1") is not None
                    else "N/A",
                    "pivot_resistance_2": f"{tech.get('pivot_resistance_2', 0):.2f}"
                    if tech.get("pivot_resistance_2") is not None
                    else "N/A",
                    "pivot_support_1": f"{tech.get('pivot_support_1', 0):.2f}"
                    if tech.get("pivot_support_1") is not None
                    else "N/A",
                    "pivot_support_2": f"{tech.get('pivot_support_2', 0):.2f}"
                    if tech.get("pivot_support_2") is not None
                    else "N/A",
                    "volume_avg_50d": f"{tech.get('volume_avg_50d', 0):,.0f}"
                    if tech.get("volume_avg_50d") is not None
                    else "N/A",
                    "volume_trend": tech.get("volume_trend", "N/A") or "N/A",
                },
                "seasonal": {
                    "monthly_returns": seasonal.get("monthly_returns", {})
                    if seasonal
                    else {},
                    "quarterly_returns": seasonal.get("quarterly_returns", {})
                    if seasonal
                    else {},
                    "day_of_week_effect": seasonal.get("day_of_week_effect", {})
                    if seasonal
                    else {},
                },
            }
        else:
            formatted_metrics = {
                "statistical": {},
                "technical": {},
                "seasonal": {},
            }

        # Format additional_fundamentals - values from database are already percentages (multiplied by 100)
        # But we need to format them properly so AI doesn't multiply again
        formatted_additional = {}
        if additional_fundamentals:
            for key, value in additional_fundamentals.items():
                if value is None:
                    formatted_additional[key] = "N/A"
                elif key in (
                    "gross_margins",
                    "operating_margins",
                    "profit_margin",
                    "payout_ratio",
                    "return_on_assets",
                    "return_on_investment",
                    "revenue_growth",
                    "earnings_growth",
                    "earnings_quarterly_growth",
                    "held_percent_insiders",
                    "held_percent_institutions",
                    "short_percent_of_float",
                    "trailing_annual_dividend_yield",
                    "fifty_two_week_change",
                    "s_and_p_fifty_two_week_change",
                    "five_year_avg_dividend_yield",
                ):
                    # These are already percentages (e.g., 45.85 = 45.85%)
                    formatted_additional[key] = f"{value:.2f}%"
                elif key in (
                    "market_cap",
                    "enterprise_value",
                    "ebitda",
                    "total_cash",
                    "total_debt",
                    "free_cash_flow",
                    "operating_cash_flow",
                ):
                    # Format large numbers with B/M suffix
                    if value is not None:
                        if abs(value) >= 1e9:
                            formatted_additional[key] = f"${value / 1e9:.2f}B"
                        elif abs(value) >= 1e6:
                            formatted_additional[key] = f"${value / 1e6:.2f}M"
                        else:
                            formatted_additional[key] = f"${value:.2f}"
                    else:
                        formatted_additional[key] = "N/A"
                elif key in (
                    "eps",
                    "forward_eps",
                    "book_value",
                    "dividend_rate",
                    "trailing_annual_dividend_rate",
                    "target_high_price",
                    "target_low_price",
                    "fifty_day_average",
                    "two_hundred_day_average",
                    "total_cash_per_share",
                    "price_to_book",
                    "price_to_sales",
                    "enterprise_to_ebitda",
                ):
                    # Dollar values
                    formatted_additional[key] = (
                        f"${value:.2f}" if value is not None else "N/A"
                    )
                elif key in ("beta",):
                    # Ratio, no formatting
                    formatted_additional[key] = (
                        f"{value:.2f}" if value is not None else "N/A"
                    )
                elif key in ("current_ratio", "quick_ratio"):
                    formatted_additional[key] = (
                        f"{value:.2f}" if value is not None else "N/A"
                    )
                elif key in ("shares_outstanding", "float_shares", "shares_short"):
                    formatted_additional[key] = (
                        f"{value:,.0f}" if value is not None else "N/A"
                    )
                elif key in ("short_ratio",):
                    formatted_additional[key] = (
                        f"{value:.2f}" if value is not None else "N/A"
                    )
                elif key in ("number_of_analyst_opinions", "recommendation_mean"):
                    formatted_additional[key] = (
                        f"{value:.0f}" if value is not None else "N/A"
                    )
                else:
                    formatted_additional[key] = (
                        str(value) if value is not None else "N/A"
                    )

        prompt = render_template(
            "prompts/stock_analysis.jinja2",
            ticker=ticker,
            company_name=company_name,
            technical_summary=technical_summary,
            fundamental_summary=fundamental_summary,
            news_summary=news_summary,
            advanced_metrics=formatted_metrics,
            additional_fundamentals=formatted_additional,
        )

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial analyst. Provide balanced analysis without giving advice.",
                    },
                    {"role": "user", "content": prompt},
                ],
            )
            content = response.choices[0].message.content

            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            parsed = json.loads(json_match.group() if json_match else content)

            return AIInterpretation(
                overall_summary=parsed.get("overall_summary", ""),
                bull_case=parsed.get("bull_case", ""),
                bear_case=parsed.get("bear_case", ""),
                risk_factors=parsed.get("risk_factors", []),
                neutral_scenario=parsed.get("neutral_scenario", ""),
                recommendation=parsed.get("recommendation", "Hold"),
                recommendation_rationale=parsed.get("recommendation_rationale", ""),
            )

        except Exception as e:
            app_logger.error(f"AI error: {str(e)}")
            return AIInterpretation(
                overall_summary="AI service unavailable",
                bull_case="See data above",
                bear_case="See data above",
                risk_factors=[],
                neutral_scenario="Pending",
                recommendation="Hold",
                recommendation_rationale="Unable to generate recommendation explanation due to service unavailability.",
            )
