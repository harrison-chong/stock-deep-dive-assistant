"""AI analysis service using OpenRouter."""

import json
import re
import os
from jinja2 import Environment, FileSystemLoader

from domain.models import AIInterpretation
from infrastructure.logging import app_logger


def get_model() -> str:
    """Get AI model name from config."""
    try:
        from config import config

        return config.MODEL_NAME
    except ImportError:
        return os.environ.get("MODEL_NAME", "arcee-ai/trinity-large-preview:free")


def get_client():
    """Get OpenAI client."""
    try:
        from config import config
        from openai import OpenAI

        return OpenAI(base_url=config.BASE_URL, api_key=config.API_KEY)
    except ImportError:
        from openai import OpenAI

        base_url = os.environ.get("BASE_URL", "https://openrouter.ai/api/v1")
        api_key = os.environ.get("API_KEY", "")
        return OpenAI(base_url=base_url, api_key=api_key)


def interpret(
    ticker: str,
    company_name: str,
    technical_summary: str,
    fundamental_summary: str,
    news_summary: str,
    advanced_metrics: dict | None = None,
    additional_fundamentals: dict | None = None,
) -> AIInterpretation:
    """Use LLM to generate holistic interpretation."""
    formatted_metrics = _format_advanced_metrics(advanced_metrics)
    formatted_additional = _format_additional_fundamentals(additional_fundamentals)
    prompt = _render_template(
        "stock_analysis.jinja2",
        ticker=ticker,
        company_name=company_name,
        technical_summary=technical_summary,
        fundamental_summary=fundamental_summary,
        news_summary=news_summary,
        advanced_metrics=formatted_metrics,
        additional_fundamentals=formatted_additional,
    )
    try:
        client = get_client()
        model = get_model()
        response = client.chat.completions.create(
            model=model,
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
            recommendation_rationale="Unable to generate recommendation due to service unavailability.",
        )


def _render_template(template_path: str, **context) -> str:
    """Render Jinja2 template."""
    prompts_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "prompts"
    )
    env = Environment(loader=FileSystemLoader(prompts_dir))
    template = env.get_template(os.path.basename(template_path))
    return template.render(**context)


def _format_advanced_metrics(advanced_metrics: dict | None) -> dict:
    if not advanced_metrics:
        return {"statistical": {}, "technical": {}, "seasonal": {}}
    stat = advanced_metrics.get("statistical", {})
    tech = advanced_metrics.get("technical", {})
    seasonal = advanced_metrics.get("seasonal", {})

    def fmt(val, suffix="%"):
        return f"{(val or 0) * 100:.2f}{suffix}" if val is not None else "N/A"

    return {
        "statistical": {
            "total_return": fmt(stat.get("total_return")),
            "annualized_return": fmt(stat.get("annualized_return")),
            "volatility": fmt(stat.get("annualized_volatility")),
            "sharpe_ratio": f"{stat.get('sharpe_ratio', 0):.2f}",
            "sortino_ratio": f"{stat.get('sortino_ratio', 0):.2f}",
            "calmar_ratio": f"{stat.get('calmar_ratio', 0):.2f}",
            "max_drawdown": fmt(stat.get("max_drawdown")),
            "var_95": fmt(stat.get("var_95")),
            "ulcer_index": f"{stat.get('ulcer_index', 0):.2f}",
            "recovery_days": str(stat.get("recovery_days", "N/A")),
            "skewness": f"{stat.get('skewness', 0):.2f}",
            "kurtosis": f"{stat.get('kurtosis', 0):.2f}",
        },
        "technical": {
            "returns_1m": fmt(tech.get("returns_1m")),
            "returns_3m": fmt(tech.get("returns_3m")),
            "returns_6m": fmt(tech.get("returns_6m")),
            "returns_1y": fmt(tech.get("returns_1y")),
            "price_vs_sma_50": fmt(tech.get("price_vs_sma_50")),
            "price_vs_sma_200": fmt(tech.get("price_vs_sma_200")),
            "golden_cross": "Yes" if tech.get("golden_cross_detected") else "No",
            "death_cross": "Yes" if tech.get("death_cross_detected") else "No",
            "pivot_resistance_1": f"{tech.get('pivot_resistance_1', 0):.2f}",
            "pivot_resistance_2": f"{tech.get('pivot_resistance_2', 0):.2f}",
            "pivot_support_1": f"{tech.get('pivot_support_1', 0):.2f}",
            "pivot_support_2": f"{tech.get('pivot_support_2', 0):.2f}",
            "volume_avg_50d": f"{tech.get('volume_avg_50d', 0):,.0f}",
            "volume_trend": tech.get("volume_trend") or "N/A",
        },
        "seasonal": {
            "monthly_returns": seasonal.get("monthly_returns", {}) if seasonal else {},
            "quarterly_returns": seasonal.get("quarterly_returns", {})
            if seasonal
            else {},
            "day_of_week_effect": seasonal.get("day_of_week_effect", {})
            if seasonal
            else {},
        },
    }


def _format_additional_fundamentals(additional_fundamentals: dict | None) -> dict:
    if not additional_fundamentals:
        return {}
    formatted = {}
    pct_keys = {
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
    }
    large_keys = {
        "market_cap",
        "enterprise_value",
        "ebitda",
        "total_cash",
        "total_debt",
        "free_cash_flow",
        "operating_cash_flow",
    }
    dollar_keys = {
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
    }
    for key, value in additional_fundamentals.items():
        if value is None:
            formatted[key] = "N/A"
        elif key in pct_keys:
            formatted[key] = f"{value:.2f}%"
        elif key in large_keys:
            if abs(value) >= 1e9:
                formatted[key] = f"${value / 1e9:.2f}B"
            elif abs(value) >= 1e6:
                formatted[key] = f"${value / 1e6:.2f}M"
            else:
                formatted[key] = f"${value:.2f}"
        elif key in dollar_keys:
            formatted[key] = f"${value:.2f}"
        elif key in ("beta", "current_ratio", "quick_ratio"):
            formatted[key] = f"{value:.2f}"
        elif key in ("shares_outstanding", "float_shares", "shares_short"):
            formatted[key] = f"{value:,.0f}"
        elif key == "short_ratio":
            formatted[key] = f"{value:.2f}"
        elif key in ("number_of_analyst_opinions", "recommendation_mean"):
            formatted[key] = f"{value:.0f}"
        else:
            formatted[key] = str(value)
    return formatted
