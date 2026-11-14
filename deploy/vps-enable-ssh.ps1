# Включение SSH на VPS (запускать в PowerShell от имени администратора, через RDP)
# Нужно один раз, чтобы разработчик мог зайти и развернуть сайт.

$ErrorActionPreference = 'Stop'

Write-Host '1/3 Устанавливаю OpenSSH Server...'
$capability = Get-WindowsCapability -Online -Name 'OpenSSH.Server*' | Select-Object -First 1
if ($capability.State -ne 'Installed') {
    Add-WindowsCapability -Online -Name $capability.Name | Out-Null
}

Write-Host '2/3 Запускаю службу и ставлю автозапуск...'
Set-Service -Name sshd -StartupType Automatic
Start-Service sshd

Write-Host '3/3 Открываю порт 22 в брандмауэре...'
$rule = Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -ErrorAction SilentlyContinue
if (-not $rule) {
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' `
        -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 | Out-Null
}

Write-Host ''
Write-Host 'Готово. Проверка:'
Get-Service sshd | Format-Table Name, Status, StartType -AutoSize
Write-Host 'Теперь можно подключаться: ssh Administrator@212.193.15.46'
