# Pacote Pré-Edital — Petrobras Academy

Material para a janela em que estamos agora (julho/2026): **o edital do
concurso Petrobras 2026 ainda não foi publicado.** Toda a lógica deste pacote
vem da skill `distribuicao-concurso` (`.claude/skills/distribuicao-concurso/SKILL.md`)
— releia lá antes de decidir prioridade ou canal, porque a pesquisa que
sustenta este material tem data e pode ficar desatualizada (o edital pode
sair a qualquer momento).

## Índice

1. [`email-captura.md`](./email-captura.md) — sequência de e-mail
   1.1 E-mail 1 — entrega do guia (já automático no `server.js`)
   1.2 E-mails 2 a 4 — nutrição espaçada (D+3, D+8, D+15) — envio manual por enquanto
   1.3 E-mail 5 — dia do edital (o mais importante; sensível ao tempo real)
2. [`posts-pre-edital.md`](./posts-pre-edital.md) — 12 posts prontos
   2.1 Ângulo do prazo (posts 1, 4, 10, 12)
   2.2 Ângulo da profundidade de conteúdo (posts 2, 3, 5, 6, 7, 8, 9)
   2.3 Ângulo de transparência de método (post 11)
3. [`landing-headlines.md`](./landing-headlines.md) — 8 headlines para `Login.vue`
   3.1 Recomendação e por quê
   3.2 O que trocar no dia em que o edital sair
4. Ordem de uso recomendada
5. O que fica de fora deste pacote (e por quê)

---

## 1. `email-captura.md`

A peça mais importante do pacote, porque é a única com gatilho real: no dia
em que o edital sair, a lista de e-mail vira a única audiência que já está
"quente" enquanto o resto do mercado começa do zero. Contém:

- O e-mail de entrega do guia (referência do que já roda automaticamente).
- Três e-mails de nutrição espaçada, para manter o lead engajado sem vender
  antes da hora.
- O e-mail do dia do edital — com instruções do que conferir (data real da
  prova, vagas confirmadas) antes de disparar, porque ele é o único que
  precisa de dado real do momento, não pode ser genérico.

**Aviso técnico dentro do arquivo:** só o e-mail 1 dispara sozinho hoje. Os
e-mails 2–5 exigem envio manual (Resend Broadcasts ou export de
`dados/newsletter.json`) até existir um agendador por dias-desde-cadastro no
`server.js` — isso é trabalho de código, fora do escopo deste agente de
marketing.

## 2. `posts-pre-edital.md`

12 posts para redes sociais, todos com legenda + hashtags + descrição de
imagem, prontos para copiar e colar. Todo número de distribuição da prova vem
de `dados.js` — confira o arquivo antes de publicar caso ele mude de novo (já
aconteceu uma vez: o Dashboard dizia "60 questões" quando o real era 79).

Os posts se sustentam sozinhos mesmo para quem nunca vai comprar — isso é
proposital. Conteúdo útil de graça constrói autoridade real e é a prioridade
1 da skill de distribuição (transformar o que já existe em ativo indexável/
compartilhável).

## 3. `landing-headlines.md`

8 variações de headline + subheadline para a página de login (`Login.vue`),
com recomendação de qual usar agora e qual testar em A/B. Nenhuma promete
resultado — todas seguem a regra do agente de nunca inventar prova.

## 4. Ordem de uso recomendada

1. **Trocar a headline da landing** (`landing-headlines.md`, Opção 1) —
   trabalho de 5 minutos, maior alavanca imediata de conversão de quem já
   chega no site.
2. **Publicar os 12 posts** (`posts-pre-edital.md`) ao longo de 3–4 semanas —
   não precisa ser 1 por dia; ritmo sustentável é melhor que sequência
   completa em 2 semanas e depois silêncio.
3. **Configurar o disparo manual dos e-mails de nutrição** (`email-captura.md`,
   e-mails 2–4) para quem já baixou o guia — ou pedir para alguém programar o
   agendador automático, se o volume de leads justificar.
4. **Deixar o e-mail do dia do edital pronto e revisado**, mas só disparar
   quando o edital sair de verdade. Configurar um alerta de notícia
   ("concurso Petrobras edital publicado") para não perder a janela — a
   skill de distribuição estima que a prova cai 60–80 dias depois, então
   cada dia de atraso no disparo é um dia a menos de reação da lista.

## 5. O que fica de fora deste pacote (e por quê)

- **Versão comprimida do cronograma (8–10 semanas)** — é a prioridade 3 da
  skill de distribuição, mas é trabalho de código/conteúdo do plano de
  estudos, não de copy de marketing. Precisa existir antes do e-mail do dia
  do edital linkar para ela (ver aviso dentro de `email-captura.md`).
- **Páginas indexáveis por tópico (SEO)** — prioridade 1 da skill, maior
  alavanca do projeto inteiro, mas também é trabalho de código (gerar página
  pública por grupo/tópico a partir de `dados.js`), fora do escopo deste
  agente.
- **Publicação de fato** — este agente não posta, não publica, não dispara
  e-mail. Todo material aqui é para o usuário copiar, colar e publicar (ou
  configurar o envio) manualmente.
