param([switch]$NoFrontend)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Site = Join-Path $Root "petrobras-quimica-study-plan"

Write-Host "== Iniciando Petrobras Study Tracker ==" -ForegroundColor Cyan

# Mata processo na porta 3000 antes de tudo
$pids = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $pids) {
  Write-Host "Encerrando processo na porta 3000 (PID: $pid)..." -ForegroundColor Yellow
  Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

function Install-Deps($Dir, $Label) {
  if (-not (Test-Path (Join-Path $Dir "node_modules"))) {
    Write-Host "Instalando dependencias ($Label)..." -ForegroundColor Yellow
    Push-Location $Dir
    npm install
    Pop-Location
  }
}

Install-Deps $Site "Express"
if (-not $NoFrontend) { Install-Deps $Root "Vite" }

# Inicia Express
$serverJob = Start-Job -ScriptBlock {
  param($pasta)
  Set-Location $pasta
  node server.js
} -ArgumentList $Site

if ($NoFrontend) {
  Wait-Job $serverJob | Out-Null
} else {
  Write-Host "Servidor: http://localhost:3000" -ForegroundColor Green
  Start-Process "http://localhost:3000"
  Write-Host "Pressione qualquer tecla para parar tudo." -ForegroundColor Gray
  $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
  Stop-Job $serverJob
  Remove-Job $serverJob
}
