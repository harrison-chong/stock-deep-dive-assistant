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
2. **Request Staggering** — small delay between first and second request on cold wake
3. **In-Memory Cache** — ticker info cached for 5 minutes to avoid redundant calls
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

### 2. Request Staggering on Cold Start

**File:** `backend/services/analyzer.py`

When the app has been idle (detected via a module-level timestamp), add a **2-second delay** before the first Yahoo request. This gives Yahoo's rate limiter time to recognize sequential requests rather than a burst:

```python
import time

_last_request_time: float = 0
COLD_START_DELAY = 2.0  # seconds

def _maybe_cold_start_delay():
    global _last_request_time
    now = time.monotonic()
    if now - _last_request_time > 300:  # 5 minutes idle = cold start
        time.sleep(COLD_START_DELAY)
    _last_request_time = now
```

Call `_maybe_cold_start_delay()` at the start of `analyze()` and `generate_ai_outlook()` in `StockAnalyzer`.

### 3. In-Memory Cache for Ticker Info

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

### 4. Graceful Degradation

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

---

## Files to Modify

| File | Changes |
|------|---------|
| `backend/sources/yahoo.py` | Add semaphore to `_retry_with_backoff`, add `fetch_ticker_info_cached` with in-memory cache |
| `backend/services/analyzer.py` | Add cold-start delay on idle wake |

---

## What This Does NOT Change

- OHLC data is always fetched fresh (no caching of price history)
- AI analysis logic is unchanged
- Frontend is unchanged (existing error handling is sufficient)
- Retry logic (3 retries, exponential backoff) is preserved as-is

---

## Test Plan

1. **Cold-start test:** Kill the Render service, wait 10+ minutes, send an analyze request — verify it succeeds without 503
2. **Cache hit test:** Analyze AAPL twice within 5 minutes — second call should be faster (no Yahoo request)
3. **Concurrent requests test:** Send 3 analyze requests simultaneously — verify they all succeed (semaphore queues them)
4. **Rate limit fallback:** If Yahoo still rate limits, verify 503 is returned with `RATE_LIMIT_MSG`

---

## Rollout Order

1. Add semaphore to `_retry_with_backoff` (highest impact, lowest risk)
2. Add cold-start delay
3. Add ticker info cache
4. Deploy and monitor

