const CONTEUDOS = [
  {
    id: 'portugues',
    nome: 'Língua Portuguesa',
    icone: '📝',
    cor: '#4CAF50',
    questoes: 10,
    grupos: [
      {
        nome: 'Interpretação de Textos',
        topicos: [
          'Compreensão global do texto',
          'Significação contextual de palavras e expressões',
          'Tipologia textual (narração, descrição, dissertação)',
          'Ideia principal e ideias secundárias',
          'Inferência e pressuposição',
          'Recursos expressivos e figuras de linguagem'
        ]
      },
      {
        nome: 'Ortografia e Acentuação',
        topicos: [
          'Emprego das letras (h, s, z, x, ch)',
          'Acentuação gráfica (regras)',
          'Emprego do hífen'
        ]
      },
      {
        nome: 'Morfologia',
        topicos: [
          'Substantivo, adjetivo, artigo, numeral',
          'Verbo: regulares, irregulares, tempos, modos, vozes',
          'Pronome: emprego, colocação, formas de tratamento',
          'Conjunção, preposição, advérbio',
          'Uso de "porque", "por que", "por quê", "porquê"',
          'Uso de "se" e "que"'
        ]
      },
      {
        nome: 'Sintaxe',
        topicos: [
          'Concordância verbal e nominal',
          'Regência verbal e nominal',
          'Crase',
          'Verbos impessoais',
          'Indeterminação do sujeito',
          'Voz passiva pronominal',
          'Pronomes relativos',
          'Emprego de "há" e "a"'
        ]
      },
      {
        nome: 'Pontuação',
        topicos: [
          'Vírgula',
          'Ponto e vírgula',
          'Dois-pontos',
          'Aspas, parênteses, travessão'
        ]
      },
      {
        nome: 'Reescritura e Problemas da Língua',
        topicos: [
          'Reescritura de frases e parágrafos',
          'Problemas da língua culta',
          'Estrutura e formação de palavras'
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
        topicos: [
          'Função afim (1º grau)',
          'Função quadrática (2º grau)',
          'Função exponencial',
          'Função logarítmica',
          'Funções trigonométricas (seno, cosseno, tangente)'
        ]
      },
      {
        nome: 'Geometria',
        topicos: [
          'Geometria Plana: triângulos, quadriláteros, círculo',
          'Geometria Espacial: cubo, paralelepípedo, cilindro, cone, esfera',
          'Geometria Analítica: equação da reta, circunferência'
        ]
      },
      {
        nome: 'Análise Combinatória e Probabilidade',
        topicos: [
          'Princípio fundamental da contagem',
          'Permutação, arranjo, combinação',
          'Probabilidade'
        ]
      },
      {
        nome: 'Progressões',
        topicos: [
          'Progressão Aritmética (PA)',
          'Progressão Geométrica (PG)'
        ]
      },
      {
        nome: 'Matrizes e Sistemas',
        topicos: [
          'Operações com matrizes',
          'Determinantes',
          'Sistemas lineares'
        ]
      },
      {
        nome: 'Aritmética e Problemas',
        topicos: [
          'Conjuntos numéricos (N, Z, Q, R)',
          'Regra de três',
          'Porcentagem',
          'Raciocínio lógico'
        ]
      },
      {
        nome: 'Matemática Financeira (0-1q)',
        topicos: [
          'Juros simples e compostos',
          'Montante e descontos'
        ]
      },
      {
        nome: 'Estatística (0-1q)',
        topicos: [
          'Média, mediana, moda',
          'Desvio padrão e variância',
          'Gráficos e interpretação'
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
        topicos: [
          'Modelos atômicos (Dalton, Thomson, Rutherford, Bohr)',
          'Números quânticos e distribuição eletrônica',
          'Tabela periódica: períodos e grupos',
          'Propriedades periódicas (raio, EI, afinidade, eletronegatividade)',
          'Ligações: iônica, covalente, metálica',
          'Geometria molecular (VSEPR)',
          'Polaridade e forças intermoleculares'
        ]
      },
      {
        nome: 'Funções Inorgânicas',
        topicos: [
          'Ácidos: identificação, nomenclatura, força',
          'Bases: identificação, nomenclatura, força',
          'Sais: identificação, nomenclatura, obtenção',
          'Óxidos: classificação (ácido, básico, anfótero, neutro)',
          'Hidretos'
        ]
      },
      {
        nome: 'Reações Inorgânicas',
        topicos: [
          'Balanceamento de equações',
          'NOX e reações de oxirredução (redox)',
          'Reações de síntese, decomposição, simples e dupla troca',
          'Reações de neutralização'
        ]
      },
      {
        nome: 'Estequiometria',
        topicos: [
          'Massa atômica, molecular, mol, Constante de Avogadro',
          'Leis ponderais (Lavoisier, Proust)',
          'Cálculos estequiométricos',
          'Reagente limitante e excesso',
          'Rendimento e pureza'
        ]
      },
      {
        nome: 'Soluções',
        topicos: [
          'Concentração comum',
          'Molaridade (concentração molar)',
          'Molalidade',
          'Título e porcentagem',
          'ppm (partes por milhão)',
          'Fração molar',
          'Diluição (C1V1 = C2V2)',
          'Mistura de soluções',
          'Solubilidade e Kps',
          'Propriedades coligativas',
          'Coloides: classificação e propriedades'
        ]
      },
      {
        nome: 'Química Orgânica - Nomenclatura',
        topicos: [
          'Cadeias carbônicas (classificação)',
          'Hidrocarbonetos: alcanos, alcenos, alcinos, alcadienos',
          'Hidrocarbonetos aromáticos',
          'Petróleo: composição, refino, frações',
          'Funções oxigenadas: álcool, fenol, éter, aldeído, cetona, ácido, éster',
          'Funções nitrogenadas: amina, amida, nitrocomposto',
          'Haletos orgânicos',
          'Nomenclatura IUPAC'
        ]
      },
      {
        nome: 'Química Orgânica - Reações',
        topicos: [
          'Reações de adição (alcenos e alcinos)',
          'Reações de oxidação (álcool > aldeído/cetona/ácido)',
          'Reações de esterificação',
          'Polimerização (adição e condensação)',
          'Substituição em aromáticos'
        ]
      },
      {
        nome: 'Química Orgânica - Isomeria',
        topicos: [
          'Isomeria plana (função, cadeia, posição, metameria, tautomeria)',
          'Isomeria geométrica (cis-trans)'
        ]
      },
      {
        nome: 'Equilíbrio Químico',
        topicos: [
          'Constante de equilíbrio (Kc e Kp)',
          'Princípio de Le Chatelier',
          'Deslocamento de equilíbrio',
          'Equilíbrio iônico',
          'pH e pOH (cálculo e escala)',
          'Hidrólise de sais',
          'Solução-tampão',
          'Produto de solubilidade (Kps)'
        ]
      },
      {
        nome: 'Cinética Química',
        topicos: [
          'Velocidade das reações',
          'Fatores que afetam a velocidade',
          'Lei da velocidade',
          'Ordem de reação',
          'Energia de ativação',
          'Mecanismos de reação'
        ]
      },
      {
        nome: 'Termoquímica',
        topicos: [
          'Entalpia e variação de entalpia (ΔH)',
          'Reações exotérmicas e endotérmicas',
          'Lei de Hess',
          'Entalpia de formação, combustão, ligação'
        ]
      },
      {
        nome: 'Eletroquímica',
        topicos: [
          'Célula galvânica (pilha)',
          'Potencial de eletrodo e DDP',
          'Equação de Nernst',
          'Eletrólise ígnea e aquosa',
          'Leis de Faraday'
        ]
      },
      {
        nome: 'Técnicas de Laboratório',
        topicos: [
          'Destilação simples e fracionada',
          'Extração líquido-líquido e sólido-líquido',
          'Filtração simples e a vácuo',
          'Decantação e centrifugação',
          'Gravimetria',
          'Secagem e calcinação'
        ]
      },
      {
        nome: 'Titulometria',
        topicos: [
          'Volumetria de neutralização (ácido-base)',
          'Volumetria de precipitação',
          'Volumetria de complexação',
          'Volumetria de oxirredução (redox)',
          'Indicadores ácido-base e redox',
          'Curvas de titulação',
          'Cálculos titulométricos'
        ]
      },
      {
        nome: 'Análise Instrumental (menor incidência)',
        topicos: [
          'Espectrometria no Infravermelho (IV)',
          'Espectrometria UV-Vis (Lei de Beer-Lambert)',
          'Cromatografia líquida (HPLC)',
          'Cromatografia gasosa (CG)',
          'Potenciometria e pHmetro',
          'Condutometria'
        ]
      }
    ]
  }
];

const SEMANAS_PLANO = 12;
const META_HORAS_SEMANA = 30;

const CICLO_ESTUDOS = [
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

const DIAS_SEMANA = [
  { valor: 'seg', rotulo: 'Segunda' },
  { valor: 'ter', rotulo: 'Terça' },
  { valor: 'qua', rotulo: 'Quarta' },
  { valor: 'qui', rotulo: 'Quinta' },
  { valor: 'sex', rotulo: 'Sexta' },
  { valor: 'sab', rotulo: 'Sábado' },
  { valor: 'dom', rotulo: 'Domingo' }
];

const REVISAO_INTERVALOS = [
  { id: 'd1', rotulo: 'D+1 (24h)', dias: 1 },
  { id: 'd7', rotulo: 'D+7 (1 sem)', dias: 7 },
  { id: 'd30', rotulo: 'D+30 (1 mês)', dias: 30 }
];
