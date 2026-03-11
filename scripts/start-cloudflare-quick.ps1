param(
  [string]$CloudflaredPath = ".\tools\cloudflared.exe",
  [string]$ApiUrl = "http://localhost:3001"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $CloudflaredPath)) {
  throw "cloudflared not found at $CloudflaredPath. Download it first."
}

Write-Host "Starting Cloudflare quick tunnel for $ApiUrl"
Write-Host "Press Ctrl+C to stop the tunnel."

& $CloudflaredPath tunnel --url $ApiUrl --no-autoupdate
