#!/bin/bash

# Kill any process running on port 5173
fuser -k 5173/tcp 2>/dev/null || true

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