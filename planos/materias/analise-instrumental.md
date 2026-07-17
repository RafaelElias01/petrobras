# Análise Instrumental - Conteúdo Completo

**Peso na prova:** ~7% (2-4 questões)
**Horas totais no plano:** ~40h (2.5h/semana)

> ⚡ **Estratégia Cesgranrio:** **Espectrometria IV** (identificação de grupos funcionais por bandas) é o tópico mais recorrente. Decore as faixas: O-H (3600-3200), C=O (1750-1680), C-H (2960-2850). **Lei de Beer-Lambert** (A = εbc) cai todo ano. Em cromatografia, saiba a diferença entre HPLC e CG, os detectores (FID, ECD, MS) e fase normal vs. reversa.

---

## 1. ESPECTROMETRIA NO INFRAVERMELHO (IV)

### 1.1 Fundamentos

**Princípio:** absorção de radiação IV causa vibrações moleculares (estiramento e deformação)

**Regiões do espectro IV:**
| Região | Faixa (cm⁻¹) | Tipo de vibração |
|--------|-------------|------------------|
| Próximo | 14.000 - 4.000 | Harmônicos e combinações |
| Médio | 4.000 - 400 | Vibrações fundamentais |
| Longínquo | 400 - 10 | Vibrações da rede cristalina |

### 1.2 Tipos de Vibração Molecular

**Estiramento (stretching):** variação na distância entre átomos
- **Simétrico:** átomos se movem na mesma direção
- **Assimétrico:** átomos se movem em direções opostas

**Deformação (bending):** variação no ângulo de ligação
- **Tesoura (scissors),** balanço (rocking), torção (twisting), vibração (wagging)

### 1.3 Identificação de Grupos Funcionais

| Grupo funcional | Faixa (cm⁻¹) | Intensidade | Observação |
|----------------|-------------|-------------|------------|
| O-H (álcool) | 3600-3200 | Forte, larga | Ponte H alarga |
| O-H (ácido) | 3300-2500 | Forte, muito larga | Sobreposição C-H |
| N-H (amina) | 3500-3300 | Média | Duas bandas (primária) |
| C-H (alcano) | 2960-2850 | Forte | sp³ |
| C-H (alceno) | 3100-3000 | Média | sp² |
| C-H (alcano) | 3300 | Média | sp |
| C=O (aldeído/cetona) | 1750-1680 | Forte | Muito característica |
| C=O (ácido) | 1725-1700 | Forte | |
| C=O (éster) | 1750-1735 | Forte | |
| C=O (amida) | 1680-1630 | Forte | |
| C=C (alceno) | 1680-1620 | Média | |
| C≡C (alcino) | 2260-2100 | Fraca a média | |
| C-O (álcool, éter) | 1300-1000 | Forte | |
| C-N (amina) | 1350-1000 | Média | |
| NO₂ | 1550-1350 | Forte | Duas bandas |
| C-Cl | 800-600 | Forte | |
| C-F | 1400-1000 | Forte | |

> 🧠 **Mnemônico IR — "C=O é Forte e Gordo":** A carbonila (C=O) aparece como banda forte em 1750-1680. "O-H largo de 3000" — álcool tem banda larga em 3600-3200, ácido ainda mais larga 3300-2500. "C-H em 2900 sempre" — todo composto orgânico tem C-H.

### 1.4 Região da "impressão digital" (fingerprint)

- Abaixo de 1500 cm⁻¹
- Complexa e única para cada molécula
- Usada para identificação por comparação com espectros de referência

### 1.5 Instrumentação

**Componentes:**
1. Fonte (filamento Nernst, globar)
2. Monocromador (rede de difração, prismas) ou interferômetro (FTIR)
3. Cela para amostra (KBr, NaCl - transparentes ao IV)
4. Detector (termopar, piroelétrico)

**FTIR (Fourier Transform IR):**
- Interferômetro de Michelson substitui monocromador
- Vantagens: maior velocidade, melhor relação S/N, maior precisão
- Transformada de Fourier converte interferograma em espectro

---

## 2. ESPECTROMETRIA UV-VIS

### 2.1 Fundamentos

**Princípio:** absorção de radiação UV-Vis (200-800 nm) causa transições eletrônicas

