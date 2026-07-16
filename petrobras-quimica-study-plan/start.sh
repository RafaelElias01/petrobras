#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Iniciando Petrobras Study Tracker..."

# Fecha qualquer processo que esteja rodando na porta 3000
PID=$(lsof -ti:3000)
if [ -n "$PID" ]; then
  echo "🔒 Encerrando processo na porta 3000 (PID: $PID)..."
  kill -9 $PID
fi

# Inicia o servidor
node server.js
