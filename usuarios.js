const PREFIXO = 'petrobras_quimica_';
import { Armazenamento } from './armazenamento.js';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const USUARIOS_PADRAO_HASHED = [
  { usuario: 'admin', senhaHash: 'a6035b25e8694b3ccef86d66b713e003340782642f8876a1a9fc738724eaa8e6', nome: 'Administrador', role: 'admin' },
  { usuario: 'estudante', senhaHash: '1cf9665547766da64f3e5d8e57222fc171028125298ad015ce194b2e5e3a024e', nome: 'Estudante', role: 'user' },
];

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
      localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(USUARIOS_PADRAO_HASHED));
      return USUARIOS_PADRAO_HASHED;
    }

    const parsed = JSON.parse(dados);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(USUARIOS_PADRAO_HASHED));
      return USUARIOS_PADRAO_HASHED;
    }

    if (parsed[0].senha && !parsed[0].senhaHash) {
      const migrados = await hashLista(parsed);
      localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(migrados));
      return migrados;
    }

    const adminLocal = parsed.find(u => u.usuario === 'admin');
    const adminDefault = USUARIOS_PADRAO_HASHED.find(u => u.usuario === 'admin');
    if (adminLocal && adminDefault && adminLocal.senhaHash !== adminDefault.senhaHash) {
      const atualizados = parsed.map(u => {
        const def = USUARIOS_PADRAO_HASHED.find(d => d.usuario === u.usuario);
        return def && def.role === 'admin' ? { ...u, senhaHash: def.senhaHash } : u;
      });
      localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(atualizados));
      return atualizados;
    }

    return parsed;
  } catch (e) {
    console.error("Erro ao carregar ou migrar usuários. Resetando para o padrão.", e);
    localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(USUARIOS_PADRAO_HASHED));
    return USUARIOS_PADRAO_HASHED;
  }
}

export async function salvarUsuarios(usuarios) {
  Armazenamento.salvar('admin_usuarios', usuarios, 0);
}

export function getDefaultUsuarios() {
  return USUARIOS_PADRAO_HASHED.map(u => ({ ...u }));
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
