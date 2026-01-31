$ErrorActionPreference = "SilentlyContinue"

Write-Host "Starting SENTINEL System..." -ForegroundColor Cyan

# 1. Start The Eye (Data Fusion)
Write-Host "1. Opening The Eye (Port 8001)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\maxim\HackatonJanuary; uvicorn eye.main:app --host 0.0.0.0 --port 8001 --reload"

# 2. Start The Brain (Cognitive Core)
Write-Host "2. Activating The Brain (Port 8002)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\maxim\HackatonJanuary; uvicorn brain.main:app --host 0.0.0.0 --port 8002 --reload"

# 3. Start The Twin (Frontend)
Write-Host "3. Projecting The Twin (Localhost:3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\maxim\HackatonJanuary\twin; npm run dev"

Write-Host "------------------------------------------------"
Write-Host "SYSTEM ONLINE." -ForegroundColor Green
Write-Host "Access the Twin at: http://localhost:3000"
