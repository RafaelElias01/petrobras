#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
VITE_PORT=5173
BACKEND_PORT=3000

kill_port() {
  local port=$1
  local pid
  pid=$(lsof -ti :"$port" 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Encerrando processo na porta $port (PID: $pid)..."
    kill "$pid" 2>/dev/null
    sleep 0.5
  fi
}

cleanup() {
  echo "\nParando servidores..."
  kill_port $BACKEND_PORT
  kill_port $VITE_PORT
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "== Iniciando Petrobras Study Tracker =="

if [ ! -d "$ROOT/node_modules" ]; then
  echo "Instalando dependências..."
  cd "$ROOT" && npm install
fi

kill_port $BACKEND_PORT
kill_port $VITE_PORT

echo "Iniciando servidor backend (porta $BACKEND_PORT)..."
cd "$ROOT" && node server.js &
sleep 1

echo "Iniciando servidor de desenvolvimento Vite (porta $VITE_PORT)..."
echo "Pressione CTRL+C para parar tudo."
cd "$ROOT" && npm run dev
