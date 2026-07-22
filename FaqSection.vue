<script setup>
const faqs = [
  {
    q: 'O que diferencia o Petrobras Academy de outros cursinhos?',
    a: 'Não somos um "depósito de PDFs". Somos um <strong>método de estudo ativo</strong>. Focamos em 3 pilares: <strong>Ciclo Ponderado</strong> (você estuda o que a Cesgranrio mais cobra), <strong>Revisão Espaçada</strong> (nossos flashcards garantem que você não esqueça o conteúdo) e <strong>Métricas Reais</strong> (você vê seu progresso e ajusta a rota). É um sistema para aprovar, não para te manter ocupado.',
  },
  {
    q: 'O acesso é mensal? É uma assinatura?',
    a: 'Não! O valor de <strong>R$ 49,90 é um pagamento único</strong>. Você paga uma vez e tem <strong>acesso vitalício</strong> a todo o conteúdo e futuras atualizações. Sem mensalidades, sem pegadinhas.',
  },
  {
    q: 'Não tenho muito tempo para estudar. A plataforma serve para mim?',
    a: 'Com certeza. A plataforma foi desenhada para quem tem pouco tempo. O <strong>Ciclo de Estudos Inteligente</strong> prioriza as matérias de maior peso, otimizando seu tempo. Os <strong>flashcards</strong> são perfeitos para revisões rápidas de 15 minutos no ônibus ou no intervalo do almoço.',
  },
  {
    q: 'Como recebo o acesso após o pagamento?',
    a: 'É automático. O pagamento é processado pelo Mercado Pago (Pix, cartão ou boleto) e, assim que aprovado, seu Premium é liberado na hora — sem precisar enviar comprovante nem esperar confirmação manual.',
  },
  {
    q: 'O conteúdo está atualizado para o próximo concurso?',
    a: 'Sim. Todo o nosso conteúdo é baseado na análise dos últimos editais da Cesgranrio para Técnico em Química, incluindo o de 2023. O acesso vitalício garante que você receberá todas as atualizações para os próximos concursos sem custo adicional.',
  },
  {
    q: 'Posso acessar pelo celular?',
    a: 'Sim. A plataforma é 100% responsiva e funciona perfeitamente em computadores, tablets e celulares. Estude onde e quando quiser.',
  },
];
</script>

<template>
  <div class="faq-section">
    <h2 class="faq-title">Perguntas Frequentes</h2>
    <div class="faq-grid">
      <details v-for="(faq, i) in faqs" :key="i" class="faq-item">
        <summary class="faq-question">
          <span>{{ faq.q }}</span>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </summary>
        <div class="faq-answer" v-html="faq.a"></div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.faq-section {
  width: 100%;
  animation: slideUp 0.6s ease-out 0.5s both;
}

.faq-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
}

.faq-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: background 0.2s ease;
}

.faq-item[open] {
  background: rgba(255, 255, 255, 0.08);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  list-style: none; /* Remove a seta padrão do <details> */
}

.faq-question::-webkit-details-marker {
  display: none; /* Remove a seta padrão no Chrome/Safari */
}

.faq-icon {
  flex-shrink: 0;
  margin-left: 16px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}

.faq-item[open] .faq-icon {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 20px;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.75);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInDown 0.4s ease;
}

.faq-answer :deep(strong) {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
}

@media (max-width: 768px) {
  .faq-title {
    font-size: 18px;
    margin-bottom: 18px;
  }
  .faq-question {
    padding: 14px 16px;
    font-size: 14px;
  }
  .faq-answer {
    padding: 0 16px 16px;
    font-size: 13px;
  }
}
@media (max-width: 600px) {
  .faq-title {
    font-size: 16px;
  }
  .faq-question {
    padding: 12px 14px;
    font-size: 13px;
  }
}
@media (max-width: 480px) {
  .faq-question {
    padding: 12px 12px;
    font-size: 13px;
    min-height: 44px;
  }
  .faq-answer {
    padding: 0 12px 12px;
    font-size: 12px;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>