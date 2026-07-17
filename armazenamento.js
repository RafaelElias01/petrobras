import { ref } from 'vue';

const prefixo = 'petrobras_quimica_';
const debounceTimers = {};

export const saveStatus = ref('idle');

function carregar(chave, padrao = null) {
  try {
    const dados = localStorage.getItem(prefixo + chave);
    return dados ? JSON.parse(dados) : padrao;
  } catch (e) {
    console.error(`Falha ao carregar '${chave}' do localStorage`, e);
    return padrao;
  }
}

function salvar(chave, dados, debounceMs = 1000) {
  saveStatus.value = 'saving';

  if (debounceTimers[chave]) {
    clearTimeout(debounceTimers[chave]);
  }

  debounceTimers[chave] = setTimeout(() => {
    try {
      localStorage.setItem(prefixo + chave, JSON.stringify(dados));
      saveStatus.value = 'saved';
    } catch (e) {
      console.error(`Falha ao salvar '${chave}' no localStorage`, e);
      saveStatus.value = 'error';
    } finally {
      setTimeout(() => { if (saveStatus.value !== 'saving') saveStatus.value = 'idle'; }, 2000);
    }
  }, debounceMs);
}

export const Armazenamento = { carregar, salvar };
