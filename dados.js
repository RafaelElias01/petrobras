export const CONTEUDOS = [
  {
    id: 'portugues',
    nome: 'Língua Portuguesa',
    icone: '📝',
    cor: '#4CAF50',
    questoes: 10,
    grupos: [
      {
        nome: 'Interpretação de Textos',
        exercicios_sugeridos: 3,
        topicos: [
          'Compreensão global do texto',
          'Significação contextual de palavras e expressões',
          'Tipologia textual (narração, descrição, dissertação)',
          'Ideia principal e ideias secundárias',
          'Inferência e pressuposição',
          'Recursos expressivos e figuras de linguagem',
          'Intertextualidade e paráfrase',
          'Coerência e coesão textual',
          'Funções da linguagem (emotiva, referencial, conativa, fática, metalinguística, poética)'
        ]
      },
      {
        nome: 'Ortografia e Acentuação',
        exercicios_sugeridos: 2,
        topicos: [
          'Emprego das letras (h, s, z, x, ch)',
          'Acentuação gráfica (regras)',
          'Emprego do hífen (Reforma Ortográfica)',
          'Parônimos e homônimos',
          'Ortografia oficial: verbos terminados em -isar/-izar, -ção/-são'
        ]
      },
      {
        nome: 'Morfologia',
        exercicios_sugeridos: 2,
        topicos: [
          'Substantivo, adjetivo, artigo, numeral',
          'Verbo: regulares, irregulares, tempos, modos, vozes',
          'Pronome: emprego, colocação, formas de tratamento',
          'Conjunção, preposição, advérbio',
          'Uso de "porque", "por que", "por quê", "porquê"',
          'Uso de "se" e "que"',
          'Formação de palavras: derivação, composição, onomatopeia'
        ]
      },
      {
        nome: 'Sintaxe',
        exercicios_sugeridos: 3,
        topicos: [
          'Concordância verbal e nominal (regras gerais e casos especiais)',
          'Regência verbal e nominal (com crase)',
          'Crase: regras de uso e casos facultativos',
          'Verbos impessoais (haver, fazer, ser)',
          'Indeterminação do sujeito (índice de indeterminação SE)',
          'Voz passiva pronominal (SE apassivador)',
          'Pronomes relativos (que, quem, cujo, onde)',
          'Emprego de "há" e "a" (tempo passado vs futuro)',
          'Período composto: coordenação e subordinação'
        ]
      },
      {
        nome: 'Pontuação',
        exercicios_sugeridos: 1,
        topicos: [
          'Vírgula: usos obrigatórios e proibidos',
          'Ponto e vírgula',
          'Dois-pontos',
          'Aspas, parênteses, travessão',
          'Reticências e ponto final'
        ]
      },
      {
        nome: 'Reescritura e Problemas da Língua',
        exercicios_sugeridos: 2,
        topicos: [
          'Reescritura de frases e parágrafos (manutenção do sentido)',
          'Problemas da língua culta (solecismos, ambiguidade, barbarismos)',
          'Estrutura e formação de palavras',
          'Vícios de linguagem: pleonasmo, cacofonia, eco, colisão',
          'Clareza, precisão e concisão textual'
        ]
      }
    ]
  },
  {
    id: 'matematica',
    nome: 'Matemática',
    icone: '🔢',
    cor: '#2196F3',
    questoes: 10,
    grupos: [
      {
        nome: 'Funções',
        exercicios_sugeridos: 3,
        topicos: [
          'Função afim (1º grau): gráfico, raiz, estudo de sinal',
          'Função quadrática (2º grau): vértice, raízes, concavidade',
          'Função exponencial: propriedades, gráfico, equações',
          'Função logarítmica: definição, propriedades, mudança de base',
          'Funções trigonométricas (seno, cosseno, tangente): gráficos e periodicidade',
          'Função modular: definição e gráfico',
          'Composição e inversão de funções'
        ]
      },
      {
        nome: 'Geometria',
        exercicios_sugeridos: 3,
        topicos: [
          'Geometria Plana: triângulos, quadriláteros, circunferência, áreas',
          'Geometria Espacial: cubo, paralelepípedo, cilindro, cone, esfera, pirâmide',
          'Geometria Analítica: equação da reta, circunferência, distância entre pontos',
          'Teorema de Pitágoras e relações métricas no triângulo retângulo',
          'Semelhança de triângulos e Teorema de Tales'
        ]
      },
      {
        nome: 'Análise Combinatória e Probabilidade',
        exercicios_sugeridos: 2,
        topicos: [
          'Princípio fundamental da contagem (PFC)',
          'Permutação simples e com repetição',
          'Arranjo simples',
          'Combinação simples',
          'Probabilidade: definição, eventos independentes, complementar',
          'Probabilidade condicional e Teorema de Bayes'
        ]
      },
      {
        nome: 'Progressões',
        exercicios_sugeridos: 1,
        topicos: [
          'Progressão Aritmética (PA): termo geral, soma dos termos',
          'Progressão Geométrica (PG): termo geral, soma finita e infinita',
          'Interpolação de meios aritméticos e geométricos'
        ]
      },
      {
        nome: 'Matrizes e Sistemas',
        exercicios_sugeridos: 1,
        topicos: [
          'Operações com matrizes (adição, multiplicação, transposição)',
          'Determinantes: cálculo e propriedades (2x2, 3x3)',
          'Sistemas lineares: escalonamento, regra de Cramer, discussão'
        ]
      },
      {
        nome: 'Aritmética e Problemas',
        exercicios_sugeridos: 2,
        topicos: [
          'Conjuntos numéricos (N, Z, Q, R, I) e intervalos',
          'Regra de três simples e composta',
          'Porcentagem e variação percentual',
          'Raciocínio lógico: sequências, proposições, tabelas-verdade',
          'Operações com números racionais e fracionários'
        ]
      },
      {
        nome: 'Matemática Financeira (0-1q)',
        exercicios_sugeridos: 1,
        topicos: [
          'Juros simples: fórmula, montante, taxa proporcional',
          'Juros compostos: fórmula, montante, taxa equivalente',
          'Descontos simples e compostos'
        ]
      },
      {
        nome: 'Estatística (0-1q)',
        exercicios_sugeridos: 1,
        topicos: [
          'Média aritmética, mediana, moda',
          'Desvio padrão, variância, coeficiente de variação',
          'Gráficos e interpretação de dados',
          'Distribuição de frequências e histogramas'
        ]
      }
    ]
  },
  {
    id: 'quimica',
    nome: 'Química',
    icone: '🧪',
    cor: '#FF9800',
    questoes: 38,
    grupos: [
      {
        nome: 'Substâncias e Propriedades',
        exercicios_sugeridos: 3,
        topicos: [
          'Modelos atômicos (Dalton, Thomson, Rutherford, Rutherford-Bohr)',
          'Números quânticos (principal, secundário, magnético, spin)',
          'Distribuição eletrônica (diagrama de Linus Pauling)',
          'Tabela periódica: períodos, grupos, famílias, classificação',
          'Propriedades periódicas: raio atômico, energia de ionização, afinidade eletrônica, eletronegatividade',
          'Ligações químicas: iônica, covalente (polar/apolar), metálica',
          'Geometria molecular pela teoria VSEPR',
          'Polaridade das moléculas e momento dipolar',
          'Forças intermoleculares: dipolo-dipolo, ligação de hidrogênio, van der Waals',
          'Relação entre forças intermoleculares e propriedades físicas (PE, PF, solubilidade)'
        ]
      },
      {
        nome: 'Funções Inorgânicas',
        exercicios_sugeridos: 4,
        topicos: [
          'Ácidos: classificação (forte/fraco, volátil/fixo), nomenclatura (HCl, H₂SO₄, HNO₃)',
          'Bases: classificação (forte/fraco, solúvel/insolúvel), nomenclatura (NaOH, Ca(OH)₂)',
          'Sais: classificação (ácido, básico, neutro, duplo, hidratado), nomenclatura (NaCl, CaCO₃)',
          'Óxidos: classificação (ácido, básico, anfótero, neutro, duplo)',
          'Hidretos: classificação (iônicos, covalentes)',
          'Peróxidos e superóxidos',
          'Reações de obtenção de ácidos e bases',
          'Ácidos e bases fortes vs fracos (Ka, Kb)',
          'Neutralização total e parcial',
          'Indicadores ácido-base e faixa de viragem'
        ]
      },
      {
        nome: 'Reações Inorgânicas',
        exercicios_sugeridos: 4,
        topicos: [
          'Balanceamento de equações por tentativa e redox',
          'NOX: determinação e variação',
          'Reações de oxirredução (redox): identificação e balanceamento',
          'Reações de síntese (adição) e decomposição (análise)',
          'Reações de simples troca (deslocamento) e dupla troca',
          'Reações de neutralização e salificação',
          'Reações de precipitação: regras de solubilidade',
          'Reações em meio ácido e básico',
          'Agentes oxidantes (KMnO₄, K₂Cr₂O₇, H₂O₂) e redutores comuns',
          'Cálculo de NOX em compostos orgânicos e complexos'
        ]
      },
      {
        nome: 'Estequiometria',
        exercicios_sugeridos: 5,
        topicos: [
          'Massa atômica, massa molecular, massa molar, mol',
          'Constante de Avogadro (6,02 × 10²³)',
          'Leis ponderais: Lavoisier (conservação da massa) e Proust (proporções definidas)',
          'Cálculos estequiométricos: mol-mol, massa-massa, massa-volume',
          'Reagente limitante e reagente em excesso',
          'Rendimento real, teórico e percentual',
          'Grau de pureza e impurezas em reagentes',
          'Relações estequiométricas envolvendo gases (CNTP)',
          'Fórmulas: mínima, molecular, percentual (centesimal)'
        ]
      },
      {
        nome: 'Soluções',
        exercicios_sugeridos: 5,
        topicos: [
          'Concentração comum (g/L) e densidade',
          'Concentração molar (molaridade, mol/L)',
          'Molalidade (w, mol/kg) e fração molar (X)',
          'Título em massa e volume, porcentagem (%)',
          'Partes por milhão (ppm) e partes por bilhão (ppb)',
          'Diluição de soluções: C₁V₁ = C₂V₂',
          'Mistura de soluções de mesmo soluto',
          'Mistura de soluções com reação química',
          'Solubilidade: curvas de solubilidade, solução saturada/insaturada/supersaturada',
          'Coeficiente de solubilidade (Kps) e produto iônico',
          'Propriedades coligativas: tonoscopia, ebulioscopia, crioscopia, osmoscopia',
          'Coloides: classificação (sol, gel, emulsão, espuma, aerossol), efeito Tyndall'
        ]
      },
      {
        nome: 'Química Orgânica - Nomenclatura',
        exercicios_sugeridos: 4,
        topicos: [
          'Cadeias carbônicas: classificação (aberta/fechada, saturada/insaturada, homogênea/heterogênea)',
          'Hidrocarbonetos: alcanos, alcenos, alcinos, alcadienos, cicloalcanos',
          'Hidrocarbonetos aromáticos: benzeno, derivados mono e polissubstituídos',
          'Petróleo: composição, refino, frações e processos de separação',
          'Funções oxigenadas: álcool, fenol, éter, aldeído, cetona, ácido carboxílico, éster',
          'Funções nitrogenadas: amina, amida, nitrocomposto, nitrila',
          'Haletos orgânicos e compostos sulfurados',
          'Nomenclatura IUPAC: regras oficiais, prefixos, radicais',
          'Nomenclatura usual (comum) de compostos orgânicos'
        ]
      },
      {
        nome: 'Química Orgânica - Reações',
        exercicios_sugeridos: 3,
        topicos: [
          'Reações de adição em alcenos e alcinos (H₂, halogênios, HX, H₂O)',
          'Reações de substituição em alcanos (halogenação)',
          'Reações de oxidação de álcoois (primário → aldeído → ácido; secundário → cetona)',
          'Reações de desidratação de álcoois (intra e intermolecular)',
          'Reações de esterificação e hidrólise de ésteres',
          'Reações de saponificação (obtenção de sabão)',
          'Polimerização por adição e condensação',
          'Substituição eletrofílica em aromáticos (nitração, sulfonação, alquilação, halogenação)'
        ]
      },
      {
        nome: 'Química Orgânica - Isomeria',
        exercicios_sugeridos: 2,
        topicos: [
          'Isomeria plana: função, cadeia, posição, metameria, tautomeria',
          'Isomeria geométrica (cis-trans) em alcenos e compostos cíclicos',
          'Isomeria óptica: carbono quiral, enantiômeros, diastereoisômeros',
          'Misturas racêmicas e atividade óptica',
          'Isomeria de compensação (metameria)'
        ]
      },
      {
        nome: 'Equilíbrio Químico',
        exercicios_sugeridos: 4,
        topicos: [
          'Constante de equilíbrio Kc e Kp (expressão, cálculo, relação Kp = Kc(RT)^Δn)',
          'Princípio de Le Chatelier: efeito da concentração, temperatura e pressão',
          'Deslocamento de equilíbrio: fatores que afetam o equilíbrio',
          'Equilíbrio iônico em soluções aquosas',
          'pH e pOH: cálculo, escala, Ka, Kb, Kw',
          'Grau de ionização (α) e constante de ionização',
          'Hidrólise de sais: soluções ácidas, básicas e neutras',
          'Solução-tampão: preparo, cálculo de pH, ação tamponante',
          'Produto de solubilidade (Kps): cálculo, precipitação, efeito do íon comum'
        ]
      },
      {
        nome: 'Cinética Química',
        exercicios_sugeridos: 3,
        topicos: [
          'Velocidade média e instantânea das reações',
          'Fatores que afetam a velocidade: temperatura, concentração, superfície de contato, catalisador',
          'Lei da velocidade (equação cinética): v = k[A]^m[B]^n',
          'Ordem de reação: zero, primeira, segunda',
          'Energia de ativação e complexo ativado',
          'Mecanismos de reação: etapas lenta e rápida',
          'Equação de Arrhenius: k = A·e^(-Ea/RT)',
          'Tempo de meia-vida (t½) para reações de 1ª ordem'
        ]
      },
      {
        nome: 'Termoquímica',
        exercicios_sugeridos: 3,
        topicos: [
          'Entalpia (H) e variação de entalpia (ΔH)',
          'Reações exotérmicas (ΔH < 0) e endotérmicas (ΔH > 0)',
          'Diagramas de entalpia: estado inicial, final, energia de ativação',
          'Lei de Hess: soma das entalpias, cálculo de ΔH indireto',
          'Entalpia de formação padrão (ΔHf°)',
          'Entalpia de combustão',
          'Energia de ligação: quebra (absorve) e formação (libera)',
          'Calorimetria: Q = mcΔT, capacidade calorífica'
        ]
      },
      {
        nome: 'Eletroquímica',
        exercicios_sugeridos: 3,
        topicos: [
          'Célula galvânica (pilha): funcionamento, ânodo, cátodo, ponte salina',
          'Potencial de eletrodo (E°) e tabela de potenciais-padrão',
          'Cálculo da diferença de potencial (ddp, ΔE°)',
          'Equação de Nernst: E = E° - (RT/nF) ln Q',
          'Eletrólise ígnea e aquosa: funcionamento, produtos',
          'Leis de Faraday: relação carga-quantidade de substância',
          'Pilhas comerciais: pilha seca, pilha de Daniell, bateria chumbo-ácido',
          'Corrosão e proteção catódica'
        ]
      },
      {
        nome: 'Técnicas de Laboratório',
        exercicios_sugeridos: 3,
        topicos: [
          'Destilação simples e fracionada (separação líquido-líquido)',
          'Extração líquido-líquido (funil de separação) e sólido-líquido (Soxhlet)',
          'Filtração simples (gravidade) e a vácuo (Büchner)',
          'Decantação, centrifugação e sifonação',
          'Gravimetria: técnicas de precipitação, filtração e calcinação',
          'Secagem em estufa e dessecador, calcinação em mufla',
          'Pesagem: balança analítica, cuidados, precisão',
          'Vidrarias volumétricas: bureta, pipeta, balão volumétrico, proveta',
          'Preparo de soluções e diluições seriadas'
        ]
      },
      {
        nome: 'Titulometria',
        exercicios_sugeridos: 4,
        topicos: [
          'Volumetria de neutralização (ácido-base): princípios, ponto de equivalência',
          'Volumetria de precipitação: argentometria (Mohr, Volhard, Fajans)',
          'Volumetria de complexação: EDTA, indicadores metalocrômicos',
          'Volumetria de oxirredução (redox): permanganometria, iodometria, dicromatometria',
          'Indicadores ácido-base: fenolftaleína, azul de bromotimol, alaranjado de metila',
          'Indicadores redox: amido, ferroína',
          'Curvas de titulação: pH vs volume, ponto de viragem',
          'Cálculos titulométricos: n₁ = n₂, M₁V₁ = M₂V₂, fator de correção',
          'Padrões primários e secundários',
          'Erros em titulação: erro de indicador, erro de titulação'
        ]
      },
      {
        nome: 'Análise Instrumental (menor incidência)',
        exercicios_sugeridos: 2,
        topicos: [
          'Espectrometria no Infravermelho (IV): grupos funcionais, bandas características',
          'Espectrometria UV-Vis: Lei de Beer-Lambert (A = εbc), absorção molecular',
          'Cromatografia líquida de alta eficiência (HPLC)',
          'Cromatografia gasosa (GC): detectores, colunas',
          'Potenciometria e eletrodo de pH (vidro)',
          'Condutometria: condutividade iônica, titulações condutométricas',
          'Espectrometria de absorção atômica',
          'Fluorescência de raios X (FRX)'
        ]
      },
      {
        nome: 'Física-Química',
        exercicios_sugeridos: 3,
        topicos: [
          'Estados da matéria: sólido, líquido, gasoso, plasma',
          'Leis dos gases: Boyle (P₁V₁ = P₂V₂), Charles (V₁/T₁ = V₂/T₂), Gay-Lussac (P₁/T₁ = P₂/T₂)',
          'Equação dos Gases Ideais: PV = nRT',
          'Transformações: isotérmica, isobárica, isocórica, adiabática',
          'Pressão de vapor e ponto de ebulição: relação com forças intermoleculares',
          'Tensão superficial, capilaridade e viscosidade de fluidos',
          'Difusão e efusão de gases: Lei de Graham',
          'Termodinâmica: 1ª Lei (ΔU = Q - W), 2ª Lei (entropia), função de estado',
          'Entropia (S) e Energia Livre de Gibbs (ΔG = ΔH - TΔS)',
          'Espontaneidade de processos: ΔG < 0 (espontâneo)',
          'Diagramas de fase: ponto triplo, ponto crítico, curva de equilíbrio'
        ]
      },
      {
        nome: 'Química Analítica Avançada',
        exercicios_sugeridos: 2,
        topicos: [
          'Análise qualitativa de cátions: grupos I a V (marcha analítica)',
          'Análise qualitativa de ânions: identificação por precipitação',
          'Marcha analítica clássica: separação e identificação sistemática',
          'Determinação de concentrações por espectrofotometria (curva de calibração)',
          'Gravimetria: cálculos de fator gravimétrico, precipitação e calcinação',
          'Análise volumétrica: normalidade e equivalência (N₁V₁ = N₂V₂)',
          'Padronização de soluções: padrões primários e secundários',
          'Erros em análise química: sistemáticos (determinados) e aleatórios (indeterminados)',
          'Tratamento estatístico de dados: média, desvio padrão, intervalo de confiança',
          'Critérios de rejeição de dados: teste Q de Dixon, teste Grubbs'
        ]
      },
      {
        nome: 'Mecanismo de Reações e Cinética Avançada',
        exercicios_sugeridos: 1,
        topicos: [
          'Reações elementares e molecularidade (uni, bi, trimolecular)',
          'Intermediários de reação: carbocátions, carboânions, radicais livres',
          'Estado de transição e complexo ativado: teoria do estado de transição',
          'Energia de ativação (Ea) e equação de Arrhenius detalhada',
          'Catalisadores homogêneos e heterogêneos: mecanismo de ação',
          'Autocatálise e inibição enzimática',
          'Cinética de reações de ordem zero, 1ª ordem e 2ª ordem',
          'Tempo de meia-vida (t½) e dependência da ordem de reação',
          'Métodos de determinação da ordem: diferenciais, integrais, meia-vida',
          'Influência da temperatura: parâmetros de Arrhenius (fator pré-exponencial, Ea)'
        ]
      }
     ]
   },
   {
     id: 'processospetroleo',
     nome: '🛢️ Processos de Petróleo',
     icone: '🛢️',
     cor: '#000000',
     questoes: 8,
     grupos: [
     {
         nome: 'Exploração e Produção',
         exercicios_sugeridos: 2,
         topicos: [
           'Prospecção: métodos sísmicos (reflexão/refração) e gravimétricos',
           'Exploração: poços exploratórios e poços delimitadores',
           'Produção: poços produtores, métodos de elevação (gas lift, BCS)',
           'Perfuração: sistemas de circulação, fluidos de perfuração, cimentação',
           'Testes de formação: perfis elétricos, testemunhagem',
           'Avaliação de reservatórios: porosidade, permeabilidade, saturação de fluidos',
           'Pré-sal: camadas geológicas, desafios tecnológicos',
           'Elevação artificial: bombas centrífugas submersas (BCS), bombeio mecânico'
         ]
       },
       {
         nome: 'Processamento Primário',
         exercicios_sugeridos: 2,
         topicos: [
           'Separação gás-óleo-água (GOSP): vasos separadores bifásicos e trifásicos',
           'Redução de pressão e temperatura: válvulas choke, trocadores de calor',
           'Desidratação de óleo cru: métodos térmicos, químicos, eletrostáticos',
           'Tratamento de emulsões: rompimento, desemulsificantes',
           'Remoção de sais e corrosivos: dessalgação eletrostática',
           'Centrifugação e decantação: separação de fases sólida-líquida',
           'Sistemas de flare e alívio de pressão'
         ]
       },
       {
         nome: 'Refino - Operações Básicas',
         exercicios_sugeridos: 2,
         topicos: [
           'Destilação atmosférica: torre de fracionamento, pratos, refluxo',
           'Destilação a vácuo: separação de frações pesadas',
           'Viscorredução (visbreaking): redução de viscosidade de resíduos',
           'Destilação flash multiestágios',
           'Fracionamento de colunas: topo, laterais, fundo',
           'Recuperação de gases leves: GLP, propano, butano',
           'Unidades de Destilação Atmosférica e a Vácuo (UDA/UDV)'
         ]
       },
       {
         nome: 'Refino - Conversão',
         exercicios_sugeridos: 2,
         topicos: [
           'Craqueamento catalítico fluidizado (FCC): leito fluidizado, catalisador zeolítico',
           'Hidrocraqueamento (HCK): hidrogênio + catalisador, conversão de frações pesadas',
           'Reforma catalítica: produção de gasolina de alta octanagem, reformado',
           'Isomerização: conversão de n-parafinas em isoparafinas',
           'Alquilação: produção de alquilato para gasolina',
           'Coqueamento retardado: produção de coque de petróleo',
           'Conversão de resíduos pesados (bottom of the barrel)'
         ]
       },
       {
         nome: 'Refino - Tratamento',
         exercicios_sugeridos: 2,
         topicos: [
           'Dessulfurização: processos HDS (hidrodessulfurização) de diesel, gasolina, jet fuel',
           'Hidrotratamento (HDT): frações leves (nafta, GLP) e médias (querosene, diesel)',
           'Remoção de nitrogênio (HDN) e oxigênio (HDO)',
           'Remoção de metais: níquel, vanádio (demetalização)',
           'Remoção de aromáticos: hidrogenação de aromáticos',
           'Sweetening de naftas: conversão de mercaptanas (processo Merox)',
           'Tratamento de água ácida (Sour Water Stripping)'
         ]
       },
       {
         nome: 'Blend de Produtos',
         exercicios_sugeridos: 1,
         topicos: [
           'Gasolina: octanagem (MON, RON, IAD), volatilidade, pressão de vapor Reid',
           'Diesel: índice de cetano, ponto de névoa, ponto de fluidez, lubricidade',
           'Querosene de aviação: ponto de congelamento, destilação, ponto de fulgor',
           'Óleo combustível: viscosidade, teor de enxofre, ponto de fluidez',
           'Lubrificantes: viscosidade (SAE), índice de viscosidade, base mineral/sintética',
           'Aditivos: antioxidantes, anticorrosivos, detergentes dispersantes, melhoradores de cetano',
           'GLP: composição, pressão de vapor, odorização'
         ]
       },
       {
         nome: 'Logística e Armazenamento',
         exercicios_sugeridos: 1,
         topicos: [
           'Tanques de armazenamento: teto fixo, teto flutuante, dimensionamento',
           'Emulsões e breaking de emulsões durante armazenagem',
           'Estabilidade de produtos: degradação, sedimentação, contaminação cruzada',
           'Movimentação de produtos: dutos (oleodutos, gasodutos), navios-tanque, caminhões',
           'Monitoramento de qualidade: amostragem em tanques e dutos (ASTM D4057)',
           'Segregação de produtos por especificação e compatibilidade',
           'Sistemas de medição fiscal e transferência de custódia'
         ]
       }
     ]
   },
   {
     id: 'segurancaaambiente',
     nome: '🔐 Segurança, Saúde e Ambiente (SSH)',
     icone: '🔐',
     cor: '#D32F2F',
     questoes: 7,
     grupos: [
      {
         nome: 'Legislação de SSH',
         exercicios_sugeridos: 2,
         topicos: [
           'NR 1 — Disposições Gerais e Gerenciamento de SSH (PGR, GRO)',
           'NR 6 — Equipamento de Proteção Individual (EPI): CA, responsabilidades',
           'NR 7 — Programa de Controle Médico de Saúde Ocupacional (PCMSO)',
           'NR 9 — Programa de Prevenção de Riscos Ambientais (PPRA → PGR)',
           'NR 15 — Atividades e Operações Insalubres: limites de tolerância',
           'NR 16 — Atividades e Operações Perigosas: adicional de periculosidade',
           'NR 20 — Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis',
           'NR 33 — Espaço Confinado',
           'NR 35 — Trabalho em Altura',
           'Legislação ambiental: Lei 6.938/81 (PNMA), Resoluções CONAMA',
           'Lei de Crimes Ambientais (Lei 9.605/98)'
         ]
       },
       {
         nome: 'Identificação de Riscos',
         exercicios_sugeridos: 2,
         topicos: [
           'Matriz de risco: probabilidade × severidade × exposição',
           'Riscos físicos: ruído, vibração, radiação ionizante e não ionizante, temperatura',
           'Riscos químicos: classificação GHS, FISPQ, toxicidade, limite de exposição',
           'Riscos biológicos: microorganismos, contaminantes, vias de entrada',
           'Riscos ergonômicos: posturas inadequadas, esforço repetitivo, levantamento de carga',
           'Riscos mecânicos e de acidentes',
           'Análise Preliminar de Riscos (APR) e Análise de Perigos (HAZOP)',
           'Mapa de riscos: cores e representação gráfica'
         ]
       },
       {
         nome: 'Controle e Mitigação',
         exercicios_sugeridos: 2,
         topicos: [
           'Hierarquia de controles: eliminação, substituição, engenharia, administrativo, EPI',
           'Ventilação industrial: natural, mecânica, diluidora, exaustão local',
           'Isolamento de fontes de perigo: enclausuramento, barreiras',
           'Sistemas de intertravamento de segurança (safety interlocks)',
           'Sistemas de alarme e procedimentos de emergência',
           'Manutenção preventiva, preditiva e corretiva',
           'Permissão de Trabalho (PTW): procedimentos e responsabilidades',
           'Bloqueio e etiquetagem (LOTO - Lockout/Tagout)'
         ]
       },
       {
         nome: 'Saúde Ocupacional',
         exercicios_sugeridos: 1,
         topicos: [
           'Conceitos de saúde ocupacional e vigilância à saúde do trabalhador',
           'Doenças ocupacionais: causalidade, latência, irreversibilidade',
           'LER/DORT: Lesões por Esforços Repetitivos',
           'Lombalgias relacionadas ao trabalho e ergonomia',
           'Perda Auditiva Induzida por Ruído (PAIR)',
           'Pneumoconioses: silicose, asbestose, talcose',
           'Dermatites de contato ocupacional: irritante primária, alérgica',
           'Exposição ao benzeno: efeitos hematológicos (leucemia)',
           'Vigilância biológica: indicadores biológicos de exposição (IBEs)',
           'Exames ocupacionais: admissional, periódico, demissional'
         ]
       },
       {
         nome: 'Impactos Ambientais e Controle',
         exercicios_sugeridos: 2,
         topicos: [
           'Emissões atmosféricas: CO₂, NOx, SOx, material particulado, VOCs',
           'Efeito estufa e mudanças climáticas: gases de efeito estufa (GEE)',
           'Poluição aquática: efluentes oleosos, drenagem ácida de minas',
           'Resíduos sólidos: classificação (ABNT NBR 10.004), tratamento, disposição',
           'Remediação de solos contaminados: biorremediação, atenuação natural',
           'Efluentes: tratamento primário (físico), secundário (biológico), terciário (químico)',
           'Gestão de resíduos perigosos: classe I, logística reversa, coprocessamento',
           'Licenciamento ambiental: licença prévia (LP), instalação (LI), operação (LO)'
         ]
       },
       {
         nome: 'Sistemas de Gestão SSH',
         exercicios_sugeridos: 1,
         topicos: [
           'ISO 45001:2018 — Sistema de Gestão de SSO (requisitos, PDCA, contexto)',
           'ISO 14001:2015 — Sistema de Gestão Ambiental (aspectos, impactos, requisitos legais)',
           'Auditorias internas e externas: programação, checklist, não-conformidades',
           'Programa de treinamento e conscientização: DDS, SIPAT, brigada',
           'Investigação de acidentes: metodologia (árvore de causas, 5 porquês)',
           'Indicadores de desempenho: taxa de frequência (TF), taxa de gravidade (TG)',
           'Análise Crítica de SSO: revisão pela alta direção',
           'Melhoria contínua: ciclo PDCA, ações corretivas e preventivas (CAPA)'
         ]
       },
       {
         nome: 'Resposta a Emergências',
         exercicios_sugeridos: 1,
         topicos: [
           'Plano de Ação de Emergência (PAE): estrutura, comunicações, recursos',
           'Brigada de emergência: composição, treinamento, simulações',
           'Primeiros socorros: RCP, hemorragias, fraturas, queimaduras, intoxicações',
           'Eventos críticos: vazamentos de produtos químicos, incêndios, explosões',
           'Plano de contingência para desastres ambientais: derramamento de óleo',
           'Comunicação de crise: órgãos reguladores (IBAMA, ANP), imprensa, comunidade',
           'Pós-emergência: investigação, lições aprendidas, revisão de procedimentos',
           'Simulados de emergência: periodicidade, cenários, avaliação'
         ]
       }
     ]
   },
   {
     id: 'metrologiacontrole',
     nome: '⚖️ Metrologia e Controle de Qualidade',
     icone: '⚖️',
     cor: '#1976D2',
     questoes: 6,
     grupos: [
      {
         nome: 'Fundamentos de Metrologia',
         exercicios_sugeridos: 2,
         topicos: [
           'Sistema Internacional de Unidades (SI): 7 unidades básicas e derivadas',
           'Padrões primários, secundários e de trabalho: hierarquia metrológica',
           'Rastreabilidade metrológica: cadeia ininterrupta de comparações',
           'Certificados de calibração: leitura, interpretação, limites',
           'Incerteza de medição: avaliação Tipo A (estatística) e Tipo B (outros métodos)',
           'Expressão de incerteza: distribuição normal, fator de abrangência k=2 (95%)',
           'Vocabulário Internacional de Metrologia (VIM)',
           'Algarismos significativos e arredondamento'
         ]
       },
       {
         nome: 'Instrumentação Analítica',
         exercicios_sugeridos: 2,
         topicos: [
           'Calibração de equipamentos volumétricos: bureta, pipeta, balão volumétrico, proveta',
           'Balanças analíticas: tipos (torsão, digital), sensibilidade, ajuste, nível',
           'Espectrofotômetro UV-Vis: calibração de comprimento de onda (padrões holmium)',
           'Espectrofotômetro UV-Vis: calibração de absorbância (filtros neutros)',
           'pHmetro: calibração em 2 ou 3 pontos com tampões (pH 4,0; 7,0; 10,0)',
           'Condutivímetro: calibração com padrões de condutividade (KCl)',
           'Termômetros: calibração com pontos fixos (gelo fundente, água em ebulição)',
           'Manutenção e conservação de eletrodos de pH',
           'Cubetas espectrofotométricas: tipos, caminho óptico, limpeza'
         ]
       },
       {
         nome: 'Controle de Qualidade em Processo',
         exercicios_sugeridos: 2,
         topicos: [
           'Amostragem: planos de amostragem (lote a lote, contínua), tamanho da amostra',
           'Cartas de controle: X-R (média e amplitude), X-s (média e desvio), I-MR (individual)',
           'Cartas de controle por atributos: p (fração defeituosa), c (número de defeitos)',
           'Capacidade do processo: Cp, Cpk, Pp, Ppk (índices e interpretação)',
           'Limites de controle vs limites de especificação',
           'Padrões de comportamento: zonas de Warning, pontos fora de controle, tendências',
           'Testes de hipótese: ANOVA um fator, t-test (amostras independentes e pareadas)',
           'Teste qui-quadrado (χ²): aderência e independência'
         ]
       },
       {
         nome: 'Garantia de Qualidade (QA)',
         exercicios_sugeridos: 1,
         topicos: [
           'Boas Práticas de Laboratório (BPL): organização, registros, segurança',
           'Validação de métodos analíticos: exatidão, precisão, seletividade, sensibilidade',
           'Linearidade, faixa de trabalho, limite de detecção (LOD) e quantificação (LOQ)',
           'Padrões de referência certificados (CRM): rastreabilidade, certificação',
           'Reagentes: grau de pureza (PA, HPLC, espectroscópico), estabilidade, prazo',
           'Documentação: POPs, rastreabilidade de amostras, arquivos, controle de versões',
           'Testes interlaboratoriais e proficiência',
           'Garantia da qualidade em laboratórios de calibração e ensaios'
         ]
       },
       {
         nome: 'Estatística aplicada à Qualidade',
         exercicios_sugeridos: 1,
         topicos: [
           'Distribuições de probabilidade: normal (Gauss), t-Student, qui-quadrado (χ²), F de Snedecor',
           'Intervalos de confiança para média e proporção (nível 95%)',
           'Teste de normalidade: Shapiro-Wilk, Anderson-Darling, Kolmogorov-Smirnov',
           'Teste de homocedasticidade (igualdade de variâncias): Levene, Bartlett, F-test',
           'ANOVA um fator e multifatorial: hipóteses, tabela, interpretação',
           'Correlação de Pearson (r) e correlação de Spearman',
           'Regressão linear simples e múltipla: coeficientes, R², resíduos'
         ]
       },
       {
         nome: 'Sistemas de Qualidade (ISO)',
         exercicios_sugeridos: 1,
         topicos: [
           'ISO/IEC 17025:2017 — Requisitos para laboratórios de calibração e ensaios',
           'ISO 9001:2015 — Sistema de Gestão da Qualidade: requisitos, abordagem de processos',
           'ISO 13849-1 — Segurança de máquinas: categorias de segurança',
           'NBR ISO 10012 — Sistema de Gestão de Medição',
           'Auditoria interna: programação, checklist, não-conformidades, relatório',
           'Ações corretivas e preventivas (CAPA): identificação de causa raiz, eficácia',
           'Gestão de documentos: controle de versões, aprovação, distribuição, arquivamento',
           'Indicadores de qualidade: OKR, metas, balanced scorecard'
        ]
       }
    ]
  }
];

