# Install the "Dvernoi Trend" site on a Windows VPS.
# Usage (PowerShell as Administrator):
#   powershell -ExecutionPolicy Bypass -File C:\dverni\deploy\install-on-vps.ps1
# ASCII only: Windows PowerShell 5.1 misreads UTF-8 without BOM.

$ErrorActionPreference = 'Stop'
$AppDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Port = 80
$env:NODE_OPTIONS = '--max-old-space-size=2048'

Write-Host "App dir: $AppDir"

Write-Host '1/7 Checking Node.js...'
$nodeOk = $false
try {
    $version = (& node --version) 2>$null
    if ($version -match 'v(\d+)' -and [int]$Matches[1] -ge 20) { $nodeOk = $true }
} catch { }

if (-not $nodeOk) {
    Write-Host '    Downloading Node.js 22 LTS...'
    $msi = Join-Path $env:TEMP 'node-v22.msi'
    Invoke-WebRequest 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi' -OutFile $msi
    Write-Host '    Installing (silent)...'
    Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait
    $machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
    $env:Path = $machinePath + ';C:\Program Files\nodejs;' + $env:Path
    Write-Host ('    Node: ' + (& node --version))
}

Write-Host '2/7 Checking project files...'
if (-not (Test-Path (Join-Path $AppDir 'package.json'))) {
    throw "package.json not found in $AppDir"
}

Set-Location $AppDir

Write-Host '3/7 Installing dependencies (3-6 minutes)...'
& npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }

Write-Host '4/7 Building (1-3 minutes)...'
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }

Write-Host '5/7 Preparing .env.local...'
$envFile = Join-Path $AppDir '.env.local'
$adminPass = $null
if (-not (Test-Path $envFile)) {
    $adminPass = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 12 | ForEach-Object { [char]$_ })
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
    "ADMIN_PASSWORD=$adminPass" | Out-File -FilePath $envFile -Encoding ascii
    "AUTH_SECRET=$secret" | Out-File -FilePath $envFile -Encoding ascii -Append
    "SITE_URL=http://212.193.15.46" | Out-File -FilePath $envFile -Encoding ascii -Append
    Write-Host "    Admin password: $adminPass" -ForegroundColor Yellow
} else {
    Write-Host '    .env.local already exists, keeping it'
}

Write-Host '6/7 Autostart + firewall...'
$nodeExe = (Get-Command node).Source
$nextBin = Join-Path $AppDir 'node_modules\next\dist\bin\next'

$action = New-ScheduledTaskAction -Execute $nodeExe -Argument "`"$nextBin`" start -p $Port" -WorkingDirectory $AppDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 0)
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

Unregister-ScheduledTask -TaskName 'DvernoiTrend' -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName 'DvernoiTrend' -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Out-Null

foreach ($p in @(80, 443, 22)) {
    $ruleName = "DvernoiTrend-TCP-$p"
    if (-not (Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -Name $ruleName -DisplayName "Dvernoi Trend TCP $p" -Enabled True `
            -Direction Inbound -Protocol TCP -Action Allow -LocalPort $p | Out-Null
    }
}

# Turn the firewall back on (it was disabled during diagnostics)
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True

Start-ScheduledTask -TaskName 'DvernoiTrend'

Write-Host '7/7 Checking...'
Start-Sleep -Seconds 10
try {
    $response = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 25
    Write-Host ('OK: site responds ' + $response.StatusCode) -ForegroundColor Green
} catch {
    Write-Host 'Site did not answer the first time, waiting 20 more seconds...' -ForegroundColor Yellow
    Start-Sleep -Seconds 20
    try {
        $response = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 25
        Write-Host ('OK: site responds ' + $response.StatusCode) -ForegroundColor Green
    } catch {
        Write-Host 'FAILED. Check: Get-ScheduledTaskInfo -TaskName DvernoiTrend' -ForegroundColor Red
    }
}

Write-Host ''
Write-Host 'Site URL:  http://212.193.15.46/'
Write-Host 'Admin URL: http://212.193.15.46/admin'
if ($adminPass) { Write-Host "Admin password: $adminPass" -ForegroundColor Yellow }
