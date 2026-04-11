# Stock Deep Dive - Architecture Redesign

**Date:** 2026-04-11
**Status:** Draft

---

## 1. Problem Statement

The codebase has grown organically and now has several issues that will compound as features grow:

- **Duplicated data:** `tickers.ts` has ~575 tickers with ~30 duplicates
- **Massive unstructured types:** `FundamentalData` has 100+ fields — hard to reason about, no validation
- **Mixed concerns:** Data fetching tangled with business logic (e.g., `DataService` does both)
- **No adapter pattern:** Adding a new data source (Polygon, Alpha Vantage) requires modifying existing code
- **Inconsistent boundaries:** Routes import from both `application/` and `features/` creating circular-ish dependencies
- **Unused code:** Many Pydantic response models defined but never used
- **Inefficient data structures:** Duplicate ticker entries add unnecessary overhead to autocomplete filtering

---

## 2. Design Principles

1. **Source adapters** — Each data source (Yahoo Finance, etc.) is a self-contained adapter. To add a new source, copy a template file and implement the interface. No magic, no registry lookup at runtime — just explicit imports.

2. **Layered architecture** — HTTP → Services → Sources. Services contain pure business logic (no I/O). Sources handle all external data fetching. Infrastructure handles persistence.

3. **Focused domain types** — Split the 100+ field `FundamentalData` into smaller, cohesive Pydantic models with explicit validation. Each type has one clear purpose.

4. **Validation at boundaries** — Validate all incoming data at the API boundary. Business logic can assume valid data.

5. **Explicit over implicit** — No magic. AI comprehension means: clear interfaces, documented function signatures, predictable behavior.

6. **YAGNI** — Don't build abstraction layers we don't yet need. Add them when the second source requires it.

---

## 3. Backend Architecture

### 3.1 New Directory Structure

```
backend/
├── api/
│   ├── routes.py          # All HTTP endpoints (thin, only request/response)
│   └── dependencies.py    # FastAPI dependencies (validators, injectors)
├── domain/
│   ├── models.py          # All Pydantic models (validated types)
│   └── exceptions.py      # Domain-specific exceptions
├── services/
│   ├── analyzer.py        # Orchestrates full analysis pipeline
│   ├── fundamental.py     # Fundamental interpretation logic
│   ├── technical.py       # Technical indicator calculations
│   ├── advanced.py        # Advanced metrics (statistical/seasonal)
│   ├── ai.py              # AI interpretation via OpenRouter
│   └── performance.py     # Performance calculations
├── sources/
│   ├── base.py           # Abstract adapter interface (base class + dataclass)
│   └── yahoo.py           # Yahoo Finance implementation
├── infrastructure/
│   ├── persistence.py     # JSON file storage (watchlist)
│   └── logging.py         # Logging setup
├── config.py              # Configuration (environment variables)
├── main.py                # FastAPI app entry point
├── prompts/               # Jinja2 templates for AI
└── data/                  # Runtime data (watchlist.json)
```

### 3.2 Layer Responsibilities

| Layer | Responsibility | Rules |
|-------|---------------|-------|
| `api/` | HTTP handling | Thin — parse request, call service, return response. No business logic. |
| `domain/` | Type definitions | Pydantic models with validation. No I/O. No dependencies on other layers. |
| `services/` | Business logic | Pure functions. No imports from `sources/` or `infrastructure/`. |
| `sources/` | Data fetching | Adapters that implement a common interface. Only layer that calls external APIs. |
| `infrastructure/` | I/O concerns | File persistence, logging. Called only from services, never from domain. |

### 3.3 Source Adapter Interface

```python
# sources/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class OHLCData:
    """Immutable OHLC price data"""
    timestamp: list[datetime]
    open: list[float]
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[int]
    start_date: datetime
    end_date: datetime

@dataclass(frozen=True)
class TickerInfo:
    """Ticker fundamentals and company info"""
    ticker: str
    market_cap: float | None
    pe_ratio: float | None
    # ... (smaller focused fields, not 100+)
    # Split into: ValuationMetrics, ProfitabilityMetrics, OwnershipData, etc.

class DataSource(ABC):
    """Abstract interface for data sources"""

    @abstractmethod
    async def fetch_ohlc(
        self,
        ticker: str,
        period: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> OHLCData:
        """Fetch OHLC data for a ticker"""
        ...

    @abstractmethod
    async def fetch_ticker_info(self, ticker: str) -> TickerInfo:
        """Fetch fundamental metrics and company info"""
        ...

    @abstractmethod
    async def fetch_current_price(self, ticker: str) -> float:
        """Fetch current price for a ticker"""
        ...

    @abstractmethod
    async def fetch_current_prices(self, tickers: list[str]) -> dict[str, float]:
        """Batch fetch current prices for multiple tickers"""
        ...
```

