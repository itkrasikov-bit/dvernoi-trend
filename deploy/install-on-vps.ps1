# Установка сайта «Дверной тренд» на Windows VPS.
# Запускается на сервере в PowerShell от администратора ПОСЛЕ того, как в C:\dverni лежат файлы проекта.
# Пример: powershell -ExecutionPolicy Bypass -File C:\dverni\deploy\install-on-vps.ps1

$ErrorActionPreference = 'Stop'
$AppDir = 'C:\dverni'
$Port = 80
$NodeMsi = Join-Path $env:TEMP 'node-v22.msi'

Write-Host '1/6 Проверяю Node.js...' -ForegroundColor Cyan
$nodeOk = $false
try {
    $version = (& node --version) 2>$null
    if ($version -match 'v(\d+)' -and [int]$Matches[1] -ge 20) { $nodeOk = $true }
} catch { }

if (-not $nodeOk) {
    Write-Host '   Ставлю Node.js 22 LTS...'
    Invoke-WebRequest 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi' -OutFile $NodeMsi
    Start-Process msiexec.exe -ArgumentList "/i `"$NodeMsi`" /qn /norestart" -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
    Write-Host ('   Node: ' + (& node --version))
}

Write-Host '2/6 Проверяю файлы проекта...' -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $AppDir 'package.json'))) {
    throw "Нет файлов проекта в $AppDir — сначала скопируйте их туда."
}

Write-Host '3/6 Ставлю зависимости...' -ForegroundColor Cyan
Push-Location $AppDir
& npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install завершился с ошибкой' }

Write-Host '4/6 Собираю проект...' -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'Сборка завершилась с ошибкой' }

Write-Host '5/6 Готовлю файл окружения...' -ForegroundColor Cyan
$envFile = Join-Path $AppDir '.env.local'
if (-not (Test-Path $envFile)) {
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
    @"
ADMIN_PASSWORD=admin123
AUTH_SECRET=$secret
SITE_URL=http://212.193.15.46
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host '   Создан .env.local — ОБЯЗАТЕЛЬНО смените административный пароль.' -ForegroundColor Yellow
}

Write-Host '6/6 Настраиваю автозапуск и брандмауэр...' -ForegroundColor Cyan
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
    Write-Host ('Готово: сайт отвечает ' + $response.StatusCode + ' на порту ' + $Port) -ForegroundColor Green
    Write-Host 'Открывайте: http://212.193.15.46'
} catch {
    Write-Host 'Сайт не ответил. Проверьте задачу: Get-ScheduledTaskInfo -TaskName DvernoiTrend' -ForegroundColor Red
}