**Transições eletrônicas (energia crescente):**
| Transição | Faixa (nm) | Exemplo |
|-----------|-----------|---------|
| n → π* | 200-400 | C=O, C=N |
| π → π* | 180-300 | C=C, C≡C, aromáticos |
| n → σ* | 150-250 | O-H, N-H, S |
| σ → σ* | < 150 | C-C, C-H |

**Cromóforo:** grupo responsável pela absorção (C=C, C=O, NO₂, etc.)
**Auxócromo:** grupo que desloca ou intensifica a absorção (-OH, -NH₂)
**Efeito batocrômico (red shift):** deslocamento para maior λ (menor energia)
**Efeito hipsocrômico (blue shift):** deslocamento para menor λ (maior energia)

### 2.2 Lei de Beer-Lambert

**A = ε · b · c**

Onde:
- A = absorbância (adimensional)
- ε = absortividade molar (L·mol⁻¹·cm⁻¹)
- b = caminho óptico (cm)
- c = concentração (mol/L)

**Relação com transmitância:** A = -log T = -log (I/I₀)

**Limitações:**
- Desvios químicos (equilíbrio, associação)
- Desvios instrumentais (luz espúria, λ não monocromático)
- Concentrações muito altas ou muito baixas

### 2.3 Instrumentação

**Componentes:**
1. Fonte (lâmpada de deutério para UV, tungstênio para Vis)
2. Monocromador (rede de difração)
3. Cela (quartzo para UV, vidro para Vis)
4. Detector (fotomultiplicadora, fotodiodo)

**Tipos de instrumentos:**
- **Feixe simples:** medida alternada (referência + amostra)
- **Duplo feixe:** feixe dividido (referência + amostra simultâneo)
- **Arranjo de diodos:** espectro completo instantâneo

### 2.4 Espectrofotometria de Absorção Molecular

**Aplicações:**
- Quantificação de compostos orgânicos e inorgânicos
- Determinação de constantes de equilíbrio
- Cinética química
- Análise de misturas (λ diferentes)

### 2.5 Espectrometria de Emissão Atômica

**Princípio:** átomos excitados emitem radiação em λ característicos

**Técnicas:**
| Técnica | Fonte de atomização | Aplicação |
|---------|-------------------|-----------|
| **Fotometria de chama** | Chama (ar/acetileno) | Metais alcalinos e alcalino-terrosos |
| **ICP-OES** | Plasma de argônio | Multielementar, baixos limites de detecção |
| **AAS (absorção atômica)** | Chama ou forno de grafite | Metais traço |

---

## 3. CROMATOGRAFIA

### 3.1 Fundamentos

**Princípio:** separação de misturas por diferença de afinidade entre **fase estacionária** (FE) e **fase móvel** (FM)

