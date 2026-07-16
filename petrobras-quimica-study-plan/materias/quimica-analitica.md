# Química Analítica - Conteúdo Completo

**Peso na prova:** ~20% (8-10 questões)
**Horas totais no plano:** ~72h (4.5h/semana)

> ⚡ **Estratégia Cesgranrio:** **Titulometria** é o coração da Química Analítica para Cesgranrio — neutralização, complexação (EDTA), redox (permanganometria) e precipitação (Mohr). As questões sempre pedem **cálculo de concentração** (n = M·V) e escolha de indicador. Gravimetria (fator gravimétrico) e potenciometria (eletrodo de vidro, calomelano) são tópicos frequentes.

---

## 1. TÉCNICAS ANALÍTICAS DE LABORATÓRIO

### 1.1 Destilação

| Tipo | Aplicação | Princípio |
|------|-----------|-----------|
| **Simples** | Líquidos com PE muito diferentes (> 25°C) | Vaporização e condensação |
| **Fracionada** | Líquidos com PE próximos | Vaporizações sucessivas (coluna) |
| **A vapor** | Substâncias que se degradam | Arraste com vapor d'água |
| **A vácuo** | Substâncias com PE > 150°C | Reduz PE (↓ pressão) |

**Equipamentos:** balão de destilação, cabeça de destilação, condensador (Liebig), coletor

### 1.2 Extração

**Líquido-Líquido:** funil de separação (decantação)
- Baseada na partição do soluto entre dois solventes imiscíveis
- **Coeficiente de partição (K):** K = [soluto]ₒrg/[soluto]ₐq
- Quanto maior K, mais eficiente a extração

**Sólido-Líquido:** Soxhlet (extração contínua)
- Utilizada para extrair compostos de matrizes sólidas
- Ciclo contínuo: solvente evapora, condensa, extrai e retorna

### 1.3 Filtração

| Tipo | Sistema | Aplicação |
|------|---------|-----------|
| **Simples** | Funil + papel pregueado | Separação sólido-líquido comum |
| **A vácuo** | Funil de Büchner + Kitasato | Filtração rápida, secagem do sólido |
| **A quente** | Funil aquecido | Evita cristalização do soluto |

### 1.4 Decantação e Centrifugação

- **Decantação:** separação por diferença de densidade (gravidade)
- **Centrifugação:** acelera a sedimentação por força centrífuga

### 1.5 Gravimetria

**Princípio:** determinação da massa de um composto de composição conhecida

**Etapas:**
1. Precipitação do analito
2. Digestão (envelhecimento do precipitado)
3. Filtração
4. Lavagem (remove impurezas)
5. Secagem/Calcinação
6. Pesagem

**Fator gravimétrico (FG):**
FG = (MM(analito) × a) / (MM(precipitado) × b)
Onde a e b são coeficientes estequiométricos

**% Analito = (massa do precipitado × FG × 100) / massa da amostra**

**Requisitos do precipitado:**
- Baixa solubilidade
- Alta pureza
- Composição conhecida
- Estável termicamente

**Tipos de precipitado:**
- **Cristalino:** partículas grandes, fáceis de filtrar (BaSO₄)
- **Gelatinoso:** partículas pequenas, difíceis de filtrar (Fe(OH)₃)

**Contaminação:**
- **Coprecipitação:** impurezas adsorvidas na superfície
- **Pós-precipitação:** precipitação de outra substância após a principal

### 1.6 Secagem e Calcinação

- **Secagem:** remoção de água (estufa 105-110°C)
- **Calcinação:** aquecimento em alta temperatura (mufla) para decompor/estabilizar
- **Processos:** perda de água de hidratação, decomposição de carbonatos, oxidação

---

## 2. TITULOMETRIA (Análise Volumétrica)

### 2.1 Fundamentos

| Conceito | Definição |
|----------|-----------|
| **Titulação** | Adição controlada de uma solução (titulante) a outra (titulado) |
| **Ponto de equivalência** | Quantidades estequiometricamente equivalentes |
| **Ponto final** | Quando o indicador muda de cor |
| **Erro de titulação** | Diferença entre ponto final e ponto de equivalência |
| **Padrão primário** | Substância pura, estável, de composição conhecida (Na₂CO₃, KHC₈H₄O₄) |
| **Padrão secundário** | Solução padronizada contra um padrão primário (NaOH, HCl) |
| **Fator de correção (f)** | f = C(real)/C(teórica) — ajusta a concentração real |

