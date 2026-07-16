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
          'Hidretos',
          'Reações de formação de ácidos e bases',
          'Ácidos e bases fortes vs fracos',
          'Neutralização e titulação ácido-base'
        ]
      },
      {
        nome: 'Reações Inorgânicas',
        topicos: [
          'Balanceamento de equações',
          'NOX e reações de oxirredução (redox)',
          'Reações de síntese, decomposição, simples e dupla troca',
          'Reações de neutralização',
          'Reações de precipitação e dissolução',
          'Reações em meio ácido e básico',
          'Agentes oxidantes e redutores comuns',
          'Cálculo de NOX em compostos complexos'
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
      },
      {
        nome: 'Física-Química',
        topicos: [
          'Estados da matéria: sólido, líquido, gasoso, plasma',
          'Leis dos gases: Boyle, Charles, Gay-Lussac, Lei dos Gases Ideais',
          'Transformações isotérmicas, isobáricas, isocóricas e adiabáticas',
          'Pressão de vapor e ponto de ebulição',
          'Tensão superficial e capilaridade',
          'Viscosidade de fluidos',
          'Difusão e efusão de gases',
          'Termodinâmica: primeira lei, segunda lei, função de estado',
          'Entropia e energia livre de Gibbs',
          'Espontaneidade de processos',
          'Transformações de fase e diagramas de fase',
          'Pontos de fusão, ebulição e transição'
        ]
      },
      {
        nome: 'Química Analítica Avançada',
        topicos: [
          'Análise qualitativa de cátions em solução',
          'Análise qualitativa de ânions',
          'Marcha analítica clássica',
          'Determinação de concentrações por espectrofotometria',
          'Gravimetria: cálculos e técnicas de precipitação',
          'Análise volumétrica: normalidade e equivalência',
          'Padronização de soluções',
          'Erros em análise química: sistemáticos e aleatórios',
          'Tratamento de dados: média, desvio padrão, confiabilidade',
          'Detecção de erros: critério de rejeição de dados'
        ]
      },
      {
        nome: 'Mecanismo de Reações e Cinética Avançada',
        topicos: [
          'Reações elementares e molecularidade',
          'Intermediários de reação',
          'Estado de transição e complexo ativado',
          'Energia de ativação e teoria do complexo ativado',
          'Catalisadores homogêneos e heterogêneos',
          'Autocatálise e inibição',
          'Cinética de reações de primeira, segunda e ordem zero',
          'Tempo de meia-vida e sua dependência da ordem',
          'Métodos de determinação da ordem de reação',
          'Influência de temperatura: equação de Arrhenius'
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
        topicos: [
          'Prospecção: métodos sísmicos e gravimétricos',
          'Exploração: poços exploratórios e delimitadores',
          'Produção: poços produtores e métodos de extração',
          'Perfuração: sistemas de circulação e fluidos de perfuração',
          'Testes de formação e avaliação de reservatórios',
          'Reservatórios: características, porosidade, permeabilidade, saturação'
        ]
      },
      {
        nome: 'Processamento Primário',
        topicos: [
          'Separação gás-óleo-água (GOSP)',
          'Redução de pressão e temperatura',
          'Desidratação de óleo cru',
          'Tratamento de emulsões',
          'Remoção de sais e corrosivos',
          'Centrifugação e decantação'
        ]
      },
      {
        nome: 'Refino - Operações Básicas',
        topicos: [
          'Destilação atmosférica',
          'Destilação a vácuo',
          'Viscorredução (visbreaking)',
          'Destilação flash multiestágios',
          'Fraccionamento de colunas',
          'Recuperação de gases leves'
        ]
      },
      {
        nome: 'Refino - Conversão',
        topicos: [
          'Craqueamento catalítico fluidizado (FCC)',
          'Hidrocraquejamento (HCK)',
          'Reforma catalítica',
          'Isomerização',
          'Alquilação',
          'Conversão de heavy oils'
        ]
      },
      {
        nome: 'Refino - Tratamento',
        topicos: [
          'Desulfurização: dessulfurização a vácuo (VDS), jet fuel, diesel, gasolina',
          'Hidrotratamento de frações leves',
          'Remoção de nitrogênio',
          'Remoção de metais (níquel, vanádio)',
          'Remoção de aromáticos',
          'Sweetening de naftas'
        ]
      },
      {
        nome: 'Blend de Produtos',
        topicos: [
          'Gasolina: octanagem, volatilidade, aditivos',
          'Diesel: índice de cetano, propriedades a baixa temperatura',
          'Querosene: ponto de congelação e destilação',
          'Óleo combustível: viscosidade, teor de enxofre',
          'Lubrificantes: viscosidade, índice de viscosidade',
          'Aditivos: antioxidantes, anticorrosivos, detergentes'
        ]
      },
      {
        nome: 'Logística e Armazenamento',
        topicos: [
          'Tanques de armazenamento: tipos e dimensionamento',
          'Emulsões e breaking de emulsões',
          'Estabilidade de produtos durante armazenagem',
          'Movimentação de produtos: dutos, navios-tanque, caminhões',
          'Monitoramento de qualidade em transferência',
          'Segregação de produtos'
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
        topicos: [
          'NR 1 — Disposições Gerais e Gerenciamento de SSH',
          'NR 6 — Equipamento de Proteção Individual (EPI)',
          'NR 7 — Programa de Controle Médico de Saúde Ocupacional (PCMSO)',
          'NR 9 — Programa de Prevenção de Riscos Ambientais (PPRA)',
          'NR 15 — Atividades e Operações Insalubres',
          'NR 16 — Atividades e Operações Perigosas',
          'NR 35 — Trabalho em Altura',
          'Legislação ambiental: Lei 6938/81, Resolução CONAMA'
        ]
      },
      {
        nome: 'Identificação de Riscos',
        topicos: [
          'Matriz de risco: probabilidade, severidade, exposição',
          'Riscos físicos: ruído, vibração, radiação, temperatura',
          'Riscos químicos: classificação de substâncias perigosas',
          'Riscos biológicos: microorganismos, contaminantes',
          'Riscos ergonômicos: posturas inadequadas, esforço repetitivo',
          'Acidentes: causas diretas, causas raiz, eventos desencadeantes'
        ]
      },
      {
        nome: 'Controle e Mitigação',
        topicos: [
          'Hierarquia de controle: eliminação, substituição, engenharia, administrativo, EPI',
          'Ventilação de ambientes: natural, mecânica, diluidora, local',
          'Isolamento de fontes de perigo',
          'Sistemas de intertravamento de segurança',
          'Alarm systems e procedimentos de emergência',
          'Manutenção preventiva e corretiva'
        ]
      },
      {
        nome: 'Saúde Ocupacional',
        topicos: [
          'Conceitos de saúde ocupacional e vigilância à saúde',
          'Doenças ocupacionais: causalidade, latência, irreversibilidade',
          'Síndrome do Trabalho Repetitivo (STR)',
          'Lombalgias relacionadas ao trabalho',
          'Ototoxicidade: perda auditiva induzida por ruído (PAIR)',
          'Pneumoconioses: silicose, asbestose, talicose',
          'Dermatites de contato ocupacional',
          'Vigilância biológica: monitoramento de exposição'
        ]
      },
      {
        nome: 'Impactos Ambientais e Controle',
        topicos: [
          'Emissões atmosféricas: CO2, NOx, SOx, particulados, VOCs',
          'Poluição aquática: despejos, drenagem ácida, óleos',
          'Resíduos sólidos: classificação, tratamento, disposição',
          'Remediação de solos contaminados',
          'Efluentes: tratamento primário, secundário, terciário',
          'Gestão de resíduos perigosos'
        ]
      },
      {
        nome: 'Sistemas de Gestão SSH',
        topicos: [
          'ISO 45001: Sistema de Gestão de SSH',
          'ISO 14001: Sistema de Gestão Ambiental',
          'Auditorias internas e externas',
          'Programa de treinamento e conscientização',
          'Investigação de acidentes: metodologia, recomendações',
          'Indicadores: acidentalidade, absenteísmo, frequência',
          'Engajamento e comunicação com partes interessadas'
        ]
      },
      {
        nome: 'Resposta a Emergências',
        topicos: [
          'Plano de ação de emergência (PAE)',
          'Brigada de emergência e treinamento',
          'Primeiros socorros: ressuscitação cardiopulmonar (RCP)',
          'Eventos críticos: vazamentos, incêndios, explosões',
          'Plano de contingência para desastres ambientais',
          'Comunicação de crise com órgãos reguladores',
          'Pós-emergência: investigação e lições aprendidas'
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
        topicos: [
          'Unidades SI: definições e derivações',
          'Padrões primários, secundários, de trabalho',
          'Rastreabilidade metrológica',
          'Certificados de calibração: leitura e interpretação',
          'Incerteza de medição: tipos A e B',
          'Expressão de incerteza com cobertura 95%'
        ]
      },
      {
        nome: 'Instrumentação Analítica',
        topicos: [
          'Calibração de equipamentos volumétricos: bureta, pipeta, balão volumétrico',
          'Balanças analíticas: tipos, sensibilidade, ajuste',
          'Espectrofotômetro UV-Vis: calibração de comprimento de onda e absorbância',
          'pHmetro: calibração em dois ou três pontos',
          'Condutivímetro: calibração com padrões',
          'Termômetros: calibração com pontos fixos'
        ]
      },
      {
        nome: 'Controle de Qualidade em Processo',
        topicos: [
          'Amostragem: planos de amostragem, tamanho da amostra',
          'Cartas de controle: média e amplitude (X-R), amplitude móvel (I-MR)',
          'Capacidade do processo: Cp, Cpk, Pp, Ppk',
          'Limites de controle: naturais e especificação',
          'Padrões de comportamento: zonas, pontos fora de controle',
          'Testes de hipótese: ANOVA, t-test, chi-square'
        ]
      },
      {
        nome: 'Garantia de Qualidade (QA)',
        topicos: [
          'Boas Práticas de Laboratório (BPL)',
          'Validação de métodos analíticos: exatidão, precisão, seletividade',
          'Linearidade, intervalo e robustez',
          'Padrões de referência: certificação e rastreabilidade',
          'Reagentes: qualificação, estabilidade, prazo de validade',
          'Documentação: rastreabilidade e arquivos'
        ]
      },
      {
        nome: 'Estatística aplicada à Qualidade',
        topicos: [
          'Distribuições: normal, t-Student, qui-quadrado, F',
          'Intervalos de confiança para média e proporção',
          'Teste de normalidade: Shapiro-Wilk, Anderson-Darling',
          'Teste de homocedasticidade: Levene, Bartlett',
          'ANOVA um fator e multifatorial',
          'Correlação e regressão linear/não-linear'
        ]
      },
      {
        nome: 'Sistemas de Qualidade (ISO)',
        topicos: [
          'ISO/IEC 17025: Requisitos para laboratórios',
          'ISO 9001: Sistema de Gestão da Qualidade',
          'ISO 13849-1: Segurança de máquinas',
          'Auditoria interna e não-conformidade',
          'Ações corretivas e preventivas (CAPA)',
          'Gestão de documentos: versões, aprovação, distribuição'
        ]
      }
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