**Parâmetros cromatográficos:**
| Parâmetro | Fórmula | Significado |
|-----------|---------|-------------|
| **Fator de retenção (k')** | k' = (tR - t0)/t0 | Razão de distribuição |
| **Fator de seletividade (α)** | α = k'₂/k'₁ | Separação entre dois picos |
| **Resolução (Rs)** | Rs = 2(tR₂-tR₁)/(w₁+w₂) | Separação total (Rs > 1,5) |
| **Nº de pratos teóricos (N)** | N = 16(tR/w)² | Eficiência da coluna |
| **Altura equivalente a prato teórico (HEPT)** | HEPT = L/N | Qualidade do empacotamento |

### 3.2 Cromatografia Líquida (HPLC)

**Componentes:**
1. Reservatório de fase móvel
2. Bomba (alta pressão, fluxo constante)
3. Injetor (loop ou automático)
4. Coluna cromatográfica (FE em partículas de 3-5 µm)
5. Detector
6. Sistema de dados

**Fases:**
| Tipo | Fase estacionária | Fase móvel | Separação |
|------|------------------|-------------|-----------|
| **Fase normal** | Polar (sílica) | Apolar (hexano) | Compostos polares eluem depois |
| **Fase reversa** | Apolar (C₁₈) | Polar (água/MeOH) | Compostos apolares eluem depois |

**Detectores:**
| Detector | Seletividade | Sensibilidade |
|----------|-------------|---------------|
| UV-Vis (DAD) | Compostos com absorção | ng |
| Fluorescência | Compostos fluorescentes | pg |
| Índice de refração | Universal | µg |
| Espectrometria de massas (LC-MS) | Estrutural | pg |

### 3.3 Cromatografia Gasosa (CG)

**Componentes:**
1. Gás de arraste (He, N₂, H₂)
2. Injetor (split/splitless, on-column)
3. Coluna
4. Forno (temperatura programável)
5. Detector
6. Sistema de dados

**Colunas:**
| Tipo | Diâmetro | Espessura do filme | Aplicação |
|------|----------|-------------------|-----------|
| **Capilar** | 0,1-0,53 mm | 0,1-5 µm | Alta resolução |
| **Empacotada** | 2-4 mm | — | Menor resolução, maior capacidade |

**Fases estacionárias típicas:**
- **Apolar:** 100% dimetilpolisiloxano (DB-1, HP-1)
- **Média polaridade:** 5% fenil-95% metil (DB-5, HP-5)
- **Polar:** polietilenoglicol (Carbowax, DB-WAX)

**Detectores:**
| Detector | Seletividade | LD |
|----------|-------------|-----|
| **FID (ionização em chama)** | Compostos orgânicos | pg/s |
| **TCD (condutividade térmica)** | Universal | ng/s |
| **ECD (captura de elétrons)** | Halogenados, nitro | fg/s |
| **MS (espectrometria de massas)** | Estrutural | pg |

### 3.4 Cromatografia em Camada Delgada (CCD/TLC)

**Princípio:** FE em placa (sílica, alumina), FM sobe por capilaridade

**Parâmetro:** Rf = distância percorrida pela amostra / distância percorrida pela FM
- Rf varia de 0 (não sai do ponto) a 1 (move com a FM)
- Compostos mais polares têm menor Rf (em fase normal)

**Aplicações:** análise qualitativa rápida, acompanhamento de reações, screening

### 3.5 Fundamentos de Separação Cromatográfica

**Teoria de van Deemter:** HEPT = A + B/u + C·u
- A = difusão de eddy (empacotamento)
- B = difusão longitudinal
- C = resistência à transferência de massa
- u = velocidade linear da FM

**Curva de van Deemter:** HEPT vs. u → determina a vazão ótima

**Modos de separação:**
- **Por adsorção:** FE sólida (sílica, alumina)
- **Por partição:** FE líquida suportada
- **Por troca iônica:** FE com grupos carregados
- **Por exclusão (GPC, SEC):** FE porosa, separa por tamanho molecular
- **Por afinidade:** FE com ligante específico (biomoléculas)

---

## Exercícios

**Q1.** (Cesgranrio) Qual detector de CG é mais adequado para análise de compostos organoclorados?
A) **ECD** ✅
B) FID
C) TCD
D) MS
E) UV

> ECD é seletivo para compostos halogenados e nitro, com baixíssimo limite de detecção (fg).

**Q2.** Na Lei de Beer-Lambert, A = εbc, se b = 1 cm e c = 0,001 mol/L, qual a absortividade molar se A = 0,5?
A) **500 L·mol⁻¹·cm⁻¹** ✅
B) 50 L·mol⁻¹·cm⁻¹
C) 0,005 L·mol⁻¹·cm⁻¹
D) 0,5 L·mol⁻¹·cm⁻¹
E) 5.000 L·mol⁻¹·cm⁻¹

> ε = A/(b·c) = 0,5/(1 × 0,001) = 500 L·mol⁻¹·cm⁻¹

**Q3.** Qual transição eletrônica ocorre em compostos com ligação C=O?
A) σ → σ*
B) π → π*
C) **n → π*** ✅
D) σ → π*
E) Todas

> C=O tem elétrons não ligantes (n) no oxigênio e elétrons π. Transição n → π* é a de menor energia e mais característica.

**Q5.** Em cromatografia em fase reversa (C₁₈), qual composto elui primeiro?
A) **Mais polar** ✅
B) Menos polar
C) Maior massa molar
D) Menor massa molar
E) Não depende da polaridade

> Fase reversa: FE apolar. Compostos polares interagem menos com a FE e eluem primeiro.
