# Metrologia e Estatística Aplicada - Conteúdo Completo

**Peso na prova:** ~3% (0-2 questões)
**Horas totais no plano:** ~16h (1h/semana)

> ⚡ **Estratégia Cesgranrio:** Tópico de menor peso, mas de resposta rápida. Foco em **precisão vs. exatidão**, **erro sistemático vs. aleatório**, **algarismos significativos** e **desvio padrão**. Se cair, será conceitual — entenda a definição de cada termo. ISO 17025 e calibração aparecem em questões sobre garantia da qualidade.

---

## 1. CONTROLE METROLÓGICO

### 1.1 Conceitos Fundamentais

| Termo | Definição |
|-------|-----------|
| **Metrologia** | Ciência da medição e suas aplicações |
| **Medição** | Processo de determinar experimentalmente um valor |
| **Mensurando** | Grandeza que se deseja medir |
| **Calibração** | Comparação do instrumento com um padrão de referência |
| **Padrão** | Material ou instrumento que materializa uma unidade |

### 1.2 Rastreabilidade Metrológica

- **Cadeia ininterrupta** de calibrações ligando o instrumento ao padrão primário
- Rastreabilidade ao SI (Sistema Internacional) através do INMETRO

### 1.3 Calibração de Instrumentos

**Etapas:**
1. Selecionar padrão de referência (certificado, rastreável)
2. Medir vários pontos da faixa de trabalho
3. Comparar leitura do instrumento com o padrão
4. Calcular erros e incertezas
5. Emitir certificado de calibração

**Freqüência de calibração:** depende de:
- Frequência de uso
- Estabilidade do instrumento
- Requisitos da qualidade
- Histórico de calibrações anteriores

### 1.4 Controle de Soluções e Reagentes

- **Validade:** data de preparo + condições de armazenamento
- **Padronização:** determinação da concentração real vs. teórica (fator de correção)
- **Rotulagem:** nome, concentração, data, responsável, validade

### 1.5 Sistemas de Garantia da Qualidade em Laboratório

**Normas relevantes:**
- **ISO/IEC 17025:** requisitos gerais para competência de laboratórios
- **NBR ISO 9001:** sistema de gestão da qualidade
- **BPF (Boas Práticas de Fabricação):** qualidade na produção

**Controles de qualidade:**
| Controle | Descrição |
|----------|-----------|
| **Branco** | Amostra sem analito (verifica contaminação) |
| **Duplicata** | Duas análises da mesma amostra (precisão) |
| **Material de referência** | Amostra de composição conhecida (exatidão) |
| **Adição de padrão (spike)** | Adicionar quantidade conhecida (recuperação) |
| **Carta-controle** | Gráfico de acompanhamento estatístico |

---

## 2. ESTATÍSTICA APLICADA

### 2.1 Erros em Análises Químicas

| Tipo | Definição | Exemplo | Como reduzir |
|------|-----------|---------|-------------|
| **Sistemático (determinado)** | Erro constante, desvio em uma direção | Vidraria mal calibrada, indicador errado | Calibração, padronização |
| **Aleatório (indeterminado)** | Erro variável, distribuição normal | Ruído do detector, variação de temperatura | Réplicas, média |

### 2.2 Precisão e Exatidão

| Conceito | Definição | Medida |
|----------|-----------|--------|
| **Precisão** | Proximidade entre réplicas (repetibilidade) | Desvio padrão, variância |
| **Exatidão** | Proximidade do valor verdadeiro | Erro relativo, recuperação |

**Relação:** é possível ser preciso sem ser exato (erro sistemático), mas não é possível ser exato sem ser preciso.

### 2.3 Medidas Estatísticas

**Média (x̄):** x̄ = Σxi / n

**Mediana:** valor central dos dados ordenados

**Moda:** valor mais frequente

**Variância (s²):** s² = Σ(xi - x̄)² / (n-1)

**Desvio Padrão (s):** s = √(s²)
- Aproximadamente 68% dos dados em x̄±1s
- Aproximadamente 95% dos dados em x̄±2s
- Aproximadamente 99,7% dos dados em x̄±3s

**Coeficiente de Variação (CV):** CV = (s/x̄) × 100%
- Medida relativa de dispersão (permite comparar diferentes escalas)

### 2.4 Algarismos Significativos e Arredondamento

**Regras de algarismos significativos:**
- Todos os algarismos exatos + o primeiro duvidoso
- Zeros à esquerda não são significativos (0,00123 → 3 AS)
- Zeros entre algarismos são significativos (1001 → 4 AS)
- Zeros à direita após decimal são significativos (1,230 → 4 AS)
- Zeros à direita sem decimal são ambíguos (use notação científica)

**Regras de arredondamento:**
- Se o algarismo seguinte < 5: mantém
- Se ≥ 5: aumenta 1
- Arredondamento de 5: se anterior par → mantém; se ímpar → aumenta

### 2.5 Intervalo de Confiança

**μ = x̄ ± t·s/√n**

Onde:
- μ = média verdadeira (população)
- x̄ = média da amostra
- t = valor de Student (tabelado, depende do n e do nível de confiança)
- s = desvio padrão
- n = número de medidas

