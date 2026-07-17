# Físico-Química - Conteúdo Completo

**Peso na prova:** ~15% (6-7 questões)
**Horas totais no plano:** ~56h (3.5h/semana)

> ⚡ **Estratégia Cesgranrio:** O tópico **Soluções** (concentração, diluição, Kps) é o mais cobrado de toda a prova de Química. Em segundo lugar, **Equilíbrio Químico** (pH, Le Chatelier, tampão). Cesgranrio sempre coloca pelo menos 1 questão de **Eletroquímica** (pilha Zn/Cu é clássica). Domine a Lei de Beer para UV-Vis (A = εbc) e equação de Henderson-Hasselbalch.

---

## 1. SOLUÇÕES

### 1.1 Dispersões

| Tipo | Tamanho da partícula | Exemplo |
|------|---------------------|---------|
| Solução verdadeira | < 1 nm | NaCl em água |
| Coloide | 1 - 1000 nm | Leite, gelatina, fumaça |
| Suspensão | > 1000 nm | Areia em água |

### 1.2 Tipos de Concentração

| Tipo | Fórmula | Unidade |
|------|---------|---------|
| Concentração comum | C = m/V | g/L |
| Molaridade | M = n/V = m/(MM·V) | mol/L |
| Molalidade | W = n/m(kg solvente) | mol/kg |
| Título em massa | τ = m(soluto)/m(solução) | adimensional |
| Título em volume | τ = V(soluto)/V(solução) | adimensional |
| ppm | ppm = (m(soluto)/m(solução)) × 10⁶ | mg/kg ou mg/L |
| Fração molar | X = n₁/(n₁+n₂) | adimensional |

**Onde:** m = massa (g), V = volume (L), n = nº de mols, MM = massa molar (g/mol)

### 1.3 Diluição

**C₁V₁ = C₂V₂** e **M₁V₁ = M₂V₂**

A concentração final é calculada pela diluição: ao adicionar solvente, a quantidade de soluto permanece constante.

### 1.4 Mistura de Soluções

**Mesmo soluto (sem reação):**
M₁V₁ + M₂V₂ = M_final · V_final

**Solutos diferentes (com reação):**
1. Escrever a equação balanceada
2. Calcular quantos mols de cada soluto
3. Verificar reagente limitante
4. Calcular concentração final dos produtos

### 1.5 Solubilidade e Kps

**Kps (Produto de Solubilidade):** constante do equilíbrio de dissolução de um sólido iônico

**Exemplo:** AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)
Kps = [Ag⁺][Cl⁻] = s² (s = solubilidade molar)

**Cálculo da solubilidade (s) a partir do Kps:**
| Sal | Relação | Kps |
|-----|---------|-----|
| AB (1:1) | s = √Kps | AgCl, BaSO₄ |
| AB₂ (1:2) | s = ³√(Kps/4) | CaF₂, PbCl₂ |
| A₂B (2:1) | s = ³√(Kps/4) | Ag₂CrO₄ |

**Efeito do íon comum:** adicionar um íon já presente no equilíbrio desloca o equilíbrio para a esquerda (menos dissolução, menor solubilidade).

### 1.6 Coloides

| Tipo | Fase dispersa | Meio dispersante | Exemplo |
|------|--------------|-----------------|---------|
| Sol | Sólido | Líquido | Tinta nanquim |
| Gel | Líquido | Sólido | Gelatina |
| Emulsão | Líquido | Líquido | Leite, maionese |
| Espuma | Gás | Líquido | Chantilly |
| Aerossol | Líquido | Gás | Névoa |
| Fumaça | Sólido | Gás | Fumaça |

**Efeito Tyndall:** dispersão da luz por partículas coloidais (feixe de luz visível)

**Eletroforese:** migração de partículas coloidais em campo elétrico (carga superficial)

**Coagulação:** desestabilização do coloide por adição de eletrólitos

---

## 2. PROPRIEDADES COLIGATIVAS

Propriedades que dependem apenas do **número de partículas** do soluto, não de sua natureza.

| Propriedade | Efeito | Fórmula |
|-------------|--------|---------|
| **Tonoscopia** | ↓ Pressão de vapor | ΔP = P₀ · X₂ (Lei de Raoult) |
| **Ebulioscopia** | ↑ Temperatura de ebulição | ΔTe = Ke · W |
| **Crioscopia** | ↓ Temperatura de congelamento | ΔTc = Kc · W |
| **Osmose** | Pressão osmótica | π = M · R · T · i |

