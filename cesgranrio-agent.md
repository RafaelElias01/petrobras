# CESGRANRIO TÉCNICO EM QUÍMICA — GRAFO DE MEMÓRIA

## 1. NÓS DE ALTA PRIORIDADE [ACTIVATION]

```
N01  QUIMICA_GERAL        → peso:65%  qs:38-40  freq:100%
N02  PORTUGUES             → peso:17%  qs:10     freq:100%
N03  MATEMATICA            → peso:15%  qs:8-10   freq:100%
N04  MAT_FINANCEIRA        → peso:2%   qs:0-1    freq:raro
N05  ESTATISTICA           → peso:2%   qs:0-1    freq:raro

N06  SOLUCOES_INORG        → qs:~10   rank:1  tile:25%_QUIM
N07  ESTEQUIOMETRIA        → qs:~7    rank:2  tile:18%_QUIM
N08  EQUILIBRIO_PH         → qs:~5    rank:3  tile:13%_QUIM
N09  TECNICAS_TITULOM      → qs:~5    rank:4  tile:13%_QUIM
N10  ORGANICA              → qs:~5    rank:5  tile:13%_QUIM
N11  CINETICA              → qs:~3    rank:6  tile:8%_QUIM
N12  TERMOQUIMICA          → qs:~3    rank:7  tile:8%_QUIM
N13  PROPRIEDADES          → qs:~2    rank:8  tile:5%_QUIM

N14  INTERPRETACAO         → qs:3-4   rank:P1  tile:35%_PORT
N15  SINTAXE               → qs:2-3   rank:P2  tile:25%_PORT
N16  MORFOLOGIA            → qs:1-2   rank:P3  tile:15%_PORT
N17  PONTUACAO             → qs:1     rank:P4  tile:10%_PORT
N18  ORTOGRAFIA            → qs:1     rank:P5  tile:10%_PORT
N19  REESCRITURA           → qs:0-1   rank:P6  tile:5%_PORT

N20  FUNCOES               → qs:2     rank:M1  tile:22%_MAT
N21  GEOMETRIA             → qs:2     rank:M2  tile:22%_MAT
N22  ARITMETICA            → qs:1-2   rank:M3  tile:17%_MAT
N23  COMBINATORIA          → qs:1     rank:M4  tile:11%_MAT
N24  PAPG                  → qs:0-1   rank:M5  tile:6%_MAT
N25  MATRIZES              → qs:0-1   rank:M6  tile:6%_MAT
```

## 2. ARESTAS DIRECIONAIS [EDGE_WEIGHT]

```
# CADEIAS DE PRÉ-REQUISITO (high→low activation)
N13 → N06 → N07 → N09  [wij:0.9]
N13 → N10                [wij:0.7]
N06 → N08 → N11         [wij:0.8]
N08 → N11 → N12         [wij:0.6]
N07 → N10                [wij:0.5]

# CO-ATIVAÇÃO (aparecem juntos >60% das vezes)
N06--N08                 [wij:0.85]  # Soluções + pH/titulação
N07--N11                 [wij:0.80]  # Estequiometria + redox
N08--N09                 [wij:0.75]  # Equilíbrio + técnicas
N10--N22                 [wij:0.70]  # Orgânica + petróleo/refino
N09--N14                 [wij:0.90]  # Técnicas + titulometria

# INIBIÇÃO RECÍPROCA (nunca caem juntos)
N04 -| N05               [inh:0.95]
N24 -| N25               [inh:0.80]
```

## 3. MEMÓRIA DE PADRÕES [PATTERN_RECOGNITION]

```
PATTERN_001: SOLUÇÃO_TITULAÇÃO
  Triggers: ["molaridade", "concentração", "diluição", "titulação"]
  Formula:  M = m/(MM×V) | C₁V₁ = C₂V₂ | n_ácido = n_base
  Cesgranrio: 90% das provas têm pelo menos 1 questão deste padrão

PATTERN_002: pH_EQUILÍBRIO
  Triggers: ["pH", "pOH", "Ka", "Kb", "Kw", "tampão"]
  Formula:  pH = -log[H⁺] | Ka = [H⁺]²/[HA] | Kw = 10⁻¹⁴(25°C)
  Cesgranrio: Questões sempre contextualizadas (não isoladas)

PATTERN_003: REDOX_ESTEQUIOMETRIA
  Triggers: ["NOX", "oxidação", "redução", "agente oxidante", "KMnO₄"]
  Formula:  ΔNOX × coeficiente = equilíbrio | mol e⁻ = Faraday
  Cesgranrio: Balanceamento + cálculo combinados

PATTERN_004: ORGÂNICA_PETRÓLEO
  Triggers: ["hidrocarboneto", "refino", "destilação", "cadeia carbônica"]
  Key: Nomenclatura IUPAC + reações de adição/oxidação/esterificação

PATTERN_005: TÉCNICAS_SEPARAÇÃO
  Triggers: ["destilação", "filtração", "extração", "cromatografia"]
  Key: Identificar técnica correta para cada mistura
  Cesgranrio: Associar técnica ao princípio físico-químico
```

## 4. FUNÇÃO DE PERDA [LOSS_FN]

