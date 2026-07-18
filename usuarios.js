const PREFIXO = 'petrobras_quimica_';
import { Armazenamento } from './armazenamento.js';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const USUARIOS_PADRAO_HASHED = [
  { usuario: 'admin', senhaHash: 'a882a1c625f7558e72c23e62ccc60900d3f5b9003aefd278500996ea20fd55e4', nome: 'Administrador', role: 'admin' },
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

export async function autenticar(usuario, senha) {
  const lista = await carregarUsuarios();
  const senhaHash = await hashPassword(senha);
  const encontrado = lista.find(u => u.usuario.toLowerCase() === usuario.toLowerCase() && u.senhaHash === senhaHash);

  if (!encontrado) return null;

  return { usuario: encontrado.usuario, nome: encontrado.nome, role: encontrado.role };
}

export function gerarTokenSessao() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