> 🧠 **Mnemônico "TECO":** **T**onoscopia (↓ pressão vapor), **E**bulioscopia (↑ PE), **C**rioscopia (↓ PF), **O**smose (π). Lembre: "**T**oda **E**mpresa **C**omercial **O**pera" — as 4 propriedades coligativas.

**Onde:**
- P₀ = pressão de vapor do solvente puro
- X₂ = fração molar do soluto
- Ke = constante ebulioscópica do solvente
- Kc = constante crioscópica do solvente
- W = molalidade
- M = molaridade
- i = fator de Van't Hoff

**Fator de Van't Hoff (i):** corrige o número de partículas para solutos iônicos
i = 1 + α(q - 1)
- α = grau de dissociação/ionização
- q = número de íons liberados por fórmula

**Exemplo:** NaCl (α ≈ 1, q = 2) → i = 1 + 1(2-1) = 2
CaCl₂ (α ≈ 1, q = 3) → i = 1 + 1(3-1) = 3

---

## 3. CINÉTICA QUÍMICA

### 3.1 Velocidade das Reações

**Velocidade média:** v = |Δ[reação]|/Δt = -Δ[reagente]/Δt = +Δ[produto]/Δt

**Lei da velocidade (Lei de Ação das Massas):**
Para aA + bB → cC + dD
v = k[A]ᵃ[B]ᵇ

Onde k = constante de velocidade, a e b = ordens de reação (determinadas experimentalmente)

**Ordem de reação:**

| Ordem | Unidade de k | Meia-vida (t₁/₂) |
|-------|-------------|-------------------|
| 0 | mol·L⁻¹·s⁻¹ | [A]₀/(2k) |
| 1 | s⁻¹ | ln 2/k |
| 2 | L·mol⁻¹·s⁻¹ | 1/(k[A]₀) |

### 3.2 Fatores que Afetam a Velocidade

| Fator | Efeito |
|-------|--------|
| **Temperatura** | ↑ a cada 10°C, a velocidade dobra (Aproximadamente) |
| **Concentração** | ↑ concentração = ↑ colisões = ↑ velocidade |
| **Catalisador** | ↓ energia de ativação = ↑ velocidade (não é consumido) |
| **Superfície de contato** | ↑ superfície = ↑ colisões = ↑ velocidade |

### 3.3 Energia de Ativação (Ea)

- Energia mínima necessária para a reação ocorrer
- **Equação de Arrhenius:** k = A·e^(-Ea/RT)
  - k = constante de velocidade
  - A = fator de frequência
  - R = constante dos gases (8,314 J/mol·K)
  - T = temperatura (K)

### 3.4 Mecanismos de Reação

- **Etapa lenta (determinante):** a etapa mais lenta do mecanismo determina a velocidade global
- **Molecularidade:** número de moléculas que colidem na etapa elementar
  - Unimolecular (1), Bimolecular (2), Trimolecular (3, raro)

---

## 4. EQUILÍBRIO QUÍMICO

### 4.1 Constante de Equilíbrio

Para aA + bB ⇌ cC + dD (todos em equilíbrio):

**Kc = [C]ᶜ[D]ᵈ / ([A]ᵃ[B]ᵇ)** (concentrações em mol/L)
**Kp = (PC)ᶜ(PD)ᵈ / ((PA)ᵃ(PB)ᵇ)** (pressões parciais)

**Relação Kp e Kc:** Kp = Kc(RT)^(Δn)
Δn = Σ coeficientes produtos - Σ coeficientes reagentes (fase gasosa)

**Equilíbrio Heterogêneo:** sólidos puros e líquidos puros não entram na expressão de K (atividade = 1)

### 4.2 Princípio de Le Chatelier

"Quando um sistema em equilíbrio sofre uma perturbação, ele se desloca no sentido de minimizar o efeito dessa perturbação."

| Perturbação | Efeito no equilíbrio |
|-------------|---------------------|
| ↑ Concentração de reagente | Desloca para direita (mais produto) |
| ↑ Concentração de produto | Desloca para esquerda (mais reagente) |
| ↑ Pressão (↓ Volume) | Desloca para o lado com menos mols de gás |
| ↑ Temperatura | Desloca para o lado endotérmico |
| Catalisador | Não desloca (apenas acelera atingir equilíbrio) |

