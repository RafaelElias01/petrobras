# Revisão escalonada de conteúdo — Estudo Petrobras

Tarefa para nova sessão: revisar todo o conteúdo pedagógico/textual da plataforma
(não é revisão de código/infra — isso já foi feito nesta sessão anterior).
Modelo recomendado: Sonnet 5 (ver decisão registrada — não precisa de Opus nem
agente novo pra isso).

## Escopo — onde está o conteúdo

- `dados.js` / pasta `dados/` — dados estruturados da plataforma (matérias, banco
  de questões, etc. — conferir o que exatamente está aqui, ainda não mapeado)
- `Plano.vue` + `usePlano.js` — lógica e textos do ciclo de estudos ponderado
- `materiais/guia-estudos-gratuito.md` — o "Guia Definitivo de Estudos" (lead
  magnet, ver [[fix_lead_magnet_email_nao_enviava]] — conteúdo já foi embutido
  em HTML no e-mail de envio, então qualquer edição de conteúdo aqui precisa
  também ser replicada em `server.js` função `corpoEmailGuiaGratuito()`)
- `petrobras-quimica-study-plan/planos/` — planos de estudo (arquivos servidos
  como download, ver rota relacionada em `server.js`)
- `FaqSection.vue` — FAQ do site (fonte da verdade que `whatsapp-bot/regras.js`
  deve espelhar — ver `LIVRO_DE_ERROS.md` ERRO-006 sobre conteúdo duplicado
  desalinhado)
- `Flashcards.vue` / `useFlashcards.js` / `useFlashcardReview.js` — textos e
  lógica de flashcards
- `Simulados.vue` / `useSimulados.js` — banco de questões dos simulados
- `Erros.vue` / `useErros.js` — caderno de erros
- `HowItWorks.vue` — textos de "como funciona"
- Depoimentos/prova social em `Login.vue` (nomes reais citados: Carlos,
  Ana, Mariana, Bruno, Rafael S. — conferir consistência de números/cidades
  entre Login.vue, regras.js do bot e os e-mails de boas-vindas em server.js)

## O que revisar em cada um

1. **Precisão factual** — dados sobre a prova Cesgranrio (pesos de matéria,
   salário, PLR, estrutura da prova) batem entre TODOS os lugares que os citam
   (site, bot do WhatsApp, e-mails, guia grátis)? Já sabemos que o conteúdo do
   guia grátis foi duplicado manualmente no e-mail (server.js) — checar se
   não divergiu.
2. **Consistência de depoimentos/prova social** — mesmos nomes, cidades,
   resultados aparecem em Login.vue, regras.js (bot) e nas variantes de e-mail
   de boas-vindas em server.js? Achar divergências tipo "Carlos de Macaé" vs
   "Carlos M. de Macaé/RJ" com números diferentes.
3. **Qualidade didática** — flashcards, simulados, banco de questões: conteúdo
   correto quimicamente/tecnicamente, sem erros de digitação, cobertura real
   do edital declarado (Química Geral/Orgânica/Físico-Química/Analítica,
   Processos de Petróleo, Segurança/Meio Ambiente, Metrologia).
4. **Tom e clareza** — textos de ajuda/FAQ/onboarding claros pra público leigo
   (não é técnico em TI), sem jargão desnecessário.
5. **Guia grátis (materiais/guia-estudos-gratuito.md)** — reler o cronograma
   sugerido, checklist, dicas da banca — fazem sentido pedagógico? Vale também
   decidir se deveria virar PDF de verdade em vez de markdown puro (nota já
   levantada, não implementada).

## Não fazer nesta tarefa (fora de escopo)

- Não mexer em código de infraestrutura, deploy, ou no bot de WhatsApp em si
  (regras.js já foi ajustado nesta sessão — só usar como referência de
  conteúdo/prova social a comparar, não re-editar o algoritmo de matching).
- Não mudar preço, modelo de negócio, ou regras de acesso demo sem confirmar
  com o usuário antes (ver [[project_petrobras_visao_geral]]).

## Como proceder

Escalonado = revisar por partes, começando pelo conteúdo mais crítico/visível
primeiro (Login.vue depoimentos + FAQ + guia grátis, que já foram tocados
nesta sessão), depois expandir pra flashcards/simulados/banco de questões.
Reportar achados de inconsistência antes de corrigir — são textos de marketing
e conteúdo pedagógico, não bugs de código, então confirmar com o usuário antes
de reescrever qualquer coisa.