**Níveis de confiança comuns:** 90%, 95%, 99%

### 2.6 Testes de Significância

| Teste | Compara | Aplicação |
|-------|---------|-----------|
| **Teste t (Student)** | Duas médias | Se diferem significativamente |
| **Teste F** | Duas variâncias | Se as precisões são iguais |
| **Q-test (Dixon)** | Um valor suspeito | Se pode ser rejeitado como outlier |

### 2.7 Regressão Linear (Mínimos Quadrados)

**Equação da reta:** y = ax + b

**Cálculo dos coeficientes:**
a = [n·Σ(xy) - Σx·Σy] / [n·Σ(x²) - (Σx)²]
b = (Σy - a·Σx)/n

**Coeficiente de correlação (r):**
r = [n·Σ(xy) - Σx·Σy] / √[(n·Σ(x²)-(Σx)²)(n·Σ(y²)-(Σy)²)]

- r = 1 (correlação perfeita positiva)
- r = -1 (correlação perfeita negativa)
- r ≈ 0 (sem correlação linear)

---

## 3. CURVAS ANALÍTICAS

### 3.1 Construção de Curvas de Calibração

**Passos:**
1. Preparar soluções-padrão em concentrações conhecidas
2. Medir o sinal analítico (absorbância, área do pico, etc.)
3. Plotar sinal (y) vs. concentração (x)
4. Ajustar por regressão linear (y = ax + b)
5. Interpolar o sinal da amostra para obter concentração

### 3.2 Padrão Externo vs. Padrão Interno

| Método | Procedimento | Vantagem |
|--------|-------------|----------|
| **Padrão externo** | Curva com soluções-padrão separadas | Simples, direto |
| **Padrão interno** | Adicionar composto de referência a todas as soluções | Corrige variações de injeção/detecção |

### 3.3 Adição de Padrão

**Aplicação:** quando a matriz da amostra afeta o sinal analítico

**Procedimento:**
1. Medir sinal da amostra (Sₐ)
2. Adicionar quantidade conhecida do analito
3. Medir novo sinal (Sₐ₊ₚ)
4. Cₐ = (Sₐ × Cₚ) / (Sₐ₊ₚ - Sₐ)

### 3.4 Limite de Detecção (LD) e Quantificação (LQ)

| Parâmetro | Definição | Cálculo |
|-----------|-----------|---------|
| **LD** | Menor concentração detectável | LD = 3,3 × (s/y) |
| **LQ** | Menor concentração quantificável | LQ = 10 × (s/y) |

Onde s = desvio padrão do branco/intercepto, y = inclinação da curva

### 3.5 Linearidade e Faixa de Trabalho

**Linearidade:** capacidade de produzir resultados proporcionais à concentração
- Verificada pelo coeficiente de correlação (r > 0,995 ideal)
- Testada por resíduos (diferenças entre valor medido e calculado)

**Faixa de trabalho:** intervalo entre o menor e maior valor que podem ser medidos com precisão e exatidão adequadas

---

## Exercícios

**Q1.** Os resultados de uma análise foram: 10,2; 10,4; 10,1; 10,3. Qual a média e o desvio padrão?
A) Média = 10,25; DP = 0,13 ✅
B) Média = 10,25; DP = 0,15
C) Média = 10,20; DP = 0,10
D) Média = 10,30; DP = 0,15
E) Média = 10,25; DP = 0,20

> Média = (10,2+10,4+10,1+10,3)/4 = 41,0/4 = 10,25
> s = √[(0,05²+0,15²+(-0,15)²+0,05²)/(4-1)] = √[0,0025+0,0225+0,0225+0,0025)/3] = √(0,05/3) = √0,0167 = 0,13

**Q2.** Em uma calibração, obteve-se y = 0,05x + 0,01 (r² = 0,999). Se o sinal da amostra foi 0,51, qual a concentração?
A) **10,0** ✅
B) 10,2
C) 9,8
D) 11,0
E) 0,5

> y = 0,05x + 0,01 → 0,51 = 0,05x + 0,01 → 0,05x = 0,50 → x = 10,0

**Q3.** Qual a diferença entre precisão e exatidão?
A) **Precisão = reprodutibilidade; Exatidão = proximidade do valor verdadeiro** ✅
B) Precisão = valor verdadeiro; Exatidão = reprodutibilidade
C) São sinônimos
D) Precisão = erro sistemático; Exatidão = erro aleatório
E) Nenhuma das anteriores

> Precisão: quão próximas estão as réplicas entre si. Exatidão: quão próximo o resultado está do valor verdadeiro.

**Q4.** Para um resultado com 4 réplicas e desvio padrão de 0,15, qual o intervalo de confiança a 95% (t = 3,18)?
A) **x̄ ± 0,24** ✅
B) x̄ ± 0,15
C) x̄ ± 0,30
D) x̄ ± 0,48
E) x̄ ± 0,12

> IC = x̄ ± t·s/√n = x̄ ± 3,18 × 0,15/√4 = x̄ ± 3,18 × 0,15/2 = x̄ ± 0,24
