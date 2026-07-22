#!/bin/bash
# Roda ISSO DENTRO DA VM (depois de "ssh ubuntu@163.176.163.213").
# Atualiza o bot de WhatsApp em /opt/petrobras-whatsapp-bot a partir do
# GitHub (main), sem tocar em auth_info/ (sessão pareada do WhatsApp),
# e sobe o processo de um jeito que sobrevive ao fechamento do SSH.
set -euo pipefail

DIR=/opt/petrobras-whatsapp-bot
RAW=https://raw.githubusercontent.com/RafaelElias01/petrobras/main/whatsapp-bot

echo "== 1. Processo antigo =="
if pgrep -af "node bot.js"; then
  echo "Encontrado processo antigo acima -- encerrando com SIGTERM..."
  pkill -TERM -f "node bot.js" || true
  sleep 2
else
  echo "Nenhum processo antigo rodando."
fi

echo "== 2. Baixando arquivos atualizados =="
cd "$DIR"
curl -fsSL -o bot.js "$RAW/bot.js"
curl -fsSL -o regras.js "$RAW/regras.js"
curl -fsSL -o package.json "$RAW/package.json"
curl -fsSL -o package-lock.json "$RAW/package-lock.json"

echo "== 3. npm install =="
npm install

echo "== 4. Subindo o bot em background (sobrevive ao SSH fechar) =="
nohup node bot.js > bot.log 2>&1 &
disown
sleep 3

echo "== 5. Log inicial (esperado: 'conectado ao WhatsApp com sucesso', sem QR novo) =="
tail -n 20 bot.log

echo "== Feito. Processo atual: =="
pgrep -af "node bot.js"