### 2.2 Volumetria de Neutralização (Ácido-Base)

**Reação:** H⁺ + OH⁻ → H₂O

**Indicadores ácido-base:**
| Indicador | Faixa de pH (viragem) | Cor ácida | Cor básica |
|-----------|----------------------|-----------|------------|
| Fenolftaleína | 8,2 - 10,0 | Incolor | Rosa |
| Azul de bromotimol | 6,0 - 7,6 | Amarelo | Azul |
| Alaranjado de metila | 3,1 - 4,4 | Vermelho | Amarelo |
| Vermelho de metila | 4,2 - 6,3 | Vermelho | Amarelo |

**Escolha do indicador:**
| Tipo de titulação | pH no ponto de equivalência | Indicador adequado |
|-------------------|----------------------------|-------------------|
| Ácido forte + Base forte | 7,0 | Fenolftaleína ou alaranjado |
| Ácido forte + Base fraca | < 7,0 | Alaranjado de metila |
| Ácido fraco + Base forte | > 7,0 | Fenolftaleína |

**Cálculo:** n(ácido) = n(base) → Mácido·Vácido = Mbase·Vbase (para monoácido/monobase)

### 2.3 Volumetria de Precipitação

**Reação:** Ag⁺ + Cl⁻ → AgCl(s)

**Método de Mohr:** determinação de Cl⁻ com AgNO₃, indicador cromato de potássio (K₂CrO₄)
- Ponto final: formação de Ag₂CrO₄ vermelho

**Método de Volhard:** determinação de Ag⁺ com SCN⁻, indicador Fe³⁺
- Ponto final: FeSCN²⁺ vermelho

### 2.4 Volumetria de Complexação

**Reação:** Mⁿ⁺ + Y⁴⁻ → MYⁿ⁻⁴

**EDTA (ácido etilenodiaminotetracético):** agente quelante mais comum
- Forma complexos 1:1 com a maioria dos metais
- Estabilidade depende do pH

**Indicadores metalocrômicos:**
- **Negro de eriocromo T:** usado para Ca²⁺, Mg²⁺
- **Murexida:** usado para Ca²⁺, Ni²⁺, Cu²⁺
- Ponto final: mudança de cor do complexo metal-indicador

**Fatores que afetam a titulação com EDTA:**
- pH (controlado por tampão)
- Constante de formação do complexo (Kf)
- Agentes mascarantes (escondem interferentes)

### 2.5 Volumetria de Oxirredução (Redox)

**Reação:** Ox₁ + Red₂ → Red₁ + Ox₂

| Método | Titulante | Aplicação |
|--------|-----------|-----------|
| **Permanganometria** | KMnO₄ (meio ácido: Mn²⁺) | Fe²⁺, H₂O₂, C₂O₄²⁻ |
| **Dicromatometria** | K₂Cr₂O₇ | Fe²⁺ (sem indicador, cor laranja → verde) |
| **Iodometria** | I₂ (amido como indicador) | Cu²⁺, oxidantes |
| **Iodimetria** | Na₂S₂O₃ (tiossulfato) | I₂ gerado (indireto) |

**Indicadores redox:**
| Indicador | E° (V) | Cor oxidada | Cor reduzida |
|-----------|--------|-------------|--------------|
| Ferroína | 1,06 | Azul pálido | Vermelho |
| Difenilamina | 0,76 | Violeta | Incolor |
| Amido | — | Azul (com I₂) | Incolor |

### 2.6 Curvas de Titulação

- **Pré-equivalência:** excesso do titulado
- **Equivalência:** [H⁺] = [OH⁻] (neutralização), ou potencial equivalente
- **Pós-equivalência:** excesso do titulante

**Fatores que afetam a curva:**
- Concentração dos reagentes
- Força do ácido/base
- Constante de formação (complexação)
- Potencial padrão (redox)

---

## 3. POTENCIOMETRIA E CONDUTOMETRIA

### 3.1 Potenciometria Direta

**Princípio:** medida do potencial de um eletrodo indicador contra um eletrodo de referência

**Eletrodos de referência:**
| Eletrodo | Potencial | Aplicação |
|----------|-----------|-----------|
| **Calomelano saturado (ECS)** | +0,241 V vs EPH | Mais comum |
| **Ag/AgCl** | +0,197 V vs EPH | Alternativa, sem mercúrio |
| **Hidrogênio padrão (EPH)** | 0,000 V | Padrão primário (imprático) |

