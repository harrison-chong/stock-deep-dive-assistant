"""Fundamental analysis service — pure business logic, no I/O."""

from domain.models import TickerInfo, InterpretationThresholds, FinancialHealth


def get_interpretations(ticker_info: TickerInfo) -> dict[str, str]:
    """Generate plain-English interpretations of metrics."""
    thresholds = InterpretationThresholds()
    val = ticker_info.valuation
    profit = ticker_info.profitability
    growth = ticker_info.growth
    fin = ticker_info.financial_health
    div = ticker_info.dividend

    return {
        "pe_ratio": _interpret_pe(val.pe_ratio, thresholds),
        "forward_pe": _interpret_forward_pe(val.forward_pe, thresholds),
        "roe": _interpret_roe(profit.roe, thresholds),
        "debt_to_equity": _interpret_debt_to_equity(fin, thresholds),
        "peg_ratio": _interpret_peg(val.peg_ratio, thresholds),
        "dividend_yield": _interpret_dividend(div.dividend_yield, thresholds),
        "revenue_growth": _interpret_growth(growth.revenue_growth, thresholds),
    }


def _interpret_pe(pe: float | None, t: InterpretationThresholds) -> str:
    if pe is None:
        return "Data unavailable"
    if pe < t.pe_undervalued:
        return "Undervalued"
    if pe < t.pe_moderate:
        return "Moderate valuation"
    return "Premium valuation"


def _interpret_forward_pe(forward_pe: float | None, t: InterpretationThresholds) -> str:
    if forward_pe is None:
        return "Data unavailable"
    if forward_pe < t.pe_undervalued:
        return "Cheap on forward earnings"
    if forward_pe < t.pe_moderate:
        return "Fair forward valuation"
    return "Expensive forward valuation"


def _interpret_roe(roe: float | None, t: InterpretationThresholds) -> str:
    if roe is None:
        return "Data unavailable"
    if roe > t.roe_excellent:
        return "Excellent ROE"
    if roe > t.roe_strong:
        return "Strong ROE"
    if roe > t.roe_decent:
        return "Decent ROE"
    return "Weak ROE"


def _interpret_debt_to_equity(fin: FinancialHealth, t: InterpretationThresholds) -> str:
    if fin.total_debt is not None and fin.total_cash is not None and fin.total_cash > 0:
        ratio = fin.total_debt / fin.total_cash
        if ratio < t.debt_conservative:
            return "Conservative leverage"
        if ratio < t.debt_moderate:
            return "Moderate leverage"
        return "High leverage - risky"
    return "Data unavailable"


def _interpret_peg(peg: float | None, t: InterpretationThresholds) -> str:
    if peg is None:
        return "Data unavailable"
    if peg < t.peg_undervalued:
        return "Undervalued vs growth"
    if peg < t.peg_fair:
        return "Fair value"
    return "Overvalued vs growth"


def _interpret_dividend(div_yield: float | None, t: InterpretationThresholds) -> str:
    if div_yield is None or div_yield == 0:
        return "No dividend"
    if div_yield > t.div_yield_high:
        return "High yield"
    return "Modest yield"


def _interpret_growth(growth_val: float | None, t: InterpretationThresholds) -> str:
    if growth_val is None:
        return "Data unavailable"
    if growth_val > t.growth_strong:
        return "Strong growth"
    if growth_val > t.growth_moderate:
        return "Moderate growth"
    if growth_val > t.growth_positive:
        return "Slow growth"
    return "Declining"
