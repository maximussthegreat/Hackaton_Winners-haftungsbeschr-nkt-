$ErrorActionPreference = "SilentlyContinue"

# Get the absolute path of the project root (Parent of the scripts folder)
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptPath

Write-Host "Starting SENTINEL: The All-Seeing Port Brain..." -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray

# 1. Start The Brain (Port 8002) - Explicit CWD
Write-Host "Launching BRAIN (Cognition Layer) on Port 8002..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; .\venv\Scripts\Activate; uvicorn brain.main:app --reload --port 8002"

# 2. Start The Eye (Port 8001) - Explicit CWD
Write-Host "Launching EYE (Perception Layer) on Port 8001..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; .\venv\Scripts\Activate; uvicorn eye.main:app --reload --port 8001"

# 3. Start The Twin (Port 3000)
Write-Host "Launching TWIN (Interaction Layer) on Port 3000..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\twin'; npm run dev"

Write-Host "System Online. Waiting for services..."
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "---------------------------------------------------"
Write-Host "DEMO COMMANDS:"
Write-Host "To trigger the anomaly manually (if voice fails):"
Write-Host "Invoke-RestMethod -Method Post -Uri 'http://localhost:8002/simulate/sensor_failure'"
Write-Host "---------------------------------------------------"
