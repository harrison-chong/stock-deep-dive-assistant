# Stock Deep Dive

## Overview

A comprehensive stock analysis application that helps users make informed investment decisions by providing detailed financial metrics, technical analysis, AI-powered insights, and portfolio tracking tools.

The application provides:

1. **Stock Analysis** - Enter any stock ticker to get comprehensive analysis including:
   - Technical indicators (RSI, MACD, Bollinger Bands, Moving Averages, etc.)
   - Fundamental metrics (P/E ratio, ROE, margins, dividend data, etc.)
   - Advanced statistics (Sharpe ratio, Sortino ratio, max drawdown, etc.)
   - Seasonal patterns and trailing returns
   - Real-time news integration

2. **AI-Powered Insights** - Get AI-generated bull/bear case analysis, risk factors, and recommendations based on comprehensive financial data

3. **Performance Calculator** - Track potential gains/losses by entering purchase price, quantity, and date

4. **Watchlist** - Monitor stocks you're interested in with entry prices and notes

## Tech Stack

### Frontend

- TypeScript
- React
- Tailwind CSS
- Vite

### Backend

- Python
- FastAPI
- UV Package Manager
- OpenAI API

## How to Run

### Prerequisites

You need to have [uv](https://docs.astral.sh/uv/getting-started/installation/) installed as well as [node.js](https://nodejs.org/en/download).

### Setup

Create environment variable file:

```bash
cp backend/.env.example backend/.env
```

Add in your own `OPENAI_API_KEY` to the .env file.

### Starting the Application

#### Windows

In the root repository, run:

```ps1
.\start-dev.ps1
```

#### macOS

In the root repository, run:

```bash
./start-dev.sh
```

or

```bash
bash start-dev.sh
```

Then open `http://localhost:5173` in your browser.

## Installing pre-commit hook

```ps1
# For Windows
winget install --id j178.Prek

prek install

# For Mac
brew install prek

prek install
```
