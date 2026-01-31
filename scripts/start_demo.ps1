$projectRoot = "C:\Users\maxim\HackatonJanuary"
$logDir = "$projectRoot\logs"

# Ensure log directory exists
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

Write-Host "Starting SENTINEL: The All-Seeing Port Brain..." -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot"
Write-Host "Logs are being written to $logDir" -ForegroundColor Yellow

# 3. Install Dependencies (The "Triple Check")
Write-Host "Installing Dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Kill existing processes (simple cleanup)
Get-Process -Name "uvicorn" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "next" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force # Be careful with this on shared machines

# Start BRAIN (Visible Window, Persistent)
Write-Host "Launching BRAIN (Cognition Layer) on Port 8002..."
Start-Process "cmd" "/k call venv\Scripts\activate && python -m uvicorn brain.main:app --reload --port 8002 --host 127.0.0.1" -WorkingDirectory "$projectRoot"

# Start EYE (Visible Window, Persistent)
Write-Host "Launching EYE (Perception Layer) on Port 8001..."
Start-Process "cmd" "/k call venv\Scripts\activate && python -m uvicorn eye.main:app --reload --port 8001 --host 127.0.0.1" -WorkingDirectory "$projectRoot"

# Start TWIN (Visible Window, Persistent)
Write-Host "Launching TWIN (Interaction Layer) on Port 3000..."
Start-Process "cmd" "/k npm run dev" -WorkingDirectory "$projectRoot\twin"

Write-Host "System Launching in 3 external windows..." -ForegroundColor Cyan

Write-Host "System Online. Check logs for details." -ForegroundColor Cyan
Write-Host "Run .\scripts\show_logs.ps1 to see errors." -ForegroundColor Yellow
