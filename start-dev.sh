#!/bin/bash

# Kill any process running on ports 5173 and 8000
lsof -ti :5173 | xargs kill -9 2>/dev/null || true
lsof -ti :8000 | xargs kill -9 2>/dev/null || true

# Start backend in background
cd backend
uv run fastapi dev &
backend_pid=$!
cd ..

# Install frontend dependencies and start dev server
cd frontend
npm install
npm run dev &
frontend_pid=$!

# Wait for both processes
wait $backend_pid
wait $frontend_pid