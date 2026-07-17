const PREFIXO = 'petrobras_quimica_';

export const USUARIOS_PADRAO = [
  { usuario: 'admin', senha: 'admin123', nome: 'Administrador', role: 'admin' },
  { usuario: 'estudante', senha: 'petro2026', nome: 'Estudante', role: 'user' },
];

export function carregarUsuarios() {
  try {
    const dados = localStorage.getItem(PREFIXO + 'admin_usuarios');
    if (dados) {
      const parsed = JSON.parse(dados);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return USUARIOS_PADRAO;
}

export function autenticar(usuario, senha) {
  const lista = carregarUsuarios();
  const encontrado = lista.find(u => u.usuario === usuario && u.senha === senha);
  if (!encontrado) return null;
  return { usuario: encontrado.usuario, nome: encontrado.nome, role: encontrado.role };
}
