<#
.SYNOPSIS
    Inicia o ambiente de desenvolvimento completo (Backend e Frontend).
.DESCRIPTION
    Este script orquestra o início dos dois servidores necessários para o desenvolvimento:
    1. O servidor de backend (Express.js) que serve a API.
    2. O servidor de desenvolvimento do frontend (Vite).
#>

# --- Função para liberar portas ---
function Stop-ProcessOnPort {
    param (
        [int]$Port
    )
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
        if ($null -ne $process) {
            Write-Host "Porta $Port está em uso pelo processo ID $process. Tentando liberar..." -ForegroundColor Yellow
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "Porta $Port liberada." -ForegroundColor Green
        }
    } catch {
        Write-Warning "Não foi possível verificar ou liberar a porta $Port. Pode ser necessário fechar o processo manualmente."
    }
}

Stop-ProcessOnPort -Port 3000 # Porta do Backend Express
Stop-ProcessOnPort -Port 5173 # Porta padrão do Frontend Vite

Write-Host "--- Iniciando Servidor de Backend (Express) ---" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node petrobras-quimica-study-plan/server.js"
Write-Host "Backend iniciado em segundo plano." -ForegroundColor Green

Write-Host ""
Write-Host "--- Iniciando Servidor de Frontend (Vite) ---" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "Instalando dependências do frontend (npm install)..." -ForegroundColor Yellow
    npm install
}

Write-Host "Frontend estará disponível em http://localhost:5173 (ou outra porta indicada pelo Vite)."
Write-Host "Pressione CTRL+C para parar o servidor."
npm run dev