### 3.4 New Domain Models

Split `FundamentalData` (100+ fields) into focused types:

```python
# domain/models.py

# --- Core OHLC ---
@dataclass(frozen=True)
class OHLCData:
    timestamp: list[datetime]
    open: list[float]
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[int]
    start_date: datetime
    end_date: datetime

# --- Company Info ---
@dataclass(frozen=True)
class CompanyInfo:
    ticker: str
    name: str
    sector: str | None
    industry: str | None
    website: str | None
    description: str | None
    currency: str | None
    # ... only fields actually used

# --- Valuation Metrics ---
@dataclass(frozen=True)
class ValuationMetrics:
    market_cap: float | None
    pe_ratio: float | None
    forward_pe: float | None
    peg_ratio: float | None
    price_to_book: float | None
    price_to_sales: float | None
    enterprise_value: float | None
    enterprise_to_ebitda: float | None

# --- Profitability Metrics ---
@dataclass(frozen=True)
class ProfitabilityMetrics:
    profit_margin: float | None
    gross_margins: float | None
    operating_margins: float | None
    roe: float | None
    return_on_assets: float | None
    return_on_investment: float | None

# --- Growth Metrics ---
@dataclass(frozen=True)
class GrowthMetrics:
    revenue_growth: float | None
    earnings_growth: float | None
    earnings_quarterly_growth: float | None

# --- Dividend Metrics ---
@dataclass(frozen=True)
class DividendMetrics:
    dividend_yield: float | None
    dividend_rate: float | None
    payout_ratio: float | None
    trailing_annual_dividend_rate: float | None
    trailing_annual_dividend_yield: float | None

# --- Financial Health ---
@dataclass(frozen=True)
class FinancialHealth:
    total_cash: float | None
    total_debt: float | None
    total_cash_per_share: float | None
    current_ratio: float | None
    quick_ratio: float | None
    free_cash_flow: float | None
    operating_cash_flow: float | None
    ebitda: float | None

# --- Ownership ---
@dataclass(frozen=True)
class OwnershipData:
    shares_outstanding: int | None
    float_shares: int | None
    held_percent_insiders: float | None
    held_percent_institutions: float | None
    shares_short: int | None
    short_ratio: float | None
    short_percent_of_float: float | None

# --- Analyst Data ---
@dataclass(frozen=True)
class AnalystData:
    number_of_analyst_opinions: int | None
    recommendation_key: str | None
    recommendation_mean: float | None
    average_analyst_rating: str | None
    target_mean_price: float | None
    target_median_price: float | None
    target_high_price: float | None
    target_low_price: float | None

# --- Market Data ---
@dataclass(frozen=True)
class MarketData:
    previous_close: float | None
    day_high: float | None
    day_low: float | None
    volume: int | None
    average_volume: int | None
    fifty_two_week_high: float | None
    fifty_two_week_low: float | None
    fifty_two_week_change: float | None
    all_time_high: float | None
    all_time_low: float | None
    beta: float | None

# --- Complete Ticker Info (composes the above) ---
@dataclass(frozen=True)
class TickerInfo:
    ticker: str
    company: CompanyInfo
    valuation: ValuationMetrics
    profitability: ProfitabilityMetrics
    growth: GrowthMetrics
    dividend: DividendMetrics
    financial_health: FinancialHealth
    ownership: OwnershipData
    analyst: AnalystData
    market: MarketData
```

### 3.5 Why Frozen Dataclasses

- **Immutability** — Prevents accidental mutation after creation. Data flows in one direction.
- **Hashability** — Can be used as dict keys or set members if needed.
- **Clarity** — `frozen=True` signals "this is a value object, not an entity."
- **Predictability** — No hidden state changes. Easier to reason about for AI.

### 3.6 Service Layer (Pure Business Logic)

Services import from `domain/` and `sources/` (via interfaces), never from each other:

```
services/analyzer.py     → uses services/, domain/, sources/
services/fundamental.py  → uses domain/ only (pure interpretation logic)
services/technical.py     → uses domain/ only (pure calculation logic)
services/advanced.py     → uses domain/ only
services/ai.py           → uses domain/, common/config (for API key only)
services/performance.py  → uses domain/ only
```

Note: `services/ai.py` needs `common/config.py` for the API key — this is configuration, not a service dependency.

