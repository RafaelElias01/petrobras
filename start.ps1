$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$VitePort = 5173 # Porta padrão do Vite

# --- CONFIGURAÇÃO DO BACKEND (AJUSTE AQUI) ---
# Caminho para a pasta do seu projeto de backend/API
$BackendPath = "C:\caminho\para\sua\api"
# Comando para iniciar o backend (ex: "npm run dev", "npm start")
$BackendCommand = "npm run dev"

Write-Host "== Iniciando Aplicação Vite (Petrobras Study Tracker) ==" -ForegroundColor Cyan

# Mata processo na porta do Vite, se houver
$pids = Get-NetTCPConnection -LocalPort $VitePort -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $pids) {
  Write-Host "Encerrando processo na porta $VitePort (PID: $processId)..." -ForegroundColor Yellow
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 200

# Instala dependências se a pasta node_modules não existir
if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  Write-Host "Instalando dependências do projeto Vite..." -ForegroundColor Yellow
  Push-Location $Root
  npm install
  Pop-Location
}

# Inicia o servidor de backend em uma nova janela
Write-Host "Iniciando servidor de backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; $BackendCommand"

# Aguarda um pouco para o backend iniciar antes do frontend
Start-Sleep -Seconds 5

# Navega para o diretório raiz e inicia o servidor de desenvolvimento Vite
Write-Host "Iniciando servidor de desenvolvimento Vite..." -ForegroundColor Green
Write-Host "Pressione CTRL+C para parar o servidor." -ForegroundColor Gray
Set-Location $Root
npm run dev
