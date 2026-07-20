#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
VITE_PORT=5173
SERVER_PORT=3000
SERVER_PID=""
VITE_PID=""

cleanup() {
  echo ""
  echo "== Desligando servidores =="
  if [ -n "$VITE_PID" ] && kill -0 "$VITE_PID" 2>/dev/null; then
    kill "$VITE_PID" 2>/dev/null
    echo "Vite encerrado."
  fi
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null
    echo "Server encerrado."
  fi
  exit 0
}
trap cleanup SIGINT SIGTERM

kill_port() {
  local port=$1
  local pids
  pids=$(timeout 3 lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Porta $port ocupada por PID(s): $pids — encerrando..."
    kill $pids 2>/dev/null || true
    sleep 1
    pids=$(timeout 3 lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "Porta $port ainda ocupada — forçando kill -9..."
      kill -9 $pids 2>/dev/null || true
      sleep 0.5
    fi
  fi
  pids=$(timeout 3 lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "ERRO: Não foi possível liberar a porta $port. PID(s) $pids resistem."
    exit 1
  fi
}

echo "== Iniciando Petrobras Study Tracker =="

if [ ! -d "$ROOT/node_modules" ]; then
  echo "Instalando dependências..."
  (cd "$ROOT" && npm install) || { echo "ERRO: npm install falhou."; exit 1; }
fi

kill_port $VITE_PORT
kill_port $SERVER_PORT

echo "Iniciando backend (Express) na porta $SERVER_PORT..."
(cd "$ROOT" && node server.js) &
SERVER_PID=$!

echo "Aguardando backend ficar online..."
for i in $(seq 1 15); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "ERRO: Backend morreu antes de ficar online."
    exit 1
  fi
  if curl -s -o /dev/null "http://localhost:$SERVER_PORT/api/planos" 2>/dev/null; then
    echo "Backend online (PID $SERVER_PID)"
    break
  fi
  sleep 1
done
if ! curl -s -o /dev/null "http://localhost:$SERVER_PORT/api/planos" 2>/dev/null; then
  echo "ERRO: Backend não respondeu após 15s."
  cleanup
  exit 1
fi

echo "Iniciando frontend (Vite) na porta $VITE_PORT..."
(cd "$ROOT" && npm run dev) &
VITE_PID=$!
sleep 2
if ! kill -0 "$VITE_PID" 2>/dev/null; then
  echo "ERRO: Vite morreu logo após iniciar."
  cleanup
  exit 1
fi
echo "Frontend rodando (PID $VITE_PID)"

echo ""
echo "== Pronto! =="
echo "Frontend: http://localhost:$VITE_PORT"
echo "Backend:  http://localhost:$SERVER_PORT"
echo "Pressione CTRL+C para parar ambos."

wait