### 3.7 Adding a New Data Source

**Step 1:** Copy `sources/yahoo.py` to `sources/polygon.py`

**Step 2:** Rename class to `PolygonDataSource` and implement the `DataSource` interface

**Step 3:** In `api/dependencies.py`, create the source based on config:

```python
from sources.yahoo import YahooDataSource
from sources.polygon import PolygonDataSource

def get_data_source() -> DataSource:
    source_type = os.environ.get("DATA_SOURCE", "yahoo")
    if source_type == "polygon":
        return PolygonDataSource()
    return YahooDataSource()  # default
```

No changes needed to services or routes — they only know about the `DataSource` interface.

---

## 4. Frontend Architecture

### 4.1 Deduplicate Tickers

Current `tickers.ts` has ~30 duplicate entries. Fix: deduplicate and keep unique tickers only.

```typescript
// Before: 575 entries with ~30 duplicates
// After: ~545 unique entries
```

### 4.2 New Directory Structure

```
frontend/src/
├── components/
│   ├── AutocompleteInput/
│   ├── PriceChart/
│   ├── StockNews/
│   ├── MetricsCard/
│   ├── AnalysisResults/
│   └── shared/           # Reusable UI components
├── hooks/
│   ├── useStockAnalysis.ts
│   └── useWatchlist.ts
├── services/
│   ├── api.ts           # API client
│   └── watchlist.ts
├── types/
│   ├── analysis.ts      # API response types (mirrors backend)
│   └── watchlist.ts
├── constants/
│   ├── tickers.ts       # Deduplicated
│   └── metrics.ts
├── utils/
│   └── formatting.ts
├── pages/
│   ├── PerformanceCalculatorPage.tsx
│   └── WatchlistPage.tsx
└── App.tsx
```

### 4.3 Type Alignment

Frontend `types/` should mirror backend `domain/models.py` so there's no translation layer. Backend returns `OHLCData`, frontend receives the same shape.

---

## 5. Implementation Order

### Phase 1: Backend Foundation
1. Create new directory structure (`api/`, `domain/`, `services/`, `sources/`, `infrastructure/`)
2. Create `domain/models.py` with frozen dataclasses
3. Create `domain/exceptions.py`
4. Create `sources/base.py` with abstract interface
5. Migrate `sources/yahoo.py` from current `features/data/service.py`
6. Create `infrastructure/logging.py` (from current `common/logging.py`)
7. Create `infrastructure/persistence.py` (from current `features/watchlist/service.py` watchlist persistence)
8. Update `config.py` to new location

### Phase 2: Service Migration
9. Create `services/fundamental.py` (from current `features/fundamental/service.py`)
10. Create `services/technical.py` (from current `features/technical/service.py`)
11. Create `services/advanced.py` (from current `features/advanced/service.py`)
12. Create `services/performance.py` (from current `features/performance/service.py`)
13. Create `services/ai.py` (from current `features/ai/service.py`)
14. Create `services/analyzer.py` (from current `application/analysis.py`)

### Phase 3: API and Routes
15. Create `api/dependencies.py` — FastAPI dependency injection for data source
16. Migrate `api/routes.py` from current `core/routes.py`
17. Update `main.py` to use new structure

### Phase 4: Frontend
18. Deduplicate `constants/tickers.ts`
19. Verify frontend works against new backend

### Phase 5: Cleanup
20. Remove old directory structure (`core/`, `features/`, `shared/`, `common/`, `application/`)
21. Remove unused Pydantic response models from current `responses.py`

---

## 6. Success Criteria

- [ ] All 4 data source operations work via adapter (fetch_ohlc, fetch_ticker_info, fetch_current_price, fetch_current_prices)
- [ ] Domain models use frozen dataclasses with validation
- [ ] Services contain no imports from `sources/` or `infrastructure/`
- [ ] Frontend ticker autocomplete has no duplicates
- [ ] All existing tests pass (if any exist)
- [ ] API contracts unchanged (frontend continues to work without modification)

---

## 7. Open Questions

1. **Response models** — Current `responses.py` has many unused Pydantic models (`IndicatorPoint`, `RSISeries`, `MacdSeries`, etc.). Should these be kept for future use or removed as dead code?

2. **Watchlist persistence** — Currently uses JSON file. Is file-based storage acceptable, or should we design for future database migration?

3. **AI prompt templates** — Currently in `prompts/stock_analysis.jinja2`. Keep as-is or refactor?

4. **Frontend types** — Should frontend `types/` be auto-generated from backend types (e.g., via openapi schemas), or manually maintained to match?
