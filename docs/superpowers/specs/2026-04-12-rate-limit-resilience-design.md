# Rate Limit Resilience — Design Spec

**Date:** 2026-04-12
**Status:** Approved
**Parent:** Stock Deep Dive Assistant Enhancement

---

## Problem Statement

When Render's free tier spins down after inactivity and then receives a request, it fires multiple concurrent Yahoo Finance API calls (OHLC data, ticker info, current price, etc.) via `asyncio.gather`. Yahoo Finance rate limits these bursts, causing 503 errors and failed analyses.

---

## Solution Overview

Four layers of defense, applied in order:

1. **Concurrency Control** — semaphore limits Yahoo requests to 1 at a time
2. **In-Memory Cache** — ticker info and OHLC cached for 5 minutes to avoid redundant calls
3. **Call Deduplication** — reuse already-fetched OHLC/ticker data instead of re-fetching for AI analysis or chart updates
4. **Graceful Degradation** — clear error messages when rate limits are hit despite above measures

---

## Detailed Design

### 1. Concurrency Control

**File:** `backend/sources/yahoo.py`

Add an asyncio `Semaphore` to limit concurrent Yahoo Finance requests to **1 at a time**:

```python
from asyncio import Semaphore

_yahoo_semaphore = Semaphore(1)
```

Wrap every Yahoo API call behind this semaphore. All methods on `YahooDataSource` that call `_retry_with_backoff` already do this implicitly by using `_retry_with_backoff` — no per-call changes needed, just add the semaphore wrapper inside `_retry_with_backoff`:

```python
async def _retry_with_backoff(func, max_retries: int = 3, base_delay: float = 5.0):
    async with _yahoo_semaphore:
        for attempt in range(max_retries):
            try:
                return func()
            except YFRateLimitError:
                if attempt == max_retries - 1:
                    raise RateLimitError("Yahoo Finance rate limit exceeded")
                delay = base_delay * (2 ** attempt)
                app_logger.warning(
                    f"Rate limit hit, retrying in {delay}s... (attempt {attempt + 1}/{max_retries})"
                )
                await asyncio.sleep(delay)
            except Exception:
                raise
```

The semaphore ensures only one Yahoo request is in-flight at any moment, preventing burst-triggered rate limits.

### 2. In-Memory Cache for Ticker Info

**File:** `backend/sources/yahoo.py`

Ticker info (company name, sector, P/E, ROE, etc.) changes infrequently. Cache it for **5 minutes**:

```python
from datetime import datetime, timedelta

_ticker_info_cache: dict[str, tuple[datetime, dict]] = {}

async def fetch_ticker_info_cached(self, ticker: str) -> dict:
    now = datetime.now()
    if ticker in _ticker_info_cache:
        cached_time, cached_data = _ticker_info_cache[ticker]
        if now - cached_time < timedelta(minutes=5):
            app_logger.debug(f"Returning cached ticker info for {ticker}")
            return cached_data

    def fetch() -> dict:
        ticker_obj = yf.Ticker(ticker)
        return ticker_obj.info

    info = await _retry_with_backoff(fetch)
    _ticker_info_cache[ticker] = (now, info)
    return info
```

Replace calls to `fetch_ticker_info` in `analyze()` and `generate_ai_outlook()` with `fetch_ticker_info_cached()`.

**OHLC data is NOT cached** — it must be fresh for accurate technical analysis.

### 3. Graceful Degradation

**File:** `backend/api/routes.py`

When `RateLimitError` is raised despite the above measures, return a **503 with a user-friendly message**:

```python
except RateLimitError:
    raise HTTPException(
        status_code=503,
        detail="RATE_LIMIT_MSG",
    )
```

The frontend already maps `RATE_LIMIT_MSG` to a user-friendly message. No frontend change needed.

### 4. Call Deduplication

**Problem:** When a user runs "Analyze" then "Generate AI", the backend makes 4 Yahoo calls (OHLC + ticker_info × 2) when only 1 set is needed — the data from `analyze()` is discarded before `generate_ai_outlook()` re-fetches identical data.

Similarly, `updateChartData` in the frontend calls `/api/chart-data` to re-fetch OHLC after `analyze()` already loaded it.

**Fix A: Allow `generate_ai_outlook` to reuse data from `analyze()`**

File: `backend/services/analyzer.py`

Make `ohlc` and `info` optional parameters. If caller passes them in, skip the fetch:

```python
async def generate_ai_outlook(
    self,
    ticker: str,
    period: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    ohlc: OHLCData | None = None,       # new
    info: dict | None = None,           # new
) -> AIInterpretation:
    if ohlc is None or info is None:
        ohlc, info = await asyncio.gather(
            self.data_source.fetch_ohlc(...),
            self.data_source.fetch_ticker_info_cached(...),
        )
```

**Fix B: Backend route accepts pre-loaded data**

File: `backend/api/routes.py`

`POST /api/analyze/ai` accepts optional `ohlc` and `ticker_info` in the request body. If provided, the analyzer skips its own fetch. If omitted, falls back to current behavior.

**Fix C: Frontend reuses data already loaded**

File: `frontend/src/hooks/useStockAnalysis.ts`

When `handleGenerateAI` is called, pass the already-loaded OHLC and ticker info from `data` in the request body so the backend can skip the redundant fetch. The `analyzeStock` response (from `handleAnalyze`) already contains `chart_data` (OHLC-derived) — this can be passed through.

Specifically, add optional fields to the `generateAIAnalysis` API call:
```typescript
// In the request body:
{
  ticker,
  period,
  start_date,
  end_date,
  ohlc_data: { /* from existing data */ },  // new — skips OHLC fetch
  ticker_info: { /* from existing data */ } // new — skips ticker_info fetch
}
```

**Net effect:**
- Analyze alone: 2 Yahoo calls (unchanged)
- Analyze + Generate AI: 2 calls total (down from 4)
- Period change via chart: 1 OHLC call (down from 2)

---

## Files to Modify

| File | Changes |
|------|---------|
| `backend/sources/yahoo.py` | Add semaphore to `_retry_with_backoff`, add `fetch_ticker_info_cached` with in-memory cache |
| `backend/services/analyzer.py` | Add OHLC cache and `_reconstruct_ohlc`; `generate_ai_outlook` accepts pre-loaded data |
| `backend/api/routes.py` | `POST /analyze/ai` accepts optional pre-fetched `ohlc_data`/`ticker_info_data` in body |
| `frontend/src/services/api.ts` | `generateAIAnalysis` sends already-loaded data to skip backend re-fetch |
| `frontend/src/hooks/useStockAnalysis.ts` | Pass existing OHLC/ticker data on `handleGenerateAI` |

---

## What This Does NOT Change

- OHLC data is always fetched fresh when not provided by caller (no persistent cache)
- AI analysis logic/output is unchanged — only the data-fetching pattern changes
- Retry logic (3 retries, exponential backoff) is preserved as-is

---

## Test Plan

1. **Cache hit test:** Analyze AAPL twice within 5 minutes — second call should be faster (no Yahoo request for ticker info)
2. **Concurrent requests test:** Send 3 analyze requests simultaneously — verify they all succeed (semaphore queues them)
3. **Rate limit fallback:** If Yahoo still rate limits, verify 503 is returned with `RATE_LIMIT_MSG`
4. **Deduplication test:** Call Analyze then Generate AI for the same ticker — verify only 2 Yahoo calls are made (use logging or a mock)

---

## Rollout Order

1. Add semaphore to `_retry_with_backoff` (highest impact, lowest risk)
2. Add ticker info cache
3. Add OHLC cache in analyzer + call deduplication
4. Deploy and monitor

