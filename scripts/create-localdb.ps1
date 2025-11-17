$PSBoundParameters = $null
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootPath = Resolve-Path (Join-Path $PSScriptRoot '..')
$root = $rootPath.Path

$dbDir = Join-Path $root 'db'
if (-not (Test-Path $dbDir)) {
    New-Item -Path $dbDir -ItemType Directory | Out-Null
}

Write-Host "Using project root: $root"

if (-not (Get-Command sqllocaldb -ErrorAction SilentlyContinue)) {
    Write-Host 'Error: `sqllocaldb` not found. Install SQL Server Express LocalDB and try again.'
    exit 2
}

Write-Host 'Starting LocalDB instance `MSSQLLocalDB` (if not already running)...'
sqllocaldb start MSSQLLocalDB | Out-Null

# Wait for the LocalDB instance to accept connections (retry sqlcmd SELECT 1)
$maxAttempts = 15
$attempt = 0
Write-Host "Waiting for LocalDB to accept connections (up to $maxAttempts seconds)..."
while ($attempt -lt $maxAttempts) {
    sqlcmd -S "(localdb)\\MSSQLLocalDB" -Q "SELECT 1" > $null 2>&1
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
    $attempt++
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Unable to connect to LocalDB after $maxAttempts seconds. Continuing but init SQL may fail."
}

if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    Write-Host 'Error: `sqlcmd` not found. Install SQL Server Command Line Utilities (sqlcmd) and try again.'
    exit 3
}

$mdf = Join-Path $dbDir 'RSTdb1.mdf'
$ldf = Join-Path $dbDir 'RSTdb1_log.ldf'

$createSql = "IF DB_ID(N'RSTdb1') IS NULL CREATE DATABASE [RSTdb1] ON (NAME=RSTdb1, FILENAME=N'$mdf') LOG ON (NAME=RSTdb1_log, FILENAME=N'$ldf')"

Write-Host "Creating database RSTdb1 at: $mdf"
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q $createSql -b

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success: Database created or already exists at $mdf"
    # If an init SQL file exists in the db folder, run it to create tables / seed data
    $initSql = Join-Path $dbDir 'init.sql'
    if (Test-Path $initSql) {
        Write-Host "Found init SQL at: $initSql -- running against (localdb)\\MSSQLLocalDB..."
        sqlcmd -S "(localdb)\\MSSQLLocalDB" -i $initSql -b
        if ($LASTEXITCODE -ne 0) {
            Write-Host "sqlcmd (init) failed with exit code $LASTEXITCODE"
            exit $LASTEXITCODE
        } else {
            Write-Host "Init SQL executed successfully."
        }
    }
    exit 0
} else {
    Write-Host "sqlcmd failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
