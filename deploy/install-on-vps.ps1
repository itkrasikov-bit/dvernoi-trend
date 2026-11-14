# Install the "Dvernoi Trend" site on a Windows VPS.
# Run in PowerShell as Administrator after the project files are copied to C:\dverni.
# ASCII only: Windows PowerShell 5.1 misreads UTF-8 without BOM.

$ErrorActionPreference = 'Stop'
$AppDir = 'C:\dverni'
$Port = 80

Write-Host '1/6 Checking Node.js...'
$nodeOk = $false
try {
    $version = (& node --version) 2>$null
    if ($version -match 'v(\d+)' -and [int]$Matches[1] -ge 20) { $nodeOk = $true }
} catch { }

if (-not $nodeOk) {
    Write-Host '    Installing Node.js 22 LTS...'
    $msi = Join-Path $env:TEMP 'node-v22.msi'
    Invoke-WebRequest 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi' -OutFile $msi
    Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + $env:Path
    Write-Host ('    Node: ' + (& node --version))
}

Write-Host '2/6 Checking project files...'
if (-not (Test-Path (Join-Path $AppDir 'package.json'))) {
    throw "No project files in $AppDir"
}

Write-Host '3/6 Installing dependencies...'
Push-Location $AppDir
& npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }

Write-Host '4/6 Building...'
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }

Write-Host '5/6 Preparing env file...'
$envFile = Join-Path $AppDir '.env.local'
if (-not (Test-Path $envFile)) {
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
    "ADMIN_PASSWORD=admin123" | Out-File -FilePath $envFile -Encoding ascii
    "AUTH_SECRET=$secret" | Out-File -FilePath $envFile -Encoding ascii -Append
    "SITE_URL=http://212.193.15.46" | Out-File -FilePath $envFile -Encoding ascii -Append
    Write-Host '    .env.local created. CHANGE the admin password!' -ForegroundColor Yellow
}

Write-Host '6/6 Configuring autostart and firewall...'
$nodeExe = (Get-Command node).Source
$nextBin = Join-Path $AppDir 'node_modules\next\dist\bin\next'

$action = New-ScheduledTaskAction -Execute $nodeExe -Argument "`"$nextBin`" start -p $Port" -WorkingDirectory $AppDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

Unregister-ScheduledTask -TaskName 'DvernoiTrend' -Confirm:$false -ErrorAction SilentlyContinue
Register-ScheduledTask -TaskName 'DvernoiTrend' -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Out-Null
Start-ScheduledTask -TaskName 'DvernoiTrend'

if (-not (Get-NetFirewallRule -Name 'DvernoiTrend-HTTP' -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name 'DvernoiTrend-HTTP' -DisplayName 'Dvernoi Trend site (HTTP)' `
        -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort $Port | Out-Null
}

Pop-Location

Start-Sleep -Seconds 8
Write-Host ''
try {
    $response = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 20
    Write-Host ('OK: site responds ' + $response.StatusCode + ' on port ' + $Port) -ForegroundColor Green
} catch {
    Write-Host 'Site did not respond. Check: Get-ScheduledTaskInfo -TaskName DvernoiTrend' -ForegroundColor Red
}
