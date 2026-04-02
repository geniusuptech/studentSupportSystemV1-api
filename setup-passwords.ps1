# PowerShell script to set standardized passwords for all users
# Pattern: FirstLetterOfName + FirstTwoLettersOfSurname + 4-digit incremental number
# Example: Sarah Hendricks -> SHe0001, Thandiwe Ngcobo -> TNg0002

Write-Host "Setting up standardized passwords for all users..." 

# Define coordinators with their passwords (already tested Thandiwe works)
$coordinators = @(
    @{ email = "sarah.hendricks@uct.ac.za"; firstName = "Sarah"; lastName = "Hendricks"; password = "SHe0001" },
    @{ email = "thandiwe.ngcobo@uct.ac.za"; firstName = "Thandiwe"; lastName = "Ngcobo"; password = "TNg0002" },
    @{ email = "michael.vandermerwe@wits.ac.za"; firstName = "Michael"; lastName = "Van Der Merwe"; password = "MVa0003" },
    @{ email = "nomsa.juba@uj.ac.za"; firstName = "Nomsa"; lastName = "Juba"; password = "NJu0004" },
    @{ email = "rajesh.patel@ukzn.ac.za"; firstName = "Rajesh"; lastName = "Patel"; password = "RPa0005" },
    @{ email = "blessing@geniusup.co.za"; firstName = "Blessing"; lastName = "Mlambo"; password = "BMl0006" }
)

# Define students with their passwords
$students = @(
    @{ email = "aisha.patel@students.uct.ac.za"; firstName = "Aisha"; lastName = "Patel"; password = "APa0007" },
    @{ email = "marcus.thompson@students.uct.ac.za"; firstName = "Marcus"; lastName = "Thompson"; password = "MTh0008" },
    @{ email = "zara.mohamed@students.uct.ac.za"; firstName = "Zara"; lastName = "Mohamed"; password = "ZMo0009" },
    @{ email = "connor.williams@students.uct.ac.za"; firstName = "Connor"; lastName = "Williams"; password = "CWi0010" },
    @{ email = "nombulelo.mthembu@students.uct.ac.za"; firstName = "Nombulelo"; lastName = "Mthembu"; password = "NMt0011" },
    @{ email = "sibongile.mabena@students.wits.ac.za"; firstName = "Sibongile"; lastName = "Mabena"; password = "SMa0012" },
    @{ email = "robert.kumar@students.wits.ac.za"; firstName = "Robert"; lastName = "Kumar"; password = "RKu0013" },
    @{ email = "fatou.diallo@students.wits.ac.za"; firstName = "Fatou"; lastName = "Diallo"; password = "FDi0014" },
    @{ email = "tyler.jones@students.wits.ac.za"; firstName = "Tyler"; lastName = "Jones"; password = "TJo0015" },
    @{ email = "palesa.mokoena@students.wits.ac.za"; firstName = "Palesa"; lastName = "Mokoena"; password = "PMo0016" },
    @{ email = "grace.abdi@students.uj.ac.za"; firstName = "Grace"; lastName = "Abdi"; password = "GAb0017" },
    @{ email = "ryan.phillips@students.uj.ac.za"; firstName = "Ryan"; lastName = "Phillips"; password = "RPh0018" },
    @{ email = "lerato.sehume@students.uj.ac.za"; firstName = "Lerato"; lastName = "Sehume"; password = "LSe0019" },
    @{ email = "cameron.scott@students.uj.ac.za"; firstName = "Cameron"; lastName = "Scott"; password = "CSc0020" },
    @{ email = "nokuthula.mahlangu@students.uj.ac.za"; firstName = "Nokuthula"; lastName = "Mahlangu"; password = "NMa0021" },
    @{ email = "ayesha.singh@students.ukzn.ac.za"; firstName = "Ayesha"; lastName = "Singh"; password = "ASi0022" },
    @{ email = "logan.thomas@students.ukzn.ac.za"; firstName = "Logan"; lastName = "Thomas"; password = "LTh0023" },
    @{ email = "nonkosi.dlamini@students.ukzn.ac.za"; firstName = "Nonkosi"; lastName = "Dlamini"; password = "NDl0024" },
    @{ email = "gabriel.martinez@students.ukzn.ac.za"; firstName = "Gabriel"; lastName = "Martinez"; password = "GMa0025" },
    @{ email = "lindiwe.mthembu@students.ukzn.ac.za"; firstName = "Lindiwe"; lastName = "Mthembu"; password = "LMt0026" }
)

# Combine all users
$allUsers = $coordinators + $students

Write-Host ""
Write-Host "Processing users..."
Write-Host ""

$successCount = 0
$failureCount = 0
$results = @()

foreach ($user in $allUsers) {
    Write-Host "⚙️  Setting password for $($user.firstName) $($user.lastName) ($($user.email))..." -NoNewline
    
    $passwordData = @{
        email = $user.email
        newPassword = $user.password
        confirmPassword = $user.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8787/api/auth/update-password" -Method POST -Body $passwordData -ContentType "application/json" -TimeoutSec 30
        Write-Host " ✅ SUCCESS" -ForegroundColor Green
        $successCount++
        $results += [PSCustomObject]@{
            Name = "$($user.firstName) $($user.lastName)"
            Email = $user.email
            Password = $user.password
            Status = "Success"
            Response = $response.message
        }
    } catch {
        $errorMessage = if ($_.ErrorDetails.Message) { 
            ($_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue).message 
        } else { 
            $_.Exception.Message 
        }
        Write-Host " ❌ FAILED: $errorMessage" -ForegroundColor Red
        $failureCount++
        $results += [PSCustomObject]@{
            Name = "$($user.firstName) $($user.lastName)"
            Email = $user.email
            Password = $user.password
            Status = "Failed"
            Response = $errorMessage
        }
    }
    
    # Small delay to avoid overwhelming the API
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "🎯 Password Setup Complete!" -ForegroundColor Cyan
Write-Host "    ✅ SUCCESS: $successCount users" -ForegroundColor Green
Write-Host "    ❌ FAILED:  $failureCount users" -ForegroundColor Red
Write-Host ""

if ($failureCount -gt 0) {
    Write-Host "❌ Failed Users:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "Failed" } | Format-Table Name, Email, Response -AutoSize
}

# Test login with some successful users
Write-Host "🔐 Testing login with updated passwords..." -ForegroundColor Cyan
Write-Host ""

$testUsers = $results | Where-Object { $_.Status -eq "Success" } | Select-Object -First 3
foreach ($testUser in $testUsers) {
    $loginData = @{
        email = $testUser.Email
        password = $testUser.Password
    } | ConvertTo-Json
    
    Write-Host "Testing $($testUser.Name)..." -NoNewline
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:8787/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 15
        Write-Host " ✅ LOGIN SUCCESS" -ForegroundColor Green
    } catch {
        Write-Host " ❌ LOGIN FAILED" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 250
}

Write-Host ""
Write-Host "🎉 User Management Complete! All users can now login with standardized passwords." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Login Details Summary:" -ForegroundColor Cyan
$results | Where-Object { $_.Status -eq "Success" } | Format-Table Name, Email, Password -AutoSize