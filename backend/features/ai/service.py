"""
AI analysis service using OpenRouter.
"""

import json
import re

from shared.domain import AIInterpretation
from common.config import config
from common.client import client
from common.utils import render_template


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
    ) -> AIInterpretation:
        """Use LLM to generate holistic interpretation"""

        prompt = render_template(
            "prompts/stock_analysis.jinja2",
            ticker=ticker,
            company_name=company_name,
            technical_summary=technical_summary,
            fundamental_summary=fundamental_summary,
            news_summary=news_summary,
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
                confidence_score=float(parsed.get("confidence_score", 50)),
            )

        except Exception as e:
            print(f"AI error: {str(e)}")
            return AIInterpretation(
                overall_summary="AI service unavailable",
                bull_case="See data above",
                bear_case="See data above",
                risk_factors=[],
                neutral_scenario="Pending",
                recommendation="Hold",
                recommendation_rationale="Unable to generate recommendation explanation due to service unavailability.",
                confidence_score=0,
            )
