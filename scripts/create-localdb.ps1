param(
    [string]$Server = 'localhost\SQLEXPRESS',
    [string]$User = 'RST1Admin',
    [string]$Pass = '!QAZxsw23edc',
    [string]$Database = 'RSTdb1'
)

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root = Resolve-Path (Join-Path $PSScriptRoot '..') | Select-Object -ExpandProperty Path
$dbDir = Join-Path $root 'db'

if (-not (Test-Path $dbDir)) {
    New-Item -Path $dbDir -ItemType Directory | Out-Null
}

Write-Host "Using project root: $root"
Write-Host "Creating database '$Database' on server: $Server"

if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    Write-Host 'Error: `sqlcmd` not found. Install SQL Server Command Line Utilities and try again.'
    exit 3
}

# Create database if it doesn't exist (using provided credentials)
$createDbSql = "IF DB_ID(N'$Database') IS NULL CREATE DATABASE [$Database];"
Write-Host "Running: sqlcmd -S `"$Server`" -U `"$User`" -P *** -Q `"$createDbSql`""
sqlcmd -S "$Server" -U "$User" -P "$Pass" -Q $createDbSql -b

if ($LASTEXITCODE -ne 0) {
    Write-Host "sqlcmd failed to create database (exit $LASTEXITCODE)"
    exit $LASTEXITCODE
}

# Run init SQL against the newly created database
$initSql = Join-Path $dbDir 'init.sql'
if (Test-Path $initSql) {
    Write-Host "Running init SQL: $initSql"
    sqlcmd -S "$Server" -U "$User" -P "$Pass" -d "$Database" -i $initSql -b
    if ($LASTEXITCODE -ne 0) {
        Write-Host "sqlcmd (init) failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    } else {
        Write-Host "Init SQL executed successfully on $Database."
    }
} else {
    Write-Host "No init.sql found at $initSql - database created but not initialized."
}

Write-Host "Database '$Database' is ready on $Server"
exit 0