export const SEMANAS_PLANO = 12;
export const META_HORAS_SEMANA = 30;
export const META_HORAS_DIA = 6;

export const CICLO_ESTUDOS = [
  { materia: 'Português', icone: '📝', tempo: 80, peso: 4 },
  { materia: 'Química — Soluções + Inorgânica', icone: '🧪', tempo: 90, peso: 4 },
  { materia: 'Matemática', icone: '🔢', tempo: 70, peso: 3 },
  { materia: 'Química — Equilíbrio + pH', icone: '🧪', tempo: 60, peso: 2 },
  { materia: 'Química — Orgânica', icone: '🧪', tempo: 60, peso: 2 },
  { materia: 'Química — Cinética + Termo + Eletro', icone: '🧪', tempo: 60, peso: 3 },
  { materia: 'Química — Substâncias/Propriedades', icone: '🧪', tempo: 40, peso: 1 },
  { materia: 'Química — Técnicas + Titulometria', icone: '🧪', tempo: 60, peso: 2 },
  { materia: 'Química — Transformações + Estequiometria', icone: '🧪', tempo: 80, peso: 3 }
];

// Mapeia nome do ciclo para ID de CONTEUDOS (mesmo usado em Diario.vue)
export const CICLO_MAP = {
  'português': 'portugues',
  'matemática': 'matematica',
  'química': 'quimica',
  'petróleo': 'processospetroleo',
  'segurança': 'segurancaaambiente',
  'metrologia': 'metrologiacontrole'
};