### 4.3 Equilíbrio Iônico

**Autoionização da água:** H₂O ⇌ H⁺ + OH⁻
Kw = [H⁺][OH⁻] = 10⁻¹⁴ (a 25°C)

| Solução | [H⁺] | [OH⁻] | pH |
|---------|------|-------|----|
| Neutra | 10⁻⁷ | 10⁻⁷ | 7 |
| Ácida | > 10⁻⁷ | < 10⁻⁷ | < 7 |
| Básica | < 10⁻⁷ | > 10⁻⁷ | > 7 |

### 4.4 pH e pOH

**pH = -log[H⁺]**
**pOH = -log[OH⁻]**
**pH + pOH = 14** (a 25°C)

**Escala:**
- Ácido forte: pH 0-3
- Ácido fraco: pH 3-6
- Neutro: pH 7
- Base fraca: pH 8-11
- Base forte: pH 11-14

### 4.5 Hidrólise de Sais

| Tipo de sal | Caráter da solução | Exemplo |
|-------------|-------------------|---------|
| Ácido forte + Base forte | Neutro (pH = 7) | NaCl |
| Ácido forte + Base fraca | Ácido (pH < 7) | NH₄Cl |
| Ácido fraco + Base forte | Básico (pH > 7) | NaCH₃COO |
| Ácido fraco + Base fraca | Depende do Ka/Kb | NH₄CH₃COO |

### 4.6 Solução-Tampão

Mistura que resiste a variações de pH (ácido fraco + seu sal, ou base fraca + seu sal)

**Equação de Henderson-Hasselbalch:**
pH = pKa + log([sal]/[ácido])
pOH = pKb + log([sal]/[base])

---

## 5. TERMOQUÍMICA

### 5.1 Conceitos

| Conceito | Definição |
|----------|-----------|
| **Entalpia (H)** | Conteúdo de calor do sistema |
| **ΔH = H(produtos) - H(reagentes)** | Variação de entalpia |
| **Exotérmica** | ΔH < 0 (libera calor) |
| **Endotérmica** | ΔH > 0 (absorve calor) |
| **Entropia (S)** | Medida da desordem do sistema |
| **Energia Livre (G)** | ΔG = ΔH - TΔS (espontaneidade) |

### 5.2 Lei de Hess

**ΔH da reação independe do caminho, dependendo apenas do estado inicial e final.**

Para calcular ΔH:
1. Somar ΔH de etapas intermediárias
2. Inverter reação → inverter sinal do ΔH
3. Multiplicar coeficientes → multiplicar ΔH

### 5.3 Entalpias Padrão

| Tipo | Definição |
|------|-----------|
| ΔHf° (formação) | Calor na formação de 1 mol a partir de substâncias simples no estado padrão |
| ΔHc° (combustão) | Calor na queima de 1 mol com O₂ |
| ΔHlig (ligação) | Energia para quebrar 1 mol de ligação (sempre endotérmico) |

**Cálculo por energia de ligação:**
ΔH = Σ E(ligações quebradas) - Σ E(ligações formadas)

---

## 6. ELETROQUÍMICA

### 6.1 Pilha (Célula Galvânica)

**Espontânea:** ΔG < 0, E° > 0

**Representação (notação de pilha):**
Ânodo(-) | Solução anódica || Solução catódica | Cátodo(+)

**Componentes:**
- **Ânodo (-):** onde ocorre oxidação (perde elétrons)
- **Cátodo (+):** onde ocorre redução (ganha elétrons)
- **Ponte salina:** fecha o circuito, mantém neutralidade

**Potencial padrão (E°):**
E° = E°(cátodo) - E°(ânodo)
**Equação de Nernst:** E = E° - (0,059/n)·log Q

**Tabela de potenciais-padrão (E°red):**
| Semirreação | E°red (V) |
|------------|-----------|
| Li⁺ + e⁻ → Li | -3,05 |
| Zn²⁺ + 2e⁻ → Zn | -0,76 |
| Fe²⁺ + 2e⁻ → Fe | -0,44 |
| 2H⁺ + 2e⁻ → H₂ | 0,00 |
| Cu²⁺ + 2e⁻ → Cu | +0,34 |
| Fe³⁺ + e⁻ → Fe²⁺ | +0,77 |
| Ag⁺ + e⁻ → Ag | +0,80 |
| O₂ + 4H⁺ + 4e⁻ → 2H₂O | +1,23 |
| F₂ + 2e⁻ → 2F⁻ | +2,87 |

