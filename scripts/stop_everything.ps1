Write-Host "Stopping all SENTINEL processes..." -ForegroundColor Yellow

# Kill Python (Uvicorn)
Get-Process -Name "uvicorn" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*uvicorn*" } | Stop-Process -Force

# Kill Node.js (Next.js)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "All services stopped." -ForegroundColor Green
