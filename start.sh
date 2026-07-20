#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
VITE_PORT=5173

kill_port() {
  local pid
  pid=$(lsof -ti :"$VITE_PORT" 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Encerrando processo na porta $VITE_PORT (PID: $pid)..."
    kill "$pid" 2>/dev/null
    sleep 0.5
  fi
}

echo "== Iniciando Aplicação Vite (Petrobras Study Tracker) =="

kill_port

if [ ! -d "$ROOT/node_modules" ]; then
  echo "Instalando dependências..."
  cd "$ROOT" && npm install
fi

echo "Iniciando servidor de desenvolvimento Vite..."
echo "Pressione CTRL+C para parar o servidor."
cd "$ROOT" && npm run dev
