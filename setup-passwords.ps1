# Student Support System - Password Setup Script
# This script helps set passwords for existing users in the database

Write-Host "=== Student Support System - Password Setup Utility ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8787/api/auth"

# Function to update a user's password
function Set-UserPassword {
    param(
        [string]$Email,
        [string]$Password
    )
    
    $body = @{
        email = $Email
        newPassword = $Password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/update-password" -Method POST -Body $body -ContentType "application/json"
        if ($response.success) {
            Write-Host "✅ Password set for: $Email" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed for $Email`: $($response.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error for $Email`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Get all users
Write-Host "Fetching all users..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET
    $users = $usersResponse.users | Where-Object { -not $_.hasPassword }
    
    Write-Host "Found $($users.Count) users needing password setup:" -ForegroundColor Yellow
    Write-Host ""
    
    # Display users needing passwords
    foreach ($user in $users) {
        Write-Host "ID: $($user.id) | $($user.firstName) $($user.lastName) | $($user.email) | $($user.role)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "=== SAMPLE USAGE ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# Set password for a specific user:"
    Write-Host 'Set-UserPassword -Email "aisha.patel@students.uct.ac.za" -Password "StudentPass123!"'
    Write-Host ""
    Write-Host "# Set passwords for common user types:"
    Write-Host 'foreach($student in ($users | Where-Object {$_.role -eq "student"})) {'
    Write-Host '    Set-UserPassword -Email $student.email -Password "StudentPass123!"'
    Write-Host '}'
    Write-Host ""
    Write-Host 'foreach($coordinator in ($users | Where-Object {$_.role -eq "coordinator"})) {'
    Write-Host '    Set-UserPassword -Email $coordinator.email -Password "CoordPass123!"'
    Write-Host '}'
    Write-Host ""
    Write-Host "=== SECURITY RECOMMENDATIONS ===" -ForegroundColor Yellow
    Write-Host "1. Use strong passwords (8+ chars, mixed case, numbers, symbols)"
    Write-Host "2. Consider different passwords per user role or individual passwords"
    Write-Host "3. Users should change these temporary passwords on first login"
    Write-Host "4. Never store passwords in plain text - this script only sets them"
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to fetch users: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== AUTHENTICATION TESTING ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Test login after setting password:"
Write-Host 'function Test-Login {'
Write-Host '    param([string]$Email, [string]$Password)'
Write-Host '    $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json'
Write-Host '    try {'
Write-Host '        $response = Invoke-RestMethod -Uri "http://localhost:8787/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"'
Write-Host '        Write-Host "✅ Login successful for: $Email" -ForegroundColor Green'
Write-Host '        return $response'
Write-Host '    } catch {'
Write-Host '        Write-Host "❌ Login failed for $Email" -ForegroundColor Red'
Write-Host '    }'
Write-Host '}'
Write-Host ""
Write-Host 'Test-Login -Email "aisha.patel@students.uct.ac.za" -Password "StudentPass123!"'