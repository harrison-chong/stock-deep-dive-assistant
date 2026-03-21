# Stock Deep Dive

## Overview

A project to learn about building a stock analysis application.

The goals of this project are to:

1. Build a website that enables users to input a stock ticker
2. When the user presses "analyze", an AI agent will recommend insights about the stock

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
