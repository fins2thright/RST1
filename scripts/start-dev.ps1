Param(
    [switch]$OpenBrowser = $true
)

# Starts the server and client in two new PowerShell windows.
# Usage: .\scripts\start-dev.ps1         # starts both and opens browser
#        .\scripts\start-dev.ps1 -OpenBrowser:$false

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptDir
$serverDir = Join-Path $projectRoot 'server'
$clientDir = $projectRoot

function Start-TerminalProcess {
    param(
        [string]$WorkingDir,
        [string]$Command,
        [string]$Title
    )

    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Warning "npm not found in PATH. Install Node.js and ensure npm is available before running the dev servers."
    }

    # Verify the working directory exists
    if (-not (Test-Path $WorkingDir)) {
        Write-Error "Working directory does not exist: $WorkingDir"
        return $null
    }

    # Build command that properly handles paths with spaces
    $scriptBlock = @"
Set-Location -LiteralPath '$($WorkingDir -replace "'", "''")'
$Command
"@

    $args = @(
        '-NoExit',
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-EncodedCommand',
        [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($scriptBlock))
    )

    $proc = Start-Process -FilePath 'powershell.exe' -ArgumentList $args -WindowStyle Normal -PassThru
    Write-Host "Started $Title (PID $($proc.Id)) in directory: $WorkingDir"
    return $proc
}

Write-Host "Starting Human-Resource server..."
$serverCommand = "cd `"$serverDir`" ; npm run dev"
$serverProc = Start-TerminalProcess -WorkingDir $serverDir -Command $serverCommand -Title 'Human-Resource server'

Start-Sleep -Milliseconds 500

Write-Host "Starting Vite client..."
$clientCommand = "cd `"$clientDir`" ; npm run dev"
$clientProc = Start-TerminalProcess -WorkingDir $clientDir -Command $clientCommand -Title 'Vite client'

Start-Sleep -Seconds 2

if ($OpenBrowser) {
    Write-Host "Opening http://localhost:5173/ in default browser..."
    Start-Process "http://localhost:5173/"
}

Write-Host "Done. Server PID: $($serverProc.Id) ; Client PID: $($clientProc.Id)"