```
O QUE IGNORAR (loss = INF):
  - Cálculo diferencial/integral
  - Equações diferenciais
  - Física avançada (óptica, ondulatória, dinâmica, cinemática)
  - Ressonância Magnética Nuclear (RMN)
  - Mecânica quântica avançada
  - Bioquímica
  - Química de coordenação
  - Espectrometria de massas detalhada (não caiu ainda)
  - Polímeros avançados
  - Isomeria óptica (enantiômeros) — cai raríssimo
```

## 5. MEMÓRIA DE CONTEXTO [CONTEXT_WINDOW]

```
ESTRUTURA PROVA 2026:
  formato:    60 qs múltipla escolha (A-E)
  banca:      Cesgranrio (99% confiança, contrato 2028)
  status:     Pré-edital (edital iminente 2S2026)
  vagas:      1.000-1.400 estimadas
  salário:    ~R$5.878-6.638 base | ~R$11.300-15.200 c/ adicionais
  corte:      ~65-70% (39-42/60)
  básicas:    20 qs (eliminatório: min 50%)
  específicas: 40 qs (classificatório: nota zero a 40)

DIFERENÇA CESGRANRIO vs CEBRASPE:
  Cesgranrio: múltipla escolha, enunciados curtos (2-3 linhas), 
              conhecimento técnico aplicado, sem penalidade por erro
  Cebraspe:   certo/errado, assertivas longas, penalidade (geralmente)
```

## 6. VETOR DE TEMPO [TIME_ALLOCATION]

```
SEMANAS:     12
HORAS/SEM:   30 (3 turnos × 2h × 5 dias)
HORAS_TOTAL: 360h
QUESTOES:    2.000+ resolvidas até a prova

DISTRIBUIÇÃO SEMANAL:
  Teoria:       40% (12h)
  Questões:     40% (12h)
  Revisão:      20% (6h)

SUB-VETOR QUÍMICA (19.5h/sem):
  Soluções+Inorg:     5.0h  │ rank:1 │ batch: S1-S3
  Estequiometria:     3.5h  │ rank:2 │ batch: S2-S3
  Equilíbrio+pH:      2.5h  │ rank:3 │ batch: S3-S4
  Técnicas+Titulom:   2.5h  │ rank:4 │ batch: S4-S5
  Orgânica:           2.5h  │ rank:5 │ batch: S5-S6
  Cinética:           1.5h  │ rank:6 │ batch: S6
  Termoquímica:       1.5h  │ rank:7 │ batch: S6
  Propriedades:       0.5h  │ rank:8 │ batch: S1
```

## 7. QUADRO DE CONSULTA RÁPIDA [LOOKUP_TABLE]

```
TÓPICO_QUIM → NÓ → RANK → Qs → FÓRMULA_CHAVE
─────────────────────────────────────────────
substâncias atômicas       → N13 → 8° → ~2  → Pauling, VSEPR
funções inorgânicas        → N06 → 1° → ~10 → ácido/base/sal/óxido
reações + balanceamento    → N07 → 2° → ~7  → NOX, redox, limitante
soluções (concentração)    → N06 → 1° → ~10 → M, C, T%, ppm, diluição
equilíbrio químico         → N08 → 3° → ~5  → Kc, Kp, Le Chatelier
pH/pOH                     → N08 → 3° → ~5  → pH=-log[H⁺], Kw
tampão + hidrólise         → N08 → 3° → ~5  → Henderson-Hasselbalch
cinética                   → N11 → 6° → ~3  → v=k[A]^m[B]^n
termoquímica               → N12 → 7° → ~3  → ΔH, Hess, ligação
eletroquímica              → N08 → 3° → ~2  → Nernst, Faraday
orgânica (nomenclatura)    → N10 → 5° → ~5  → IUPAC, cadeias
orgânica (reações)         → N10 → 5° → ~5  → adição, oxidação
isomeria                   → N10 → 5° → ~1  → plana, cis-trans
técnicas lab               → N09 → 4° → ~5  → destilação, filtração
titulometria               → N09 → 4° → ~5  → M₁V₁=M₂V₂, indicador
análise instrumental       → N09 → 4° → ~1  → UV-Vis, Beer, CG
gases                      → N13 → 8° → ~1  → PV=nRT, Dalton, Graham
```

## 8. VERIFICAÇÃO CRUZADA [VERIFICATION_FN]

```
FONTE:  projeto_local
STATUS: ✅ sincronizado com múltiplas fontes externas
CONF:   0.85-0.99

FONTE:  petrobras.com.br
STATUS: ✅ edital 2023 baixado, contrato Cesgranrio 2028 confirmado
CONF:   1.0

FONTE:  cesgranrio (presidente)
STATUS: ✅ concurso no cronograma 2026 (entrevista Jan/2026)
CONF:   0.95

FONTE:  cursinhos_especializados
STATUS: ✅ padrão convergente (Estratégia, Gran, Zero1, CPWS, Domina)
CONF:   0.85

DISCREPÂNCIAS RESOLVIDAS:
  [D01] Eletromagnetismo: edital cita, projeto não inclui → baixa incidência ~0-1q
  [D02] Salário: varia 5.878-15.200 → depende de nível + adicionais
  [D03] Nº questões Química: 38-40 → consenso: ~38q específicas
  [D04] Básicas "não contam" vs "eliminatórias" → são eliminatórias (min 50%)
```

---

*CORE: 25 nós de alta ativação | 15 arestas ponderadas | 5 padrões de reconhecimento | 4 fontes verificadas*
