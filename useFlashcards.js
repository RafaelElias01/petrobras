import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';

let instance;

export function useFlashcards() {
  if (instance) return instance;

  const flashcards = ref([]);
  const editandoFlashcard = ref(null);
  const carregado = ref(false);

  const LEITNER_BOXES = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

  const modoRevisao = ref(false);
  const configurandoRevisao = ref(false);
  const deckRevisao = ref([]);
  const cardAtualIndex = ref(0);
  const opcoesRevisao = ref({ materias: [], numCards: 10, aleatorio: true });

  const cardAtual = computed(() => deckRevisao.value[cardAtualIndex.value] || null);
  const progressoRevisao = computed(() =>
    deckRevisao.value.length > 0
      ? Math.round(((cardAtualIndex.value + 1) / deckRevisao.value.length) * 100)
      : 0
  );

  const flashcardsAgrupados = computed(() => {
    const grupos = {};
    ['Português', 'Matemática', 'Química'].forEach(m => grupos[m] = []);
    flashcards.value.forEach(f => {
      if (grupos[f.materia]) grupos[f.materia].push(f);
    });
    return grupos;
  });

  async function carregarFlashcards() {
    if (carregado.value) return;
    flashcards.value = await Armazenamento.carregar('flashcards', []);
    if (flashcards.value.length === 0) {
      flashcards.value = FLASHCARDS_PADRAO;
      Armazenamento.salvar('flashcards', flashcards.value, 0);
    }
    carregado.value = true;
  }

  const FLASHCARDS_PADRAO = [
    {id:1,materia:"Português",frente:"O que é fonética?",verso:"Estudo dos sons da fala (fonemas).",box:1,lastReviewed:null},
    {id:2,materia:"Português",frente:"O que é fonologia?",verso:"Estudo da função dos sons em uma língua.",box:1,lastReviewed:null},
    {id:3,materia:"Português",frente:"Diferencie fonema de letra.",verso:"Fonema = som; letra = representação gráfica. Ex: 'táxi' tem 4 fonemas e 4 letras; 'hoje' tem 3 fonemas e 4 letras.",box:1,lastReviewed:null},
    {id:4,materia:"Português",frente:"O que é encontro consonantal?",verso:"Sequência de duas ou mais consoantes sem vogal entre elas. Ex: 'prato' (pr), 'flor' (fl).",box:1,lastReviewed:null},
    {id:5,materia:"Português",frente:"O que é dígrafo?",verso:"Duas letras representando um único fonema. Ex: 'ch', 'lh', 'nh', 'qu', 'gu', 'ss', 'rr', 'sc'.",box:1,lastReviewed:null},
    {id:6,materia:"Português",frente:"O que é ditongo?",verso:"Encontro de duas vogais na mesma sílaba. Ex: 'cai-xa', 'herói'.",box:1,lastReviewed:null},
    {id:7,materia:"Português",frente:"O que é hiato?",verso:"Encontro de duas vogais em sílabas diferentes. Ex: 'sa-ú-de', 'po-é-ti-co'.",box:1,lastReviewed:null},
    {id:8,materia:"Português",frente:"Regra de acentuação: paroxítonas",verso:"Acentuam-se paroxítonas terminadas em: l, n, r, x, i, is, us, um, uns, ão, ãos, ei, eis, ps. Ex: 'fácil', 'hífen', 'tórax'.",box:1,lastReviewed:null},
    {id:9,materia:"Português",frente:"Regra de acentuação: proparoxítonas",verso:"Todas as proparoxítonas são acentuadas. Ex: 'médico', 'página', 'lâmpada'.",box:1,lastReviewed:null},
    {id:10,materia:"Português",frente:"Regra de acentuação: oxítonas",verso:"Acentuam-se oxítonas terminadas em: a, e, o, em, ens. Ex: 'sofá', 'café', 'armazém'.",box:1,lastReviewed:null},
    {id:11,materia:"Português",frente:"Por que 'ideia' não leva mais acento?",verso:"Pelo Novo Acordo Ortográfico, ditongos abertos 'ei' e 'oi' em paroxítonas perderam o acento.",box:1,lastReviewed:null},
    {id:12,materia:"Português",frente:"Classes gramaticais: substantivo",verso:"Palavra que nomeia seres, objetos, sentimentos, etc. Ex: 'casa', 'amor', 'Petrobras'.",box:1,lastReviewed:null},
    {id:13,materia:"Português",frente:"Classes gramaticais: adjetivo",verso:"Palavra que caracteriza o substantivo. Ex: 'grande', 'eficiente', 'químico'.",box:1,lastReviewed:null},
    {id:14,materia:"Português",frente:"Classes gramaticais: verbo",verso:"Palavra que indica ação, estado ou fenômeno. Ex: 'analisar', 'ser', 'chover'.",box:1,lastReviewed:null},
    {id:15,materia:"Português",frente:"O que é sujeito?",verso:"Termo sobre o qual se declara algo. Ex: 'O técnico analisou a amostra' → sujeito: 'O técnico'.",box:1,lastReviewed:null},
    {id:16,materia:"Português",frente:"O que é predicado?",verso:"Tudo que se declara sobre o sujeito. Ex: 'O técnico analisou a amostra' → predicado: 'analisou a amostra'.",box:1,lastReviewed:null},
    {id:17,materia:"Português",frente:"O que é objeto direto?",verso:"Complemento verbal sem preposição obrigatória. Ex: 'Ele comprou um livro'. 'um livro' = OD.",box:1,lastReviewed:null},
    {id:18,materia:"Português",frente:"O que é objeto indireto?",verso:"Complemento verbal com preposição obrigatória. Ex: 'Preciso de ajuda'. 'de ajuda' = OI.",box:1,lastReviewed:null},
    {id:19,materia:"Português",frente:"O que é adjunto adverbial?",verso:"Termo que indica circunstância (tempo, lugar, modo, etc.). Ex: 'Chegou cedo'. 'cedo' = adj. adverbial de tempo.",box:1,lastReviewed:null},
    {id:20,materia:"Português",frente:"O que é crase?",verso:"Fusão da preposição 'a' com o artigo 'a' ou com o 'a' de pronomes. Usa-se acento grave (`). Ex: 'Vou à escola'.",box:1,lastReviewed:null},
    {id:21,materia:"Português",frente:"Quando usar 'mal' e 'mau'?",verso:"'Mal' = advérbio (opõe-se a 'bem'). 'Mau' = adjetivo (opõe-se a 'bom'). Ex: 'Ele está mal' / 'Ele é um mau profissional'.",box:1,lastReviewed:null},
    {id:22,materia:"Português",frente:"Quando usar 'mais' e 'mas'?",verso:"'Mas' = conjunção adversativa (oposição). 'Mais' = advérbio de intensidade. Ex: 'Estudou, mas não passou' / 'Quero mais tempo'.",box:1,lastReviewed:null},
    {id:23,materia:"Português",frente:"O que é figura de linguagem?",verso:"Recurso estilístico para dar expressividade ao texto. Ex: metáfora, metonímia, hipérbole, antítese.",box:1,lastReviewed:null},
    {id:24,materia:"Português",frente:"O que é metáfora?",verso:"Figura de palavra que emprega um termo com significado diferente do usual, por comparação implícita. Ex: 'Ele é um leão'.",box:1,lastReviewed:null},
    {id:25,materia:"Português",frente:"O que é concordância verbal?",verso:"O verbo concorda com o sujeito em número e pessoa. Ex: 'O aluno estudou' / 'Os alunos estudaram'.",box:1,lastReviewed:null},
    {id:26,materia:"Português",frente:"O que é regência verbal?",verso:"Relação entre o verbo e seus complementos (com ou sem preposição). Ex: 'Assistir ao filme' (OI) / 'Assistir o professor' (OD).",box:1,lastReviewed:null},
    {id:27,materia:"Português",frente:"O que é período composto?",verso:"Frase com mais de uma oração. Ex: 'Estudou muito, mas não passou'.",box:1,lastReviewed:null},
    {id:28,materia:"Português",frente:"O que é oração subordinada?",verso:"Oração que depende de outra (principal). Ex: 'Preciso que você estude' → 'que você estude' é subordinada.",box:1,lastReviewed:null},
    {id:29,materia:"Português",frente:"O que são conectivos?",verso:"Palavras que ligam orações ou termos. Ex: conjunções (e, mas, porque, quando), preposições, pronomes relativos.",box:1,lastReviewed:null},
    {id:30,materia:"Português",frente:"Funções da linguagem: função referencial",verso:"Foco na informação, no contexto. Ex: notícias, manuais técnicos. Predomina a 3ª pessoa.",box:1,lastReviewed:null},
    {id:31,materia:"Português",frente:"Funções da linguagem: função emotiva",verso:"Foco no emissor, expressão de sentimentos. Ex: poemas, diários. Predomina a 1ª pessoa.",box:1,lastReviewed:null},
    {id:32,materia:"Português",frente:"Funções da linguagem: função conativa",verso:"Foco no receptor, intenção de convencer. Ex: propagandas, discursos políticos. Uso de imperativo.",box:1,lastReviewed:null},
    {id:33,materia:"Português",frente:"Funções da linguagem: função fática",verso:"Foco no canal de comunicação. Ex: 'Alô?', 'Entendeu?', 'Está me ouvindo?'.",box:1,lastReviewed:null},
    {id:34,materia:"Matemática",frente:"O que é regra de três simples?",verso:"Método para resolver problemas com grandezas proporcionais. Se A está para B assim como C está para D, então A×D = B×C.",box:1,lastReviewed:null},
    {id:35,materia:"Matemática",frente:"O que é porcentagem?",verso:"Razão com denominador 100. Ex: 25% = 25/100 = 0,25.",box:1,lastReviewed:null},
    {id:36,materia:"Matemática",frente:"Fórmula do montante de juros simples",verso:"M = C + J = C(1 + i×t). Onde C=capital, i=taxa, t=tempo.",box:1,lastReviewed:null},
    {id:37,materia:"Matemática",frente:"Fórmula do montante de juros compostos",verso:"M = C(1 + i)^t. Onde C=capital, i=taxa, t=tempo.",box:1,lastReviewed:null},
    {id:38,materia:"Matemática",frente:"Área do triângulo",verso:"A = (b × h) / 2. Onde b = base, h = altura.",box:1,lastReviewed:null},
    {id:39,materia:"Matemática",frente:"Área do círculo",verso:"A = π × r². Onde r = raio, π ≈ 3,14.",box:1,lastReviewed:null},
    {id:40,materia:"Matemática",frente:"Comprimento da circunferência",verso:"C = 2πr. Onde r = raio.",box:1,lastReviewed:null},
    {id:41,materia:"Matemática",frente:"Volume do cilindro",verso:"V = π × r² × h. Onde r = raio da base, h = altura.",box:1,lastReviewed:null},
    {id:42,materia:"Matemática",frente:"Volume do cubo",verso:"V = a³. Onde a = aresta.",box:1,lastReviewed:null},
    {id:43,materia:"Matemática",frente:"O que é média aritmética?",verso:"Soma dos valores dividida pela quantidade. Ex: média de 5, 7, 9 = (5+7+9)/3 = 7.",box:1,lastReviewed:null},
    {id:44,materia:"Matemática",frente:"O que é mediana?",verso:"Valor central de um conjunto ordenado. Se ímpar: termo central. Se par: média dos dois centrais.",box:1,lastReviewed:null},
    {id:45,materia:"Matemática",frente:"O que é moda?",verso:"Valor que mais se repete em um conjunto. Ex: {2,3,3,5,7} → moda = 3.",box:1,lastReviewed:null},
    {id:46,materia:"Matemática",frente:"O que é probabilidade?",verso:"P = (casos favoráveis) / (casos possíveis). Valor entre 0 e 1.",box:1,lastReviewed:null},
    {id:47,materia:"Matemática",frente:"O que são eventos mutuamente exclusivos?",verso:"Eventos que não podem ocorrer simultaneamente. P(A ∪ B) = P(A) + P(B).",box:1,lastReviewed:null},
    {id:48,materia:"Matemática",frente:"O que é função do 1º grau?",verso:"f(x) = ax + b, com a ≠ 0. Gráfico é uma reta. a = coeficiente angular, b = linear.",box:1,lastReviewed:null},
    {id:49,materia:"Matemática",frente:"O que é função do 2º grau?",verso:"f(x) = ax² + bx + c, com a ≠ 0. Gráfico é uma parábola.",box:1,lastReviewed:null},
    {id:50,materia:"Matemática",frente:"Fórmula de Bhaskara",verso:"x = (-b ± √Δ) / 2a, onde Δ = b² - 4ac.",box:1,lastReviewed:null},
    {id:51,materia:"Matemática",frente:"O que é logaritmo?",verso:"log_a b = x ⇔ a^x = b. Condições: a > 0, a ≠ 1, b > 0.",box:1,lastReviewed:null},
    {id:52,materia:"Matemática",frente:"Teorema de Pitágoras",verso:"a² = b² + c², onde 'a' é a hipotenusa, 'b' e 'c' são os catetos.",box:1,lastReviewed:null},
    {id:53,materia:"Matemática",frente:"Razão entre grandezas: direta vs inversa",verso:"Direta: uma aumenta, a outra aumenta na mesma proporção. Inversa: uma aumenta, a outra diminui.",box:1,lastReviewed:null},
    {id:54,materia:"Matemática",frente:"O que é análise combinatória?",verso:"Ramo que estuda formas de agrupar elementos. Principais: arranjo, combinação, permutação.",box:1,lastReviewed:null},
    {id:55,materia:"Matemática",frente:"Fórmula da combinação",verso:"C(n,p) = n! / [p!(n-p)!]. Não importa a ordem dos elementos.",box:1,lastReviewed:null},
    {id:56,materia:"Matemática",frente:"Fórmula do arranjo",verso:"A(n,p) = n! / (n-p)!. A ordem dos elementos importa.",box:1,lastReviewed:null},
    {id:57,materia:"Matemática",frente:"O que é progressão aritmética (PA)?",verso:"Sequência onde cada termo é o anterior somado a uma constante (razão r). Termo geral: a_n = a₁ + (n-1)r.",box:1,lastReviewed:null},
    {id:58,materia:"Matemática",frente:"Soma dos termos de uma PA",verso:"S_n = (a₁ + a_n) × n / 2.",box:1,lastReviewed:null},
    {id:59,materia:"Matemática",frente:"O que é progressão geométrica (PG)?",verso:"Sequência onde cada termo é o anterior multiplicado por uma constante (razão q). Termo geral: a_n = a₁ × q^(n-1).",box:1,lastReviewed:null},
    {id:60,materia:"Matemática",frente:"Soma dos termos de uma PG finita",verso:"S_n = a₁(q^n - 1) / (q - 1), para q ≠ 1.",box:1,lastReviewed:null},
    {id:61,materia:"Matemática",frente:"Soma dos termos de uma PG infinita",verso:"S = a₁ / (1 - q), para |q| < 1.",box:1,lastReviewed:null},
    {id:62,materia:"Matemática",frente:"O que é matriz?",verso:"Tabela de elementos dispostos em linhas e colunas. Ordem m×n (m linhas, n colunas).",box:1,lastReviewed:null},
    {id:63,materia:"Matemática",frente:"O que é determinante?",verso:"Número associado a uma matriz quadrada. Para matriz 2×2: det = ad - bc.",box:1,lastReviewed:null},
    {id:64,materia:"Matemática",frente:"O que é sistema linear?",verso:"Conjunto de equações lineares com variáveis em comum. Pode ser SPD, SPI ou SI.",box:1,lastReviewed:null},
    {id:65,materia:"Matemática",frente:"O que é geometria analítica?",verso:"Ramo que estuda figuras geométricas usando coordenadas e equações.",box:1,lastReviewed:null},
    {id:66,materia:"Química",frente:"O que é matéria?",verso:"Tudo que tem massa e ocupa lugar no espaço.",box:1,lastReviewed:null},
    {id:67,materia:"Química",frente:"O que é átomo?",verso:"Menor partícula que mantém as propriedades de um elemento químico.",box:1,lastReviewed:null},
    {id:68,materia:"Química",frente:"Partes do átomo",verso:"Núcleo (prótons + nêutrons) e eletrosfera (elétrons). Próton: carga +; elétron: carga -; nêutron: neutro.",box:1,lastReviewed:null},
    {id:69,materia:"Química",frente:"O que é número atômico (Z)?",verso:"Quantidade de prótons no núcleo. Identifica o elemento químico.",box:1,lastReviewed:null},
    {id:70,materia:"Química",frente:"O que é número de massa (A)?",verso:"Soma de prótons e nêutrons: A = Z + N.",box:1,lastReviewed:null},
    {id:71,materia:"Química",frente:"O que são isótopos?",verso:"Átomos do mesmo elemento (mesmo Z) com diferentes números de massa (nêutrons). Ex: C-12, C-13, C-14.",box:1,lastReviewed:null},
    {id:72,materia:"Química",frente:"O que é ligação iônica?",verso:"Transferência definitiva de elétrons entre metal e não-metal. Formam-se íons. Ex: NaCl.",box:1,lastReviewed:null},
    {id:73,materia:"Química",frente:"O que é ligação covalente?",verso:"Compartilhamento de pares de elétrons entre não-metais. Ex: H₂O, CO₂.",box:1,lastReviewed:null},
    {id:74,materia:"Química",frente:"O que é ligação metálica?",verso:"Atração entre cátions metálicos e elétrons livres (mar de elétrons). Ex: Fe, Cu, Al.",box:1,lastReviewed:null},
    {id:75,materia:"Química",frente:"O que é pH?",verso:"Potencial hidrogeniônico. pH = -log[H⁺]. Escala 0-14. pH < 7 = ácido; pH > 7 = básico; pH = 7 = neutro.",box:1,lastReviewed:null},
    {id:76,materia:"Química",frente:"O que é solução?",verso:"Mistura homogênea de duas ou mais substâncias. Ex: água + sal.",box:1,lastReviewed:null},
    {id:77,materia:"Química",frente:"Fórmula da concentração comum",verso:"C = m/V. Onde m = massa do soluto (g), V = volume da solução (L). Unidade: g/L.",box:1,lastReviewed:null},
    {id:78,materia:"Química",frente:"O que é mol?",verso:"Quantidade de matéria que contém 6,02×10²³ entidades (Número de Avogadro).",box:1,lastReviewed:null},
    {id:79,materia:"Química",frente:"O que é massa molar?",verso:"Massa de 1 mol de uma substância, em g/mol. Soma das massas atômicas dos elementos.",box:1,lastReviewed:null},
    {id:80,materia:"Química",frente:"O que é estequiometria?",verso:"Cálculo das quantidades de reagentes e produtos em uma reação química, baseado nas proporções molares.",box:1,lastReviewed:null},
    {id:81,materia:"Química",frente:"O que é reação exotérmica?",verso:"Reação que libera calor para o ambiente. ΔH < 0. Ex: combustão.",box:1,lastReviewed:null},
    {id:82,materia:"Química",frente:"O que é reação endotérmica?",verso:"Reação que absorve calor do ambiente. ΔH > 0. Ex: fotossíntese.",box:1,lastReviewed:null},
    {id:83,materia:"Química",frente:"O que é catálise?",verso:"Aumento da velocidade de uma reação por um catalisador, que diminui a energia de ativação sem ser consumido.",box:1,lastReviewed:null},
    {id:84,materia:"Química",frente:"O que é equilíbrio químico?",verso:"Estado onde as velocidades das reações direta e inversa se igualam. As concentrações permanecem constantes.",box:1,lastReviewed:null},
    {id:85,materia:"Química",frente:"Princípio de Le Chatelier",verso:"Quando um sistema em equilíbrio sofre uma perturbação, ele se desloca para minimizar o efeito.",box:1,lastReviewed:null},
    {id:86,materia:"Química",frente:"Fórmula da constante de equilíbrio Kc",verso:"Kc = [produtos]^coeficientes / [reagentes]^coeficientes (para reações em solução).",box:1,lastReviewed:null},
    {id:87,materia:"Química",frente:"O que é oxidação?",verso:"Perda de elétrons. Aumento do número de oxidação (NOX).",box:1,lastReviewed:null},
    {id:88,materia:"Química",frente:"O que é redução?",verso:"Ganho de elétrons. Diminuição do número de oxidação (NOX).",box:1,lastReviewed:null},
    {id:89,materia:"Química",frente:"O que é eletrólise?",verso:"Processo não espontâneo que usa corrente elétrica para promover uma reação química.",box:1,lastReviewed:null},
    {id:90,materia:"Química",frente:"O que é destilação fracionada?",verso:"Separação de líquidos miscíveis com diferentes pontos de ebulição. Ex: separação do petróleo.",box:1,lastReviewed:null},
    {id:91,materia:"Química",frente:"O que é cromatografia?",verso:"Técnica de separação baseada na diferença de afinidade dos componentes por uma fase estacionária e uma fase móvel.",box:1,lastReviewed:null},
    {id:92,materia:"Química",frente:"O que é espectrofotometria UV-Vis?",verso:"Técnica que mede a absorção de luz UV-Visível, baseada na Lei de Beer-Lambert: A = εbc.",box:1,lastReviewed:null},
    {id:93,materia:"Química",frente:"O que é titulação?",verso:"Técnica volumétrica onde uma solução de concentração conhecida reage com uma de concentração desconhecida.",box:1,lastReviewed:null},
    {id:94,materia:"Química",frente:"O que é ponto de equivalência?",verso:"Ponto onde a quantidade de titulante adicionada é estequiometricamente equivalente ao titulado.",box:1,lastReviewed:null},
    {id:95,materia:"Química",frente:"Fórmula geral dos alcanos",verso:"CₙH₂ₙ₊₂. Hidrocarbonetos saturados com ligações simples. Ex: metano CH₄, etano C₂H₆.",box:1,lastReviewed:null},
    {id:96,materia:"Química",frente:"O que são isômeros?",verso:"Compostos com mesma fórmula molecular, mas diferentes estruturas ou arranjos espaciais.",box:1,lastReviewed:null},
    {id:97,materia:"Química",frente:"Grupo funcional dos álcoois",verso:"OH (hidroxila) ligado a carbono saturado. Ex: etanol CH₃CH₂OH.",box:1,lastReviewed:null},
    {id:98,materia:"Química",frente:"Grupo funcional dos ácidos carboxílicos",verso:"COOH (carboxila). Ex: ácido acético CH₃COOH.",box:1,lastReviewed:null},
    {id:99,materia:"Química",frente:"O que é polimerização?",verso:"Processo de formação de polímeros a partir de monômeros. Ex: polietileno a partir do eteno.",box:1,lastReviewed:null},
    {id:100,materia:"Química",frente:"Regra de Markovnikov",verso:"Em adição a alceno, o H se liga ao carbono mais hidrogenado; o halogênio ao menos hidrogenado.",box:1,lastReviewed:null},
  ];

  watch(flashcards, (val) => {
    if (!carregado.value) return;
    Armazenamento.salvar('flashcards', val);
  }, { deep: true });

  function novoFlashcard() {
    editandoFlashcard.value = { id: Date.now(), materia: '', frente: '', verso: '', box: 1, lastReviewed: null };
  }

  function salvarFlashcard() {
    if (!editandoFlashcard.value?.materia) return;
    const card = { box: 1, lastReviewed: null, ...editandoFlashcard.value };
    const idx = flashcards.value.findIndex(f => f.id === card.id);
    if (idx >= 0) flashcards.value.splice(idx, 1, card);
    else flashcards.value.push(card);
    editandoFlashcard.value = null;
  }

  function removerFlashcard(id) {
    flashcards.value = flashcards.value.filter(f => f.id !== id);
  }

  function abrirConfiguracaoRevisao() { configurandoRevisao.value = true; }
  function cancelarConfiguracaoRevisao() { configurandoRevisao.value = false; }

  function iniciarRevisao() {
    configurandoRevisao.value = false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let dueCards = flashcards.value.filter(card => {
      if (!card.lastReviewed) return true;
      const last = new Date(card.lastReviewed);
      const intervalo = LEITNER_BOXES[card.box || 1] || 1;
      const due = new Date(last);
      due.setDate(due.getDate() + intervalo);
      return hoje >= due;
    });
    if (opcoesRevisao.value.materias.length > 0) {
      dueCards = dueCards.filter(c => opcoesRevisao.value.materias.includes(c.materia));
    }
    if (opcoesRevisao.value.aleatorio) {
      for (let i = dueCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dueCards[i], dueCards[j]] = [dueCards[j], dueCards[i]];
      }
    }
    deckRevisao.value = dueCards.slice(0, opcoesRevisao.value.numCards).map(c => ({ ...c, virado: false }));
    cardAtualIndex.value = 0;
    modoRevisao.value = true;
  }

  function proximoCard() {
    if (cardAtualIndex.value < deckRevisao.value.length - 1) cardAtualIndex.value++;
    else finalizarRevisao();
  }

  async function marcarResultado(acertou) {
    const card = cardAtual.value;
    if (!card) return;
    if (acertou) card.box = Math.min((card.box || 1) + 1, 5);
    else card.box = 1;
    card.lastReviewed = new Date().toISOString().slice(0, 10);
    const original = flashcards.value.find(f => f.id === card.id);
    if (original) Object.assign(original, { box: card.box, lastReviewed: card.lastReviewed });
    proximoCard();
  }

  function finalizarRevisao() { modoRevisao.value = false; }

  instance = {
    flashcards, editandoFlashcard, carregandoFlashcards: carregado,
    flashcardsAgrupados, carregarFlashcards, novoFlashcard, salvarFlashcard,
    editarFlashcard: (c) => editandoFlashcard.value = { ...c },
    removerFlashcard, cancelarFlashcard: () => editandoFlashcard.value = null,
    modoRevisao, configurandoRevisao, deckRevisao, cardAtualIndex,
    cardAtual, progressoRevisao, opcoesRevisao,
    abrirConfiguracaoRevisao, iniciarRevisao, proximoCard, marcarResultado, finalizarRevisao,
    cancelarConfiguracaoRevisao
  };
  return instance;
}
