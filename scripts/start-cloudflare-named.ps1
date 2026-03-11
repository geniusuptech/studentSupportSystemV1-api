param(
  [string]$Token = $env:CLOUDFLARE_TUNNEL_TOKEN,
  [string]$CloudflaredPath = ".\tools\cloudflared.exe"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $CloudflaredPath)) {
  throw "cloudflared not found at $CloudflaredPath. Download it first."
}

if ([string]::IsNullOrWhiteSpace($Token)) {
  throw "CLOUDFLARE_TUNNEL_TOKEN is missing. Set it in env or pass -Token."
}

Write-Host "Starting named Cloudflare tunnel with provided token."
Write-Host "Press Ctrl+C to stop the tunnel."

& $CloudflaredPath tunnel run --token $Token --no-autoupdate
