# Matemática - Conteúdo Completo

**Peso na prova:** ~17% (10 questões)
**Horas totais no plano:** ~56h (3.5h/semana)

---

## 1. CONJUNTOS NUMÉRICOS

### 1.1 Classificação

| Conjunto | Símbolo | Elementos |
|----------|---------|-----------|
| Naturais | ℕ | {0, 1, 2, 3, ...} |
| Inteiros | ℤ | {..., -2, -1, 0, 1, 2, ...} |
| Racionais | ℚ | Frações, decimais exatos, dízimas periódicas |
| Irracionais | ℝ - ℚ | π, √2, √3, e (decimais não periódicos) |
| Reais | ℝ | ℚ ∪ Irracionais |

**ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ**

### 1.2 Operações com Conjuntos

| Operação | Símbolo | Definição |
|----------|---------|-----------|
| União | A ∪ B | Elementos que pertencem a A ou B |
| Intersecção | A ∩ B | Elementos que pertencem a A e B |
| Diferença | A - B | Elementos que estão em A mas não em B |
| Complementar | ∁A | Elementos do universo que não estão em A |

### 1.3 Intervalos Reais

| Tipo | Representação | Exemplo |
|------|--------------|---------|
| Fechado | [a, b] = {x ∈ ℝ \| a ≤ x ≤ b} | [2, 5] = 2, 3, 4, 5 |
| Aberto | (a, b) = {x ∈ ℝ \| a < x < b} | (2, 5) = 3, 4 |
| Semi-aberto | [a, b) ou (a, b] | [2, 5) = 2, 3, 4 |
| Infinito | [a, ∞), (-∞, b], (-∞, ∞) | [2, ∞) = x ≥ 2 |

---

## 2. FUNÇÕES

### 2.1 Definição

Relação entre dois conjuntos onde cada elemento do domínio (x) se relaciona com **exatamente um** elemento da imagem (y = f(x)).

**Domínio:** valores que x pode assumir
**Contradomínio:** valores possíveis de y
**Imagem:** valores que y efetivamente assume

### 2.2 Função Afim (1º grau)

**f(x) = ax + b** (a, b ∈ ℝ, a ≠ 0)

| Característica | Descrição |
|---------------|-----------|
| Coeficiente angular (a) | Taxa de variação, inclinação da reta |
| Coeficiente linear (b) | Ponto onde a reta corta o eixo y (x=0) |
| Raiz/zero | x = -b/a (ponto onde corta o eixo x) |
| Crescente | a > 0 (reta inclinada para cima) |
| Decrescente | a < 0 (reta inclinada para baixo) |

**Gráfico:** reta
**Exemplo:** f(x) = 2x + 3 → a = 2 (crescente), b = 3 (corta y em 3), raiz = -3/2

### 2.3 Função Quadrática (2º grau)

**f(x) = ax² + bx + c** (a ≠ 0)

**Concavidade:**
| a > 0 | a < 0 |
|-------|-------|
| Concavidade para cima (mínimo) | Concavidade para baixo (máximo) |

**Vértice (ponto máximo ou mínimo):**
- xv = -b/(2a)
- yv = -Δ/(4a) onde Δ = b² - 4ac

**Raízes:** x = [-b ± √Δ] / (2a)
| Δ | Nº de raízes |
|---|-------------|
| Δ > 0 | Duas raízes reais e distintas |
| Δ = 0 | Uma raiz real (duas iguais) |
| Δ < 0 | Nenhuma raiz real |

**Forma fatorada:** f(x) = a(x - x₁)(x - x₂)

### 2.4 Função Exponencial

**f(x) = aˣ** (a > 0 e a ≠ 1)

| Propriedade | a > 1 | 0 < a < 1 |
|-------------|-------|-----------|
| Crescimento | Crescente | Decrescente |
| Exemplo | f(x) = 2ˣ | f(x) = (1/2)ˣ |
| Gráfico | Sobe para direita | Desce para direita |

**Propriedades:**
- a⁰ = 1
- aˣ × aʸ = aˣ⁺ʸ
- aˣ ÷ aʸ = aˣ⁻ʸ
- (aˣ)ʸ = aˣʸ
- a⁻ˣ = 1/aˣ

### 2.5 Função Logarítmica

**f(x) = logₐ x** (a > 0, a ≠ 1, x > 0)

**Relação com exponencial:** logₐ x = y ↔ aʸ = x

**Propriedades:**
- logₐ 1 = 0
- logₐ a = 1
- logₐ (M·N) = logₐ M + logₐ N
- logₐ (M/N) = logₐ M - logₐ N
- logₐ Mⁿ = n·logₐ M
- logₐ M = logₐ M / logₐ b (mudança de base)
- ln x = logₑ x (logaritmo natural, base e)

