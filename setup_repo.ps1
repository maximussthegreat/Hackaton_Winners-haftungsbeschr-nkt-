$ErrorActionPreference = "Stop"

Write-Host "Initializing Git Repository..."
git init

Write-Host "Staging files..."
git add .

Write-Host "Committing initial files..."
git commit -m "Initial commit: Generic hackathon repository structure"

Write-Host "`nRepository Initialized Successfully!"
Write-Host "---------------------------------------------------"
Write-Host "NEXT STEPS:"
Write-Host "1. Go to https://github.com/new"
Write-Host "2. Create a new repository (Public)"
Write-Host "3. Run the following commands to push:"
Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
