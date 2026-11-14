# Enable OpenSSH Server on Windows VPS (run as Administrator).
# ASCII only on purpose: Windows PowerShell 5.1 misreads UTF-8 without BOM.

$ErrorActionPreference = 'Stop'

Write-Host '1/4 Checking OpenSSH Server capability...'
$capability = Get-WindowsCapability -Online -Name 'OpenSSH.Server*' | Select-Object -First 1

if ($capability -and $capability.State -ne 'Installed') {
    Write-Host '    Installing OpenSSH Server...'
    Add-WindowsCapability -Online -Name $capability.Name | Out-Null
}

$sshd = Get-Service -Name sshd -ErrorAction SilentlyContinue
if (-not $sshd) {
    Write-Host '    Capability install failed. Falling back to GitHub OpenSSH release...'
    $zip = Join-Path $env:TEMP 'OpenSSH-Win64.zip'
    $dir = 'C:\Program Files\OpenSSH-Win64'
    Invoke-WebRequest 'https://github.com/PowerShell/Win32-OpenSSH/releases/latest/download/OpenSSH-Win64.zip' -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath 'C:\Program Files' -Force
    if (Test-Path (Join-Path $dir 'install-sshd.ps1')) {
        & powershell -ExecutionPolicy Bypass -File (Join-Path $dir 'install-sshd.ps1')
    }
}

Write-Host '2/4 Setting service to automatic start...'
Set-Service -Name sshd -StartupType Automatic
Start-Service sshd

Write-Host '3/4 Opening TCP port 22 in firewall...'
$rule = Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -ErrorAction SilentlyContinue
if (-not $rule) {
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' `
        -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 | Out-Null
}

Write-Host '4/4 Done.'
Get-Service sshd | Format-Table Name, Status, StartType -AutoSize
Write-Host 'Now you can connect: ssh Administrator@212.193.15.46'
