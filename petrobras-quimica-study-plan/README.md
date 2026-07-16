# Projeto de Estudos - Concurso Petrobras Técnico em Química (Química de Petróleo)

## Visão Geral

- **Cargo:** Profissional Petrobras de Nível Técnico Júnior - Ênfase: Química de Petróleo
- **Banca:** Cesgranrio (confirmada 2026, contrato vigente até julho/2028)
- **Base:** Padrão real das provas Cesgranrio 2011, 2018 e Transpetro 2023
- **Duração do plano:** 12 semanas (~3 meses)
- **Carga horária semanal:** 30h (segunda a sexta, 6h/dia)
- **Horários fixos:** 08h-10h | 13h-15h | 20h-22h

## Estrutura da Prova (Padrão Cesgranrio)

### 60 questões, múltipla escolha (5 alternativas)

| Matéria | Questões | % |
|---------|----------|---|
| **Química** | 38-40 | 63-67% |
| **Português** | 10 | 17% |
| **Matemática** | 8-10 | 13-17% |
| Mat. Financeira / Estatística | 0-1 | 0-2% |

### Dentro de Química (38-40 questões)

| Tópico | Qs típicas |
|--------|-----------|
| Soluções + Substâncias Inorgânicas | ~10 |
| Transformações Químicas + Estequiometria | ~7 |
| Equilíbrio Químico + pH | ~5 |
| Técnicas de Laboratório + Titulometria | ~5 |
| Química Orgânica | ~5 |
| Cinética Química | ~3 |
| Termoquímica | ~3 |
| Substâncias/Propriedades (átomos, tabela, ligações) | ~2 |

## Distribuição do Tempo de Estudo

| Matéria | % na prova | h/semana |
|---------|-----------|----------|
| Química (Geral + Orgânica + Analítica + Físico-Química) | 65% | **19.5** |
| Português | 17% | **5.0** |
| Matemática | 15% | **4.5** |
| Mat. Financeira + Estatística | 3% | **1.0** |

## Metodologia

Cada sessão de 2h segue o padrão:
- **40 min** Teoria / Videoaula
- **30 min** Exercícios
- **10 min** Correção
- **40 min** Questões de provas anteriores

Simulados nas semanas 4, 7 e 11. Provas anteriores resolvidas na semana 8.

## Site Interativo

Dashboard web com checklist, quadro de horas e simulados. Persistência via arquivos (com servidor Node.js) ou localStorage.

```bash
node server.js
# Acessar: http://localhost:3000
```

## Arquivos do Projeto

| Arquivo | Descrição |
|---------|-----------|
| **`cronograma-cesgranrio.md`** | **(principal)** Plano de 12 semanas focado Cesgranrio |
| `cronograma-12-semanas-provas.md` | Plano anterior (ambas bancas) |
| `conteudo-programatico.md` | Detalhamento de todos os tópicos |
| `checklist-conteudos.md` | Checklist para impressão |
| `quadro-horas.md` | Quadro de horas para impressão |
| `server.js` | Servidor Node.js (zero dependências) |
| `site/index.html` | Dashboard interativo |
| `site/css/estilo.css` | Estilos do site |
| `site/js/dados.js` | Dados dos conteúdos |
| `site/js/armazenamento.js` | Persistência (arquivos + localStorage) |
| `site/js/app.js` | App Vue 3 |
| `summary.md` | Resumo do projeto |
| `materias/portugues.md` | Plano detalhado de Português |
| `materias/matematica.md` | Plano detalhado de Matemática |
| `materias/quimica-geral.md` | Plano detalhado de Química Geral e Inorgânica |
| `materias/quimica-organica.md` | Plano detalhado de Química Orgânica |
| `materias/fisico-quimica.md` | Plano detalhado de Físico-Química |
| `materias/quimica-analitica.md` | Plano detalhado de Química Analítica |
| `materias/analise-instrumental.md` | Plano detalhado de Análise Instrumental |
| `materias/metrologia-estatistica.md` | Plano detalhado de Metrologia e Estatística |

> **Nota:** Os planos em `/materias/` incluem conteúdo de ambas as bancas. Para o foco Cesgranrio, priorize os tópicos listados em `cronograma-cesgranrio.md`.
