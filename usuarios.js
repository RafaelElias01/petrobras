const PREFIXO = 'petrobras_quimica_';
import { Armazenamento } from './armazenamento.js';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hashes gerados sob demanda a partir de uma senha placeholder (não é a senha real em uso).
// Este arquivo é versionado no repositório: nunca commitar hash de senha real aqui.
// Usuário deve trocar a senha desses usuários seed no primeiro acesso ao painel Admin.
const SENHA_PLACEHOLDER = 'trocar-no-primeiro-acesso';
let usuariosPadraoPromise = null;

function usuariosPadraoHashed() {
  if (!usuariosPadraoPromise) {
    usuariosPadraoPromise = Promise.all([
      hashPassword(SENHA_PLACEHOLDER).then(senhaHash => ({ usuario: 'admin', senhaHash, nome: 'Administrador', role: 'admin' })),
      hashPassword(SENHA_PLACEHOLDER).then(senhaHash => ({ usuario: 'estudante', senhaHash, nome: 'Estudante', role: 'user' })),
    ]);
  }
  return usuariosPadraoPromise;
}

async function hashLista(lista) {
  return Promise.all(lista.map(async u => ({
    ...u,
    senhaHash: await hashPassword(u.senha),
    senha: undefined
  })));
}

export async function carregarUsuarios() {
  try {
    const dados = localStorage.getItem(PREFIXO + 'admin_usuarios');
    if (!dados) {
      const padrao = await usuariosPadraoHashed();
      localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(padrao));
      return padrao;
    }

    const parsed = JSON.parse(dados);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const padrao = await usuariosPadraoHashed();
      localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(padrao));
      return padrao;
    }

    if (parsed[0].senha && !parsed[0].senhaHash) {
      const migrados = await hashLista(parsed);
      localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(migrados));
      return migrados;
    }

    return parsed;
  } catch (e) {
    console.error("Erro ao carregar ou migrar usuários. Resetando para o padrão.", e);
    const padrao = await usuariosPadraoHashed();
    localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(padrao));
    return padrao;
  }
}

export async function salvarUsuarios(usuarios) {
  Armazenamento.salvar('admin_usuarios', usuarios, 0);
}

export async function getDefaultUsuarios() {
  const padrao = await usuariosPadraoHashed();
  return padrao.map(u => ({ ...u }));
}

export { hashPassword };

// Nota: `autenticar()` (fallback client-side de login via SHA-256/localStorage)
// e `gerarTokenSessao()` foram removidos. Eliminação da inconsistência
// arquitetural de dois sistemas de auth desconexos — login agora depende
// exclusivamente de POST /api/auth/login em server.js (bcrypt server-side).
// As funções acima (carregarUsuarios, salvarUsuarios, hashPassword,
// getDefaultUsuarios) permanecem: ainda usadas pelo painel de administração
// local (Admin.vue/useAdmin.js) e pelo espelhamento pós-cadastro em Login.vue,
// que são um recurso separado e não fazem parte do fluxo de login.