export function mapCicloParaMateriaId(nomeMateria) {
  const nome = nomeMateria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const match = Object.keys(CICLO_MAP).find(k => nome.includes(k));
  return CICLO_MAP[match] || 'quimica';
}

export const DIAS_SEMANA = [
  { valor: 'seg', rotulo: 'Segunda' },
  { valor: 'ter', rotulo: 'Terça' },
  { valor: 'qua', rotulo: 'Quarta' },
  { valor: 'qui', rotulo: 'Quinta' },
  { valor: 'sex', rotulo: 'Sexta' },
  { valor: 'sab', rotulo: 'Sábado' },
  { valor: 'dom', rotulo: 'Domingo' }
];

export const REVISAO_INTERVALOS = [
  { id: 'd1', rotulo: 'D+1 (24h)', dias: 1 },
  { id: 'd7', rotulo: 'D+7 (1 sem)', dias: 7 },
  { id: 'd30', rotulo: 'D+30 (1 mês)', dias: 30 }
];

export const CHECKLIST_ITENS = [
    { id: 'revisoes', texto: 'Fiz as revisões espaçadas do dia' },
    { id: 'ciclo', texto: 'Estudei a matéria do ciclo' },
    { id: 'questoes', texto: 'Resolvi um bloco de questões' },
    { id: 'erros', texto: 'Analisei e registrei os erros' },
];
