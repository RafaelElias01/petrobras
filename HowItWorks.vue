<script setup>
const steps = [
  {
    icon: '📝',
    title: '1. Crie sua Conta',
    description: 'Cadastre-se gratuitamente com nome, e-mail e senha em menos de um minuto.'
  },
  {
    icon: '💳',
    title: '2. Pague com Mercado Pago',
    description: 'Escolha Pix, cartão ou boleto e faça o pagamento de R$ 49,90. É rápido, seguro e o acesso é vitalício.'
  },
  {
    icon: '🚀',
    title: '3. Acesso Liberado na Hora',
    description: 'Assim que o pagamento é aprovado, seu acesso Premium é ativado automaticamente. Sem espera!'
  }
];
</script>

<template>
  <div class="how-it-works-section">
    <h2 class="how-it-works-title">Como Funciona?</h2>
    <div class="steps-container">
      <div v-for="(step, index) in steps" :key="index" class="step-card" :style="{ animationDelay: `${index * 0.15}s` }">
        <div class="step-icon">{{ step.icon }}</div>
        <h3 class="step-title">{{ step.title }}</h3>
        <p class="step-description">{{ step.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.how-it-works-section {
  width: 100%;
  padding: 20px 0;
  animation: slideUp 0.6s ease-out 0.3s both;
}

.how-it-works-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
}

.steps-container {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.step-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  flex: 1;
  max-width: 280px;
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.step-icon {
  font-size: 32px;
  line-height: 1;
  margin-bottom: 16px;
}

.step-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.step-description {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
}

@media (max-width: 1024px) {
  .steps-container {
    gap: 16px;
  }
  .step-card {
    padding: 20px;
  }
}
@media (max-width: 768px) {
  .steps-container {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .step-card {
    max-width: 100%;
    width: 100%;
  }
}
@media (max-width: 600px) {
  .how-it-works-title {
    font-size: 18px;
    margin-bottom: 18px;
  }
  .step-card {
    padding: 16px;
  }
  .step-icon {
    font-size: 28px;
  }
  .step-title {
    font-size: 15px;
  }
  .step-description {
    font-size: 12px;
  }
}
@media (max-width: 480px) {
  .how-it-works-title {
    font-size: 16px;
    margin-bottom: 14px;
  }
  .step-card {
    padding: 14px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>