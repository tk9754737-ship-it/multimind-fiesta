# setup.ps1 - Smart setup for Multimind AI Fiesta
# Run: .\setup.ps1

Write-Host "`nSetting up Multimind AI Fiesta..." -ForegroundColor Green

# 1. Copy .env.example to .env.local (only if missing)
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local -Force
    Write-Host "Created .env.local - Edit with your API keys!" -ForegroundColor Yellow
} else {
    Write-Host ".env.local already exists - Good!" -ForegroundColor Cyan
}

# 2. Skip npm install if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..." -ForegroundColor Magenta
    npm install
} else {
    Write-Host "node_modules found - Skipping npm install" -ForegroundColor Cyan
}

# 3. Start the app
Write-Host "`nStarting development server..." -ForegroundColor Green
Write-Host "Open http://localhost:3000 in your browser`n" -ForegroundColor White

npm run dev