### 2.6 Funções Trigonométricas

**Função Seno:** f(x) = sen x
- Domínio: ℝ
- Imagem: [-1, 1]
- Período: 2π
- Sen 0 = 0, sen π/2 = 1, sen π = 0, sen 3π/2 = -1, sen 2π = 0

**Função Cosseno:** f(x) = cos x
- Domínio: ℝ
- Imagem: [-1, 1]
- Período: 2π
- Cos 0 = 1, cos π/2 = 0, cos π = -1, cos 3π/2 = 0, cos 2π = 1

**Função Tangente:** f(x) = tg x = sen x/cos x
- Domínio: ℝ - {π/2 + kπ}
- Imagem: ℝ
- Período: π

---

## 3. EQUAÇÕES

### 3.1 Equações de 1º e 2º graus

**1º grau:** ax + b = 0 → x = -b/a
**2º grau:** ax² + bx + c = 0 → x = [-b ± √(b² - 4ac)]/(2a)

### 3.2 Sistemas Lineares

**Métodos de resolução:**
- **Substituição:** isola uma variável em uma equação e substitui na outra
- **Adição:** soma as equações após multiplicar por constantes para eliminar uma variável

**Classificação:**
| Tipo | Solução | Gráfico |
|------|---------|---------|
| Possível e determinado (SPD) | Uma única solução | Retas concorrentes |
| Possível e indeterminado (SPI) | Infinitas soluções | Retas coincidentes |
| Impossível (SI) | Nenhuma solução | Retas paralelas |

---

## 4. ANÁLISE COMBINATÓRIA

### 4.1 Princípio Fundamental da Contagem (PFC)

Se um evento tem m modos de ocorrer e outro tem n modos, então ambos ocorrem de m × n modos.

### 4.2 Fatorial

n! = n × (n-1) × (n-2) × ... × 3 × 2 × 1
0! = 1

### 4.3 Permutação

**Simples:** Pn = n!
- Ex: 4 pessoas em uma fila → 4! = 24 modos

**Com repetição:** Pn^(a,b,c) = n!/(a!·b!·c!)

**Circular:** PCn = (n-1)!

### 4.4 Arranjo

**Simples:** A(n,p) = n!/(n-p)! (ordem importa, sem repetição)
- Ex: 3 primeiros lugares entre 10 corredores: A(10,3) = 10!/7! = 10×9×8 = 720

### 4.5 Combinação

**Simples:** C(n,p) = n!/[p!(n-p)!] (ordem NÃO importa)
- Ex: 3 pessoas entre 10 para comissão: C(10,3) = 10!/(3!7!) = 120

**Propriedade:** C(n,p) = C(n, n-p)

### 4.6 Probabilidade

**Definição:** P(A) = nº de casos favoráveis / nº de casos possíveis

**Propriedades:**
- 0 ≤ P(A) ≤ 1
- P(A) + P(Ā) = 1
- P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
- Eventos independentes: P(A ∩ B) = P(A) × P(B)

---

## 5. SEQUÊNCIAS (PA e PG)

### 5.1 Progressão Aritmética (PA)

**Fórmula do termo geral:** an = a₁ + (n-1)·r
**Soma dos n termos:** Sn = (a₁ + an)·n/2

| PA | r | Exemplo |
|----|---|---------|
| Crescente | r > 0 | (2, 5, 8, 11, ...) r=3 |
| Decrescente | r < 0 | (10, 7, 4, 1, ...) r=-3 |
| Constante | r = 0 | (5, 5, 5, 5, ...) |

### 5.2 Progressão Geométrica (PG)

**Fórmula do termo geral:** an = a₁·q^(n-1)
**Soma dos n termos:** Sn = a₁(qⁿ - 1)/(q - 1)
**Soma infinita (|q| < 1):** S∞ = a₁/(1 - q)

| PG | q | Exemplo |
|----|---|---------|
| Crescente | q > 1 | (2, 6, 18, 54, ...) q=3 |
| Decrescente | 0 < q < 1 | (8, 4, 2, 1, ...) q=1/2 |
| Alternante | q < 0 | (2, -6, 18, -54, ...) q=-3 |

---

## 6. MATRIZES E DETERMINANTES

### 6.1 Matrizes

**Ordem:** m × n (m linhas, n colunas)

**Operações:**
- **Adição:** soma elemento a elemento (mesma ordem)
- **Multiplicação por escalar:** multiplica cada elemento
- **Multiplicação de matrizes:** A(m×n) × B(n×p) = C(m×p)

