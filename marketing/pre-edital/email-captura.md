# Sequência de E-mails — Captura Pré-Edital

Para quem baixa o Guia Definitivo de Estudos agora, antes do edital sair.
Objetivo único da sequência: manter o lead quente até o dia em que o edital
publica — é aí que a lista converte, não antes.

## Status técnico (confira antes de usar)

- **E-mail 1 (entrega do guia)** já é automático: `server.js` dispara
  `enviarEmailGuiaGratuito()` via Resend assim que alguém envia o formulário
  de `POST /api/newsletter`. O texto abaixo é a referência para conferir/
  ajustar o template que já existe no código — não precisa ser reenviado à mão.
- **E-mails 2, 3 e 4 (nutrição espaçada)** e o **e-mail do dia do edital**
  **não têm envio automático ainda**. Não existe agendador por dia-desde-cadastro
  no `server.js` — só existe o agendador diário de propaganda do Premium
  (`rodarEnvioPropagandaDiaria`, para quem já tem conta, não para lead magnet).
  Até alguém programar esse agendador, estes três e-mails precisam ser
  disparados manualmente (Resend Broadcasts, ou export de `dados/newsletter.json`
  para uma ferramenta de disparo) ou meses depois via nova rotina no backend.
- O e-mail do dia do edital é o mais importante da sequência e o único
  sensível ao tempo real — ele só sai quando o edital sai de fato. Configure
  um alerta (Google Alerts para "concurso Petrobras edital", ou checagem manual
  diária) para não perder a janela.

Todo e-mail de marketing recorrente já tem rodapé de opt-out obrigatório no
código (`corpoPropagandaComOptOut`) — qualquer envio manual da nutrição deve
manter um link de descadastro, é exigência legal (CDC/LGPD/anti-spam), não op-
cional.

---

## E-mail 1 — Entrega imediata (automático, já existe)

**Dispara:** na hora, ao preencher o formulário do guia grátis.

**Assunto:** `{{primeiro_nome}}, aqui está seu Guia Definitivo de Estudos 🎁`

**Corpo:**

> Oi, {{primeiro_nome}}.
>
> Seu Guia Definitivo de Estudos para Técnico(a) de Química da Petrobras está
> em anexo/linkado abaixo.
>
> Nele você encontra:
> - A distribuição real da prova: 79 questões, Química sozinha é 48% (38
>   questões).
> - Como montar um ciclo de estudos que pondera pelo peso de cada matéria, não
>   pelo gosto.
> - Revisão espaçada e caderno de erros — o que fazer com o que você já
>   errou.
>
> **Uma coisa direta:** o edital do concurso 2026 ainda não saiu. Quando sair,
> a banca (Cesgranrio) costuma marcar a prova entre 60 e 80 dias depois — ou
> seja, o tempo de reação vai ser curto. Quem começa agora, no vácuo antes do
> edital, chega na prova com o conteúdo visto. Quem começa só depois, entra
> numa corrida de 2 meses.
>
> Vou te mandar mais material nas próximas semanas — sem spam, só o que
> realmente ajuda a estudar melhor. E no dia em que o edital sair, você é a
> primeira pessoa que eu aviso.
>
> Bons estudos,
> Petrobras Academy
>
> [rodapé de opt-out obrigatório]

---

## E-mail 2 — Nutrição (D+3): a distribuição real da prova

**Dispara:** 3 dias depois do e-mail 1. Envio manual até existir agendador.

**Assunto:** `A conta que a maioria dos concurseiros erra antes de abrir o edital`

**Corpo:**

> {{primeiro_nome}}, uma pergunta rápida: se você tivesse que estudar só 3
> matérias até o fim, quais escolheria?
>
> A resposta certa, pelo menos pela banca: Química, Química e Química.
>
> 79 questões na prova de Técnico de Química. 38 são de Química — quase
> metade. As outras 41 se dividem assim:
>
> - Português: 10 questões (13%)
> - Matemática: 10 questões (13%)
> - Processos de Petróleo: 8 questões (10%)
> - Segurança, Saúde e Ambiente: 7 questões (9%)
> - Metrologia e Controle de Qualidade: 6 questões (8%)
>
> Se seu plano de estudo dá o mesmo tempo pra Química e pra Metrologia, ele
> está estruturalmente errado antes mesmo de você abrir o primeiro livro.
>
> O guia que você baixou já tem essa distribuição. Se quiser ver como isso
> vira um cronograma dia a dia — 16 semanas, 3 blocos de 2h — dá uma olhada
> na plataforma. É gratuito começar a usar.
>
> [CTA: Conhecer a plataforma]
>
> [rodapé de opt-out obrigatório]

