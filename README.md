# 🚀 Stock Deep Dive Assistant

AI-powered stock analysis with technical indicators, fundamental metrics, and AI interpretation.

---

## Quick Start

### Prerequisites
- **Python 3.12+**
- **Node 18+**
- **OpenAI API Key** ([get one here](https://platform.openai.com/api/keys))

### Setup (One Time)

1. **Backend**
   ```bash
   cd backend
   pip install -e .
   cp .env.example .env
   # Edit .env and add: OPENAI_API_KEY=sk-...
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   ```

### Run

#### Option 1: Using the dev script (Recommended)
```bash
.\start-dev.ps1
```

#### Option 2: Manual (two terminals)
**Terminal 1 - Backend:**
```bash
cd backend
uv run fastapi dev
# or: python -m backend.main
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` and analyze a stock (e.g., `AAPL`, `BHP.AX`)

---

## Project Structure

```
backend/
  ├── config.py        # Settings
  ├── main.py          # App startup
  ├── routes.py        # API endpoints
  ├── models.py        # Request/response schemas
  ├── services.py      # All analysis logic
  └── common/          # Shared types & helpers

frontend/
  ├── src/App.tsx      # React component
  └── tailwind.css     # Styling
```

---

## API

`POST /api/analyze`

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL"}'
```

---

## Features Implemented

✅ Technical indicators (SMA, EMA, RSI, MACD, Bollinger, ATR, Volatility)  
✅ Fundamental metrics (P/E, ROE, Debt-to-Equity, etc.)  
✅ AI interpretation via OpenAI  
✅ React + Tailwind UI  

🚧 TODO: News integration, peer discovery, advanced scoring

---

## Where to Add Features

All backend logic is in `backend/services.py`. Add new services there:

```python
class NewsService:
    async def get_news(self, ticker: str):
        # Use NewsAPI or similar
        pass
```

Then wire it up in `backend/routes.py`:

```python
news_service = NewsService()
news = await news_service.get_news(ticker)
```

---

## Troubleshooting

**Frontend won't load?**
- Make sure backend is running: `curl http://localhost:8000/health`

**"OpenAI API error"?**
- Check `OPENAI_API_KEY` is in `backend/.env`

**"Ticker not found"?**
- Use valid ticker (e.g., `AAPL` not `Apple`)

---

## Disclaimer

**Educational purposes only.** Not financial advice. Always consult advisors before investing.
