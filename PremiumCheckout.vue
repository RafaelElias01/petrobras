<script setup>
import { ref } from 'vue';

const props = defineProps({
  qrCode: { type: String, default: '' },
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
    <div class="pix-qr-wrapper">
      <div class="pix-value">👑 Premium — R$ 49,90</div>
      <img v-if="qrCode" :src="qrCode" alt="QR Code PIX" class="pix-qr" />
      <div v-else class="pix-loading">Gerando QR Code...</div>
      <div class="pix-label">Escaneie com o app do seu banco</div>
    </div>

    <template v-if="token">
      <button @click="pagarComMercadoPago" :disabled="carregandoMp" class="btn-mercadopago">
        {{ carregandoMp ? 'Abrindo pagamento...' : '💳 Pagar com Mercado Pago (ativação automática)' }}
      </button>
      <p v-if="erroMp" class="pix-erro">{{ erroMp }}</p>
      <p class="pix-help">Ou pague o PIX acima e envie o comprovante no WhatsApp:</p>
    </template>
    <p v-else class="pix-help">Após o pagamento, envie o comprovante no WhatsApp para receber seu acesso:</p>

    <a href="https://wa.me/5551983098650?text=Ol%C3%A1!%20Realizei%20o%20pagamento%20Premium%20(PIX)%20e%20gostaria%20de%20receber%20meu%20acesso." target="_blank" class="btn-whatsapp">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Enviar Comprovante
    </a>
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

.pix-qr-wrapper {
  text-align: center;
  padding: 8px 0 4px;
}

.pix-value {
  font-size: 20px;
  color: #fff;
  margin-bottom: 16px;
}

.pix-qr {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
  border-radius: 12px;
  background: #fff;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.pix-loading {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}

.pix-label {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  margin-top: 8px;
  margin-bottom: 8px;
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

.btn-whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  background: #25D366;
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: inherit;
  border: none;
  cursor: pointer;
}
.btn-whatsapp:hover {
  background: #1ebe5d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37,211,102,0.35);
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
  .pix-qr, .pix-loading {
    width: 160px;
    height: 160px;
  }
  .pix-value {
    font-size: 18px;
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
  .pix-qr, .pix-loading {
    width: 140px;
    height: 140px;
  }
  .pix-value {
    font-size: 16px;
  }
  .btn-whatsapp {
    font-size: 14px;
    padding: 12px;
  }
  .btn-mercadopago {
    font-size: 14px;
    padding: 12px;
  }
}
@media (max-width: 480px) {
  .pix-qr, .pix-loading {
    width: 120px;
    height: 120px;
  }
  .btn-whatsapp {
    font-size: 13px;
    padding: 10px;
    min-height: 44px;
  }
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
