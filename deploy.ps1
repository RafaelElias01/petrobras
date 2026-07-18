param(
  [string]$Hostname = "163.176.163.213",
  [string]$User = "ubuntu",
  [string]$Key = "$env:USERPROFILE\.ssh\saur_oracle",
  [string]$RemotePath = "/opt/petrobras",
  [switch]$Build,
  [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"

$Src = Join-Path $PSScriptRoot "petrobras-quimica-study-plan"

if ($Build) {
  Write-Host "npm run build..." -ForegroundColor Cyan
  Push-Location $PSScriptRoot
  npm run build 2>&1 | ForEach-Object { Write-Host $_ }
  Pop-Location
}

Write-Host "Sincronizando arquivos..." -ForegroundColor Cyan
$files = @(
  "server.js"
  "site/index.html"
  "site/css/estilo.css"
  "site/js/app.js"
  "site/js/usuarios.js"
)

foreach ($f in $files) {
  $local = Join-Path $Src $f
  $remote = $RemotePath + "/" + $f
  Write-Host "  -> $f"
  & scp -i "$Key" -q "$local" "${User}@${Hostname}:${remote}"
  if ($LASTEXITCODE -ne 0) { throw "scp falhou em $f" }
}

if (-not $SkipRestart) {
  Write-Host "Reiniciando servico..." -ForegroundColor Cyan
  ssh -i "$Key" "${User}@${Hostname}" "sudo systemctl restart petrobras.service"
  if ($LASTEXITCODE -ne 0) { throw "restart falhou" }
  Start-Sleep 2
  Write-Host "Deploy concluido!" -ForegroundColor Green
} else {
  Write-Host "Arquivos sincronizados (servico nao reiniciado)" -ForegroundColor Yellow
}
