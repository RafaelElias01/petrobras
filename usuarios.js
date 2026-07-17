export const USUARIOS = [
  { usuario: 'admin', senha: 'admin123', nome: 'Administrador', role: 'admin' },
  { usuario: 'estudante', senha: 'petro2026', nome: 'Estudante', role: 'user' },
];

export function autenticar(usuario, senha) {
  const encontrado = USUARIOS.find(u => u.usuario === usuario && u.senha === senha);
  if (!encontrado) return null;
  return { usuario: encontrado.usuario, nome: encontrado.nome, role: encontrado.role };
}
