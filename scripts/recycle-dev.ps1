Param(
    [switch]$OpenBrowser = $false
)

# Recycling script: cleanly stops and restarts the dev server and client.
# Usage: .\scripts\recycle-dev.ps1         # restarts both without opening browser
#        .\scripts\recycle-dev.ps1 -OpenBrowser:$true   # restarts and opens browser

Write-Host "Recycling development environment..." -ForegroundColor Cyan

# Stop any existing Node.js processes (dev servers)
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 500

# Stop any PowerShell windows created by start-dev.ps1
Write-Host "Stopping dev server and client windows..." -ForegroundColor Yellow
Get-Process -Name powershell -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainWindowTitle -match 'Human-Resource|Vite' 
} | Stop-Process -Force
Start-Sleep -Milliseconds 500

Write-Host "Development environment stopped." -ForegroundColor Green
Start-Sleep -Seconds 1

# Now start fresh
Write-Host "Starting development environment..." -ForegroundColor Cyan
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

& "$scriptDir\start-dev.ps1" -OpenBrowser:$OpenBrowser

Write-Host "Development environment recycled." -ForegroundColor Green