---

## E-mail 3 — Nutrição (D+8): o erro que cronograma de papel não resolve

**Dispara:** 8 dias depois do e-mail 1.

**Assunto:** `Por que seu cronograma desanda na semana 3`

**Corpo:**

> {{primeiro_nome}}, se você já tentou montar um cronograma de estudos numa
> planilha, sabe como termina: as duas primeiras semanas são perfeitas, e na
> terceira alguma coisa muda — plantão extra, imprevisto, cansaço — e o
> cronograma nunca mais volta ao normal.
>
> Não é falta de disciplina. É que cronograma fixo não se adapta.
>
> O que resolve isso não é força de vontade, é mecanismo: um ciclo de estudos
> que continua de onde parou, pondera as matérias pelo peso real na prova (24
> slots, cada matéria aparece proporcionalmente ao que vale) e te diz o que
> revisar hoje sem você precisar lembrar (revisão espaçada D+1 / D+7 / D+30).
>
> É basicamente o que a plataforma automatiza. Ela é gratuita para começar;
> o plano completo (cronograma de 16 semanas, simulados, caderno de erros
> classificado por causa) custa R$ 49,90, pagamento único.
>
> [CTA: Ver como funciona]
>
> [rodapé de opt-out obrigatório]

---

## E-mail 4 — Nutrição (D+15): o prazo que ninguém está calculando ainda

**Dispara:** 15 dias depois do e-mail 1.

**Assunto:** `O edital ainda não saiu. É exatamente por isso que vale a pena começar agora`

**Corpo:**

> {{primeiro_nome}}, a Cesgranrio é a banca do concurso Petrobras (contrato
> vigente até 2028) e o padrão dela é marcar a prova entre 60 e 80 dias
> depois da publicação do edital.
>
> Isso parece muito tempo até você fazer a conta: 480 horas de conteúdo
> programático (o cronograma completo da plataforma) em 70 dias exige mais de
> 6h de estudo por dia, todos os dias, sem parar. Pra quem trabalha, isso não
> cabe.
>
> Quem começa agora, no período pré-edital, não tem essa pressão. Estuda no
> ritmo possível — 2 a 4h por dia — e chega no dia da prova com o conteúdo já
> visto, não decorado às pressas.
>
> Não precisa decidir nada hoje. Só guarda essa conta. E assim que o edital
> sair, eu te aviso — com um cronograma já ajustado ao prazo real que restar.
>
> [CTA: Conhecer a plataforma]
>
> [rodapé de opt-out obrigatório]

---

## E-mail 5 — O dia do edital (o mais importante da sequência)

**Dispara:** no dia em que o edital for publicado — evento, não data fixa.
É o único e-mail da sequência com urgência real, porque o prazo agora é
real (60–80 dias até a prova, contando a partir de hoje).

**Assunto:** `SAIU: edital da Petrobras publicado — aqui está o prazo real até sua prova`

**Corpo:**

> {{primeiro_nome}}, o edital do concurso Petrobras 2026 acabou de ser
> publicado.
>
> [Preencher na hora, com dado real do edital saído:]
> - Data da prova objetiva: [DATA]
> - Dias até a prova: [N] dias
> - Vagas confirmadas para Técnico(a) de Química: [N]
>
> Isso muda a estratégia. Com [N] dias até a prova, não dá para seguir um
> cronograma de 16 semanas do zero — ele foi pensado para quem começa cedo.
> Quem está no seu lugar agora precisa de um plano comprimido, focado no que
> mais cai primeiro (Química ainda é 48% da prova, isso não muda).
>
> A plataforma tem a versão do cronograma ajustada pra esse prazo curto.
> [Link direto para o plano comprimido/checkout]
>
> Se você já vinha estudando com a gente nesses últimos meses, você está na
> frente de quem está começando agora — o conteúdo já visto conta.
>
> [CTA: Ver o plano para os próximos [N] dias]
>
> [rodapé de opt-out obrigatório]

**Antes de disparar este e-mail, confira:**
- Data oficial da prova (não estime — cite a data do edital).
- Se a versão comprimida do cronograma (8–10 semanas, prioridade 3 da skill
  `distribuicao-concurso`) já existe na plataforma. Se ainda não existir,
  troque o CTA para "cronograma de 16 semanas ajustável" em vez de prometer
  uma versão comprimida que não está pronta.
- Número de vagas: só cite o que o edital confirmar, não a estimativa de
  1.100–1.400 usada antes da publicação.