**Eletrodo de membrana de vidro (pHmetro):**
- E = constante + (0,059)·pH (a 25°C)
- Membrana sensível a H⁺
- Usado para medir pH diretamente
- Eletrodo combinado: indicador + referência em um só corpo

**Cuidados:** calibração com soluções-tampão (pH 4, 7 e 10), armazenamento em KCl

### 3.2 Titulação Potenciométrica

**Princípio:** monitora o potencial em função do volume do titulante

**Vantagens:**
- Não precisa de indicador visual
- Útil para soluções coloridas ou turvas
- Ponto final determinado pelo ponto de inflexão da curva

**Tipos:**
- **Ácido-base:** eletrodo de vidro
- **Precipitação:** eletrodo de Ag ou íon-seletivo
- **Complexação:** eletrodo íon-seletivo
- **Redox:** eletrodo inerte (Pt)

### 3.3 Condutometria

**Princípio:** medida da condutividade elétrica da solução

**Condutividade (κ):** capacidade da solução de conduzir corrente elétrica
**Condutância (G):** G = 1/R = κ · (A/L)

**Aplicações:**
- Titulação condutométrica (ponto final por mudança na condutividade)
- Determinação de pureza da água
- Monitoramento de águas naturais e efluentes

**Fatores que afetam a condutividade:**
- Concentração de íons (↑ conc = ↑ condutividade)
- Mobilidade iônica (H⁺ e OH⁻ têm maior mobilidade)
- Temperatura (↑ T = ↑ condutividade)

---

## Exercícios

**Q1.** Em uma titulação, 25 mL de NaOH 0,1 mol/L foram neutralizados por 20 mL de HCl. Qual a concentração do HCl?
A) 0,08 mol/L
B) 0,10 mol/L
C) **0,125 mol/L** ✅
D) 0,15 mol/L
E) 0,20 mol/L

> n(ácido) = n(base). Mác·20 = 0,1·25 → Mác = 2,5/20 = 0,125 mol/L

**Q2.** Qual método é mais adequado para determinar cloreto em água?
A) **Mohr (precipitação)** ✅
B) Neutralização
C) Complexação com EDTA
D) Permanganometria
E) Gravimetria

> Cl⁻ + Ag⁺ → AgCl. Método de Mohr: titulação direta com AgNO₃, indicador K₂CrO₄.

**Q3.** Na gravimetria, qual etapa é realizada para envelhecer o precipitado?
A) **Digestão** ✅
B) Filtração
C) Lavagem
D) Calcinação
E) Pesagem

> Digestão: manter o precipitado em contato com a solução-mãe aquecida para melhorar cristalinidade e pureza.

**Q4.** Qual eletrodo é utilizado como referência em potenciometria?
A) Eletrodo de vidro
B) Eletrodo de platina
C) **Eletrodo de calomelano saturado** ✅
D) Eletrodo seletivo para íons
E) Eletrodo de cobre

> ECS (calomelano) é o eletrodo de referência mais comum. Eletrodo de vidro é indicador (pHmetro).

**Q5.** (Cesgranrio) Na titulação de 25 mL de ácido acético (CH₃COOH) 0,1 mol/L com NaOH 0,1 mol/L, qual indicador é mais adequado? (Ka do CH₃COOH = 1,8×10⁻⁵)
A) Alaranjado de metila (viragem pH 3,1-4,4)
B) **Fenolftaleína (viragem pH 8,2-10,0)** ✅
C) Azul de bromotimol (viragem pH 6,0-7,6)
D) Vermelho de metila (viragem pH 4,2-6,3)
E) Nenhum, pois não há ponto de equivalência

> Ácido fraco + Base forte → ponto de equivalência em pH > 7 (≈ 8,7). Fenolftaleína (8,2-10,0) é a escolha correta. O sal formado (CH₃COONa) sofre hidrólise básica.

**Q6.** Qual o fator gravimétrico para determinar Fe a partir de Fe₂O₃?
A) FG = 55,85/159,7
B) FG = 2×55,85/159,7 ✅
C) FG = 159,7/55,85
D) FG = 159,7/(2×55,85)
E) FG = 1,0

> FG = (n×MM do analito) / (MM do precipitado). Fe₂O₃ contém 2 Fe. FG = (2 × 55,85) / 159,7 = 111,7/159,7 = 0,6994. Se 0,500g de Fe₂O₃, massa de Fe = 0,500 × 0,6994 = 0,3497g.
