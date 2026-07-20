<script setup>
import { ref } from 'vue';

const props = defineProps({
  token: { type: String, default: '' },
  onClose: { type: Function, required: true },
  onVoltar: { type: Function, default: null },
});

const carregandoMp = ref(false);
const erroMp = ref('');

async function pagarComMercadoPago() {
  erroMp.value = '';
  carregandoMp.value = true;
  try {
    const res = await fetch('/api/premium/criar-preferencia', {
      method: 'POST',
      headers: { Authorization: `Bearer ${props.token}` },
    });
    const data = await res.json();
    if (res.ok && data.init_point) {
      window.location.href = data.init_point;
    } else {
      erroMp.value = data.erro || 'Não foi possível iniciar o pagamento.';
    }
  } catch {
    erroMp.value = 'Erro de conexão. Tente novamente.';
  } finally {
    carregandoMp.value = false;
  }
}
</script>

<template>
  <div class="premium-checkout">
    <button class="btn-fechar" @click="onClose" aria-label="Fechar">✕</button>
    <div class="premium-valor">👑 Premium — R$ 49,90</div>
    <p class="premium-sub">Pagamento único • Acesso vitalício • Ativação automática</p>

    <template v-if="token">
      <button @click="pagarComMercadoPago" :disabled="carregandoMp" class="btn-mercadopago">
        {{ carregandoMp ? 'Abrindo pagamento...' : '💳 Pagar com Mercado Pago' }}
      </button>
      <p v-if="erroMp" class="pix-erro">{{ erroMp }}</p>
    </template>
    <template v-else>
      <p class="pix-help">Crie sua conta ou faça login para assinar o Premium.</p>
      <button v-if="onVoltar" @click="onVoltar" class="btn-mercadopago">Criar conta / Entrar</button>
    </template>

    <button v-if="onVoltar" @click="onVoltar" class="btn-voltar">← Voltar para o Login</button>
  </div>
</template>

<style scoped>
.premium-checkout {
  padding: 16px 0 0;
  text-align: center;
  animation: fadeIn 0.5s ease;
  position: relative;
}

.btn-fechar {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-fechar:hover {
  background: rgba(255,255,255,0.3);
}

.premium-valor {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.premium-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 20px;
}

.pix-help {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 12px;
  line-height: 1.5;
}

.btn-mercadopago {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #00c3ff, #009ee3);
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: inherit;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,158,227,0.4);
  margin-bottom: 12px;
}
.btn-mercadopago:hover:not(:disabled) {
  background: linear-gradient(135deg, #1ecbff, #00b2fa);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,158,227,0.5);
}
.btn-mercadopago:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pix-erro {
  color: var(--erro);
  font-size: 13px;
  margin-top: 4px;
  margin-bottom: 12px;
}

.btn-voltar {
  background: none;
  border: none;
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  cursor: pointer;
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 8px 16px;
  transition: color 0.2s;
  width: 100%;
  font-family: inherit;
}
.btn-voltar:hover {
  color: #fff;
}

@media (max-width: 768px) {
  .btn-fechar {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  .premium-valor {
    font-size: 20px;
  }
  .btn-mercadopago {
    min-height: 44px;
  }
  .pix-erro {
    font-size: 12px;
  }
}
@media (max-width: 600px) {
  .premium-checkout {
    padding: 12px 0 0;
  }
  .premium-valor {
    font-size: 18px;
  }
  .btn-mercadopago {
    font-size: 14px;
    padding: 12px;
  }
}
@media (max-width: 480px) {
  .btn-mercadopago {
    font-size: 13px;
    padding: 10px;
    min-height: 44px;
  }
  .btn-voltar {
    font-size: 14px;
    padding: 12px 16px;
    min-height: 44px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
