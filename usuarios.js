const PREFIXO = 'petrobras_quimica_';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const USUARIOS_PADRAO_HASHED = [
  { usuario: 'admin', senhaHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', nome: 'Administrador', role: 'admin' },
  { usuario: 'estudante', senhaHash: '27a38ce6a60ec2e7dad1476796ae3a5c4c14d21a353f4d33eb560a653257f277', nome: 'Estudante', role: 'user' },
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
    if (dados) {
      const parsed = JSON.parse(dados);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (parsed[0].senha && !parsed[0].senhaHash) {
          const migrados = await hashLista(parsed);
          localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(migrados));
          return migrados;
        }
        return parsed;
      }
    }
  } catch {}
  if (!localStorage.getItem(PREFIXO + 'admin_usuarios')) {
    localStorage.setItem(PREFIXO + 'admin_usuarios', JSON.stringify(USUARIOS_PADRAO_HASHED));
  }
  return USUARIOS_PADRAO_HASHED;
}

export function getDefaultUsuarios() {
  return USUARIOS_PADRAO_HASHED.map(u => ({ ...u }));
}

export { hashPassword };

export async function autenticar(usuario, senha) {
  const lista = await carregarUsuarios();
  const senhaHash = await hashPassword(senha);
  const encontrado = lista.find(u => u.usuario === usuario && u.senhaHash === senhaHash);
  if (!encontrado) return null;
  return { usuario: encontrado.usuario, nome: encontrado.nome, role: encontrado.role };
}

export function gerarTokenSessao() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
