# PowerShell script to run both backend (FastAPI with uv) and frontend (Vite React)
# Run this from the root of your repository

# Sync backend dependencies
Set-Location backend
uv sync --all-extras
Set-Location ..
Start-Process -FilePath "uv" -ArgumentList "run fastapi dev" -WorkingDirectory "backend" -NoNewWindow

# Wait for backend to start before launching frontend for cleaner logs
Start-Sleep -Seconds 3

# Install frontend dependencies and start dev server
Set-Location frontend
npm install
npm run dev