param(
  [string]$Hostname = $(if ($env:DEPLOY_HOST) { $env:DEPLOY_HOST } else { "163.176.163.213" }),
  [string]$User = $(if ($env:DEPLOY_USER) { $env:DEPLOY_USER } else { "ubuntu" }),
  [string]$Key = $(if ($env:DEPLOY_KEY) { $env:DEPLOY_KEY } else { "$env:USERPROFILE\.ssh\saur_oracle" }),
  [string]$RemotePath = "/opt/petrobras",
  [switch]$Build,
  [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"

# rsync nao vem nativo no Windows: precisa de WSL, Git Bash com rsync (ex: via
# pacman/MSYS2) ou cwRsync/Cygwin no PATH. scp (usado abaixo) ja vem com o
# OpenSSH Client do Windows/Git for Windows.
if (-not (Get-Command rsync -ErrorAction SilentlyContinue)) {
  throw "rsync nao encontrado no PATH. Instale via WSL, Git Bash (pacman -S rsync) ou cwRsync antes de rodar este script."
}

if ($Build) {
  Write-Host "npm run build..." -ForegroundColor Cyan
  Push-Location $PSScriptRoot
  npm run build 2>&1 | ForEach-Object { Write-Host $_ }
  Pop-Location
}

Write-Host "Sincronizando dist/ + server.js + planos..." -ForegroundColor Cyan
$SrcDist = Join-Path $PSScriptRoot "dist"

# Sincroniza a build do Vite
& rsync -avz --delete -e "ssh -i $Key" "$SrcDist/" "${User}@${Hostname}:${RemotePath}/dist/"
if ($LASTEXITCODE -ne 0) { throw "rsync dist/ falhou" }

# Sincroniza server.js e módulos backend importados por ele (ex: dataLocal.js).
# Se um novo módulo .js for adicionado na raiz e importado por server.js,
# precisa ser listado aqui também -- scp não segue imports automaticamente.
& scp -i "$Key" -q "$PSScriptRoot/server.js" "$PSScriptRoot/dataLocal.js" "${User}@${Hostname}:${RemotePath}/"
if ($LASTEXITCODE -ne 0) { throw "scp server.js/dataLocal.js falhou" }

# Sincroniza planos/ (mesmo caminho remoto usado pelo workflow deploy-vm.yml,
# para nao divergir do build servido pelo server.js)
& rsync -avz --delete -e "ssh -i $Key" "$PSScriptRoot/petrobras-quimica-study-plan/planos/" "${User}@${Hostname}:${RemotePath}/petrobras-quimica-study-plan/planos/"
if ($LASTEXITCODE -ne 0) { throw "rsync planos/ falhou" }

if (-not $SkipRestart) {
  Write-Host "Reiniciando servico..." -ForegroundColor Cyan
  ssh -i "$Key" "${User}@${Hostname}" "sudo systemctl restart petrobras.service"
  if ($LASTEXITCODE -ne 0) { throw "restart falhou" }

  Write-Host "Verificando saude do servico..." -ForegroundColor Cyan
  $ok = $false
  for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep 2
    ssh -i "$Key" "${User}@${Hostname}" "systemctl is-active --quiet petrobras.service && curl -sf http://localhost:3000/ -o /dev/null"
    if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  }
  if (-not $ok) {
    ssh -i "$Key" "${User}@${Hostname}" "sudo journalctl -u petrobras.service -n 40 --no-pager"
    throw "Servico nao respondeu apos o restart (logs acima)"
  }
  Write-Host "Deploy concluido! Servico ativo e respondendo." -ForegroundColor Green
} else {
  Write-Host "Arquivos sincronizados (servico nao reiniciado)" -ForegroundColor Yellow
}
