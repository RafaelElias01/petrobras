# Bot de WhatsApp — Estudo Petrobras

Bot simples de respostas automáticas por palavra-chave (sem IA), pra dúvidas frequentes sobre a plataforma. Roda como serviço **separado** do `server.js` principal, usando o número de WhatsApp Business do projeto conectado via QR code (biblioteca não-oficial `@whiskeysockets/baileys` — não é a API oficial da Meta).

## O que ele faz

- Responde perguntas sobre preço, pagamento, Premium, conteúdo, cadastro etc., usando as regras em `regras.js` (mesmo conteúdo do FAQ do site, ver `../FaqSection.vue`).
- **Não envia mensagem nenhuma sem alguém escrever primeiro** — só responde quem inicia contato. Isso é proposital: reduz o risco de bloqueio pelo WhatsApp (biblioteca não-oficial é mais visada quando usada pra disparo em massa).
- Ignora mensagens de grupo e mensagens da própria conta.

## Primeira vez: parear o número (fazer 1x, manualmente)

```bash
cd whatsapp-bot
npm install
node bot.js
```

Um QR code vai aparecer no terminal. Abra o WhatsApp Business no celular → **Aparelhos conectados** → **Conectar um aparelho** → escaneie o QR. A sessão fica salva em `auth_info/` (nunca commitar essa pasta — está no `.gitignore`; contém as credenciais da sessão).

Depois de parear uma vez, o bot reconecta sozinho nos próximos boots **enquanto a pasta `auth_info/` existir** — não peça QR de novo a cada restart do serviço.

## Rodando como serviço permanente (systemd, na VM)

Depois do pareamento manual (acima), configure um serviço systemd separado (ex: `petrobras-whatsapp-bot.service`) que rode `node bot.js` dentro de `whatsapp-bot/`, com `WorkingDirectory` apontando pra essa pasta — **nunca** apagar/recriar `auth_info/` num deploy (senão exige novo QR).

Isso é feito manualmente na VM (não faz parte do CI/CD do site principal) — o agente `saur-oracle-vm` conhece o padrão dos outros serviços systemd dessa VM e pode ajudar a criar o `.service` corretamente.

## Atualizando as respostas

Editar `regras.js`. Se uma resposta aqui contradisser o FAQ do site (`../FaqSection.vue`), atualizar os dois juntos — ver `LIVRO_DE_ERROS.md` (ERRO-006) sobre conteúdo duplicado ficando desalinhado.

## Se o número for desconectado (logout no celular)

O bot vai logar um erro e parar de tentar reconectar sozinho (evita loop). Apague a pasta `auth_info/` e rode `node bot.js` de novo pra gerar um QR novo.