**Quanto menor E°red, maior o poder redutor.****

### 6.2 Eletrólise

**Não espontânea:** ΔG > 0, usa energia elétrica

**Eletrólise Ígnea:** sal fundido (sem água)
- NaCl(l) → Na⁺ + Cl⁻
- Cátodo: Na⁺ + e⁻ → Na
- Ânodo: 2Cl⁻ → Cl₂ + 2e⁻

**Eletrólise Aquosa:** solução aquosa (H₂O compete)
- Cátodo: descarga dos cátions (maior potencial de redução reduz primeiro)
- Ânodo: descarga dos ânions (menor potencial de redução oxida primeiro)

**Leis de Faraday:**
- 1ª lei: massa depositada ∝ carga elétrica (Q = i·t)
- 2ª lei: 1 mol de elétrons = 96.485 C (1 Faraday)
- m = (Q·MM)/(n·F) onde n = nº de elétrons, MM = massa molar, F = 96.485 C/mol

---

## Exercícios Comentados

**Q1.** Qual a molaridade de uma solução com 40g de NaOH (MM=40g/mol) em 500 mL?
A) **2,0 mol/L** ✅
B) 1,0 mol/L
C) 0,5 mol/L
D) 4,0 mol/L
E) 0,25 mol/L

> M = n/V = (40/40)/0,5 = 1/0,5 = 2,0 mol/L

**Q2.** (Cesgranrio) O pH de uma solução 0,01 mol/L de HCl (ácido forte) é:
A) 1
B) **2** ✅
C) 7
D) 12
E) 13

> HCl 0,01M → [H⁺] = 10⁻² → pH = -log(10⁻²) = 2

**Q3.** Na pilha Zn|Zn²⁺||Cu²⁺|Cu, qual o potencial padrão?
A) -1,10 V
B) **+1,10 V** ✅
C) +0,34 V
D) -0,76 V
E) +0,42 V

> E° = E°(cátodo) - E°(ânodo) = 0,34 - (-0,76) = +1,10 V. Ânodo: Zn oxida (E° = -0,76), Cátodo: Cu reduz (E° = +0,34).

**Q4.** Uma reação exotérmica tem ΔH:
A) **Negativo** ✅
B) Positivo
C) Zero
D) Dependente da temperatura
E) Igual a ΔG

> **Resposta:** A. Exotérmica: sistema libera calor → ΔH = H(p) - H(r) < 0.

**Q5.** Qual o efeito de aumentar a temperatura em um equilíbrio endotérmico (ΔH > 0)?
A) **Desloca para a direita** ✅
B) Desloca para a esquerda
C) Não desloca
D) Aumenta a constante de equilíbrio
E) A e D

> **Resposta:** E. Aumentar T favorece o sentido endotérmico (direita), e Kc aumenta (K = e^(-ΔG/RT), T maior favorece ΔH > 0).

**Q6.** Uma solução de NaOH tem pH = 13. Qual a concentração de OH⁻ em mol/L?
A) 10⁻¹³
B) 10⁻⁷
C) **10⁻¹** ✅
D) 10¹
E) 13

> pH = 13 → pOH = 14 - 13 = 1 → [OH⁻] = 10⁻¹ mol/L. Questão clássica Cesgranrio: relação pH + pOH = 14.

**Q7.** (Cesgranrio) Na pilha Zn|Zn²⁺(1M)||Cu²⁺(1M)|Cu, qual das afirmações é correta? (E°red: Zn²⁺/Zn = -0,76 V; Cu²⁺/Cu = +0,34 V)
A) O zinco sofre redução
B) **O potencial da pilha é +1,10 V** ✅
C) Os elétrons fluem do cobre para o zinco
D) O cobre é o ânodo
E) A pilha não é espontânea

> **Resposta:** B. E° = E°(cátodo) - E°(ânodo) = 0,34 - (-0,76) = +1,10 V. Zn oxida (ânodo, -), Cu reduz (cátodo, +), elétrons fluem do Zn para o Cu. E° > 0 → espontânea.
