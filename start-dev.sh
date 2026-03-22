#!/bin/bash

# Bash script to run both backend (FastAPI with uv) and frontend (Vite React)
# Run this from the root of your repository

orig=$(pwd)
trap "cd '$orig'" EXIT

# Sync backend dependencies
cd backend
uv sync --all-extras
cd ..

# Start backend in background
cd backend
uv run fastapi dev &
backend_pid=$!
cd ..

# Wait for backend to start before launching frontend for cleaner logs
sleep 3

# Install frontend dependencies and start dev server
cd frontend
npm install
npm run dev &
frontend_pid=$!

# Wait for both processes
wait $backend_pid
wait $frontend_pid