**Matrizes especiais:**
- **Identidade (I):** diagonal principal = 1, demais = 0
- **Transposta (Aᵀ):** linhas viram colunas (Aᵀ)ij = Aji
- **Inversa (A⁻¹):** A × A⁻¹ = I

### 6.2 Determinantes

| Ordem | Cálculo |
|-------|---------|
| 1×1 | det[a] = a |
| 2×2 | det = ad - bc (regra da diagonal) |
| 3×3 | Regra de Sarrus (copiar 2 primeiras colunas, somar diagonais, subtrair) |

**Propriedades:**
- det A = det Aᵀ
- det(A·B) = det A × det B
- Se trocar 2 linhas/colunas, det troca de sinal
- Se duas linhas/colunas iguais, det = 0
- det(k·A) = kⁿ·det A (n = ordem)

---

## 7. GEOMETRIA PLANA

**Triângulo:**
- Área: A = (base × altura)/2
- Soma dos ângulos internos: 180°
- **Teorema de Pitágoras:** a² = b² + c² (triângulo retângulo)

**Quadrado:** A = L², P = 4L
**Retângulo:** A = b × h, P = 2(b + h)
**Círculo:** A = πR², C = 2πR
**Losango:** A = (D × d)/2 (diagonal maior × menor)
**Trapézio:** A = (B + b) × h/2

---

## 8. GEOMETRIA ESPACIAL

| Sólido | Volume | Área total |
|--------|--------|------------|
| Cubo | V = a³ | AT = 6a² |
| Paralelepípedo | V = a·b·c | AT = 2(ab+ac+bc) |
| Cilindro | V = πR²h | AT = 2πR(R+h) |
| Cone | V = πR²h/3 | AT = πR(R+g) |
| Esfera | V = 4πR³/3 | AT = 4πR² |

---

## 9. GEOMETRIA ANALÍTICA

**Distância entre pontos:** d = √[(x₂-x₁)² + (y₂-y₁)²]
**Ponto médio:** M = ((x₁+x₂)/2, (y₁+y₂)/2)

**Equação da reta:**
- Geral: ax + by + c = 0
- Reduzida: y = mx + n (m = coeficiente angular, n = coeficiente linear)
- m = tg θ = Δy/Δx

**Equação da circunferência:**
- (x - a)² + (y - b)² = R² (a, b = centro, R = raio)

---

## 10. MATEMÁTICA FINANCEIRA

**Juros Simples:** J = C·i·t / M = C + J = C(1 + i·t)
**Juros Compostos:** M = C(1 + i)ᵗ / J = M - C

Onde: C = capital, i = taxa (decimal), t = tempo, J = juros, M = montante

**Desconto Simples:**
- **Racional (por dentro):** D = N·i·t/(1+i·t) / Valor atual: A = N/(1+i·t)
- **Comercial (por fora):** D = N·i·t / Valor atual: A = N(1 - i·t)

---

> 🧠 **Mnemônicos Matemática:** PA: "P**A**rte **A**diante" — termo geral: aₙ = a₁ + (n-1)·r (soma a razão). PG: "P**G**uarda **G**rande" — termo geral: aₙ = a₁·q^(n-1) (multiplica pela razão). Função afim f(x)=ax+b: "**a** = **a**ngulo" (coeficiente angular), "**b** = **b**ase" (corta y em b).

---

## Exercícios Comentados

**Q1.** (Cesgranrio) Se f(x) = 2x + 3, qual o valor de f(5)?
A) 10
B) **13** ✅
C) 15
D) 20
E) 25

> f(5) = 2(5) + 3 = 10 + 3 = 13

**Q2.** A soma das raízes da equação x² - 5x + 6 = 0 é:
A) -5
B) -2
C) **5** ✅
D) 6
E) 3

> Soma = -b/a = -(-5)/1 = 5

**Q3.** Quantos anagramas tem a palavra "PETRO"?
A) **120** ✅
B) 60
C) 24
D) 12
E) 6

> P₅ = 5! = 120

**Q4.** Em uma PA, a₁ = 3 e r = 4. Qual o 10º termo?
A) **39** ✅
B) 40
C) 43
D) 36
E) 30

> a₁₀ = a₁ + 9r = 3 + 9×4 = 3 + 36 = 39

**Q5.** Qual o volume de um cilindro de raio 3 cm e altura 10 cm? (π = 3,14)
A) 282,6 cm³ ✅
B) 314 cm³
C) 94,2 cm³
D) 188,4 cm³
E) 141,3 cm³

> V = πR²h = 3,14 × 9 × 10 = 282,6 cm³
