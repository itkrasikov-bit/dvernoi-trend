# Update the "Dvernoi Trend" site on the VPS: pull latest code, rebuild, restart.
# Usage: powershell -ExecutionPolicy Bypass -File C:\dverni\deploy\update.ps1
# ASCII only.

$ErrorActionPreference = 'Stop'
$AppDir = 'C:\dverni'
$Tmp = Join-Path $env:TEMP 'dverni-update'
$Zip = Join-Path $env:TEMP 'dverni-update.zip'

Write-Host '1/5 Downloading latest code...'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (Test-Path $Tmp) { Remove-Item $Tmp -Recurse -Force }
Invoke-WebRequest 'https://codeload.github.com/itkrasikov-bit/dvernoi-trend/zip/refs/heads/v2' -OutFile $Zip
Expand-Archive $Zip $Tmp -Force
$src = (Get-ChildItem $Tmp -Directory | Select-Object -First 1).FullName

Write-Host '2/5 Copying files (data and .env.local are kept)...'
& robocopy $src $AppDir /E /XD node_modules .next .git data /XF .env.local /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with code $LASTEXITCODE" }

Write-Host '3/5 Installing dependencies...'
Set-Location $AppDir
& npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }

Write-Host '4/5 Building...'
$env:NODE_OPTIONS = '--max-old-space-size=2048'
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }

Write-Host '5/5 Restarting site...'
Stop-ScheduledTask -TaskName 'DvernoiTrend' -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName 'DvernoiTrend'
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest 'http://127.0.0.1/' -UseBasicParsing -TimeoutSec 25
    Write-Host ('OK: site responds ' + $response.StatusCode) -ForegroundColor Green
} catch {
    Write-Host 'Site did not answer. Check: Get-ScheduledTaskInfo -TaskName DvernoiTrend' -ForegroundColor Red
}
