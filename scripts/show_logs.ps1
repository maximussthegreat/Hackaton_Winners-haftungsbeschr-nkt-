$logDir = "C:\Users\maxim\HackatonJanuary\logs"

function Show-Logs ($service) {
    Write-Host "=== $service LOGS (Output) ===" -ForegroundColor Cyan
    if (Test-Path "$logDir\$service.out.log") { Get-Content "$logDir\$service.out.log" -Tail 10 } else { Write-Host "No $service.out.log" -ForegroundColor DarkGray }
    
    Write-Host "=== $service ERRORS (Stderr) ===" -ForegroundColor Red
    if (Test-Path "$logDir\$service.err.log") { Get-Content "$logDir\$service.err.log" -Tail 10 } else { Write-Host "No $service.err.log" -ForegroundColor DarkGray }
    Write-Host ""
}

Show-Logs "brain"
Show-Logs "eye"
Show-Logs "twin"
