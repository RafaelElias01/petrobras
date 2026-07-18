import { ref } from 'vue';

const prefixo = 'petrobras_quimica_';
const debounceTimers = {};

export const saveStatus = ref('idle');

const SENSITIVE_KEYS = ['admin_usuarios', 'sessao'];

function encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decode(str) {
  return decodeURIComponent(escape(atob(str)));
}

function isSensitive(chave) {
  return SENSITIVE_KEYS.some(k => chave.includes(k));
}

function carregar(chave, padrao = null) {
  try {
    const raw = localStorage.getItem(prefixo + chave);
    if (!raw) return padrao;
    if (isSensitive(chave)) {
      return JSON.parse(decode(raw));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Falha ao carregar '${chave}'`, e);
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
      const json = JSON.stringify(dados);
      const stored = isSensitive(chave) ? encode(json) : json;
      localStorage.setItem(prefixo + chave, stored);
      saveStatus.value = 'saved';
    } catch (e) {
      console.error(`Falha ao salvar '${chave}'`, e);
      saveStatus.value = 'error';
    } finally {
      setTimeout(() => { if (saveStatus.value !== 'saving') saveStatus.value = 'idle'; }, 2000);
    }
  }, debounceMs);
}

export const Armazenamento = { carregar, salvar };
