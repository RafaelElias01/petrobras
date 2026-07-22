// Regras de resposta por palavra-chave. Conteúdo espelha o FAQ real do site
// (FaqSection.vue) -- ao atualizar uma resposta lá, atualizar aqui também
// pra não ficarem contraditórias (ver LIVRO_DE_ERROS.md, mesma categoria do
// ERRO-006: lista/conteúdo divergindo da fonte real).
//
// Cada regra tem `keywords` (normalizadas: minúsculo, sem acento) e
// `resposta`. A primeira regra cujo texto da mensagem contém qualquer uma
// das keywords é usada. Ordem importa: regras mais específicas primeiro.

export function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // remove acentos
}

export const SITE_URL = 'https://petrobrasacademy.com.br';

export const REGRAS = [
  {
    keywords: ['preco', 'valor', 'quanto custa', 'quanto e', 'mensalidade'],
    resposta: `💰 O Premium custa *R$ 49,90*, pagamento único — sem mensalidade. Acesso vitalício a todo o conteúdo e atualizações futuras.\n\nAssine direto pelo site: ${SITE_URL}`,
  },
  {
    keywords: ['pagamento', 'pagar', 'pix', 'cartao', 'boleto', 'mercado pago', 'mercadopago'],
    resposta: `💳 O pagamento é 100% automático pelo Mercado Pago (Pix, cartão ou boleto). Assim que aprovado, seu Premium é liberado na hora, sem precisar enviar comprovante.\n\nPague direto pelo site: ${SITE_URL}`,
  },
  {
    keywords: ['reembolso', 'devolucao', 'cancelar', 'garantia', 'estorno'],
    resposta: `Sobre reembolso: fale direto com a gente aqui mesmo que a gente te ajuda a resolver caso a caso. 🙂`,
  },
  {
    keywords: ['diferente', 'diferenca', 'por que', 'porque', 'vale a pena', 'funciona'],
    resposta: `🎯 Não somos um "depósito de PDFs". Somos um método de estudo ativo:\n\n🔁 *Ciclo Ponderado* — você estuda o que a Cesgranrio mais cobra\n🧠 *Revisão Espaçada* — flashcards que garantem que você não esqueça\n📊 *Métricas Reais* — você vê seu progresso e ajusta a rota\n\nConheça: ${SITE_URL}`,
  },
  {
    keywords: ['tempo', 'pouco tempo', 'trabalho', 'corrido'],
    resposta: `⏱️ A plataforma foi desenhada pra quem tem pouco tempo. O ciclo de estudos prioriza as matérias de maior peso, e os flashcards são perfeitos pra revisões rápidas de 15 minutos no ônibus ou no intervalo.\n\nSaiba mais: ${SITE_URL}`,
  },
  {
    keywords: ['atualizado', 'edital', 'concurso', '2026', 'cesgranrio'],
    resposta: `📅 Todo o conteúdo é baseado na análise dos últimos editais da Cesgranrio para Técnico em Química. O acesso vitalício garante atualizações pros próximos concursos sem custo adicional.`,
  },
  {
    keywords: ['celular', 'mobile', 'app', 'aplicativo'],
    resposta: `📱 Sim! A plataforma é 100% responsiva — funciona em computador, tablet e celular. Estude onde e quando quiser: ${SITE_URL}`,
  },
  {
    keywords: ['cadastro', 'criar conta', 'login', 'entrar', 'esqueci senha', 'esqueci a senha'],
    resposta: `📝 Você pode criar sua conta grátis direto pelo site: ${SITE_URL}\n\nSe esqueceu a senha, fale com a gente aqui que ajudamos a recuperar o acesso.`,
  },
  {
    keywords: ['premium', 'assinar', 'assinatura', 'vip'],
    resposta: `👑 O Premium libera o conteúdo completo: ciclo de estudos, flashcards, simulados, banco de questões e relatório de desempenho. R$ 49,90, pagamento único, vitalício.\n\nAssine: ${SITE_URL}`,
  },
  {
    keywords: ['oi', 'ola', 'boa tarde', 'bom dia', 'boa noite', 'menu', 'ajuda'],
    resposta: `Olá! 👋 Sou o assistente automático do *Estudo Petrobras*.\n\nPosso te ajudar com:\n💰 Preço e pagamento\n👑 O que é o Premium\n📅 Atualização do conteúdo\n📱 Uso no celular\n📝 Cadastro e login\n\nÉ só perguntar! Se precisar falar com uma pessoa, me diga "atendente" que a gente te responde por aqui assim que possível.`,
  },
];

export const RESPOSTA_PADRAO =
  `Não entendi bem sua pergunta 🤔 Pode tentar de outro jeito? Ou digite *menu* pra ver os assuntos que posso ajudar.\n\nSe preferir, veja tudo no site: ${SITE_URL}`;

export function encontrarResposta(mensagem) {
  const texto = normalizar(mensagem);
  for (const regra of REGRAS) {
    if (regra.keywords.some(k => texto.includes(normalizar(k)))) {
      return regra.resposta;
    }
  }
  return RESPOSTA_PADRAO;
}
