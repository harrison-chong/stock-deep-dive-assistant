"""
Fundamental analysis service.
"""

from shared.domain import FundamentalData


class FundamentalService:
    """Analyze fundamental metrics"""

    @staticmethod
    def get_interpretations(data: FundamentalData) -> dict:
        """Generate plain-English interpretations of metrics"""
        return {
            "pe_ratio": _interpret_pe(data.pe_ratio),
            "forward_pe": _interpret_forward_pe(data.forward_pe),
            "roe": _interpret_roe(data.roe),
            "debt_to_equity": _interpret_debt_to_equity(data.debt_to_equity),
            "peg_ratio": _interpret_peg(data.peg_ratio),
            "dividend_yield": _interpret_dividend(data.dividend_yield),
            "revenue_growth": _interpret_growth(data.revenue_growth),
        }


def _interpret_pe(pe: float | None) -> str:
    if pe is None:
        return "Data unavailable"
    if pe < 15:
        return "Undervalued"
    elif pe < 25:
        return "Moderate valuation"
    else:
        return "Premium valuation"


def _interpret_forward_pe(forward_pe: float | None) -> str:
    if forward_pe is None:
        return "Data unavailable"
    if forward_pe < 15:
        return "Cheap on forward earnings"
    elif forward_pe < 25:
        return "Fair forward valuation"
    else:
        return "Expensive forward valuation"


def _interpret_roe(roe: float | None) -> str:
    if roe is None:
        return "Data unavailable"
    if roe > 0.20:
        return "Excellent ROE"
    elif roe > 0.15:
        return "Strong ROE"
    elif roe > 0.10:
        return "Decent ROE"
    else:
        return "Weak ROE"


def _interpret_debt_to_equity(ratio: float | None) -> str:
    if ratio is None:
        return "Data unavailable"
    if ratio < 0.5:
        return "Conservative leverage"
    elif ratio < 1.5:
        return "Moderate leverage"
    else:
        return "High leverage - risky"


def _interpret_peg(peg: float | None) -> str:
    if peg is None:
        return "Data unavailable"
    if peg < 1.0:
        return "Undervalued vs growth"
    elif peg < 2.0:
        return "Fair value"
    else:
        return "Overvalued vs growth"


def _interpret_dividend(div_yield: float | None) -> str:
    if div_yield is None or div_yield == 0:
        return "No dividend"
    if div_yield > 0.05:
        return "High yield"
    else:
        return "Modest yield"


def _interpret_growth(growth: float | None) -> str:
    if growth is None:
        return "Data unavailable"
    if growth > 0.15:
        return "Strong growth"
    elif growth > 0.05:
        return "Moderate growth"
    elif growth > 0:
        return "Slow growth"
    else:
        return "Declining"
