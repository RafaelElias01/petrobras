import { ref, computed } from 'vue';

let instance;

// Fonte de dados: API do servidor (dados/usuarios.json), não mais
// localStorage. O painel precisa enxergar os cadastros reais feitos via
// POST /api/auth/register, então o servidor é a única fonte de verdade.
export function useAdmin() {
  if (instance) return instance;

  const usuarios = ref([]);
  const editandoUsuario = ref(null);
  const carregado = ref(false);
  const carregando = ref(false);
  const erro = ref('');
  const token = ref('');

  const totalUsuarios = computed(() => usuarios.value.length);
  const admins = computed(() => usuarios.value.filter(u => u.role === 'admin').length);
  const usuariosComuns = computed(() => usuarios.value.filter(u => u.role !== 'admin').length);

  function setToken(novoToken) {
    token.value = novoToken || '';
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
    };
  }

  async function carregarUsuarios(force = false) {
    if (carregado.value && !force) return;
    carregando.value = true;
    erro.value = '';
    try {
      const res = await fetch('/api/admin/usuarios', { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) {
        erro.value = data.erro || 'Erro ao carregar usuários';
        return;
      }
      usuarios.value = data;
      carregado.value = true;
    } catch (e) {
      erro.value = 'Erro de conexão com o servidor';
    } finally {
      carregando.value = false;
    }
  }

  function novoUsuario() {
    editandoUsuario.value = { usuario: '', senha: '', nome: '', role: 'user' };
  }

  function editarUsuario(u) {
    editandoUsuario.value = { ...u, senha: '' };
  }

  async function salvarUsuario(dados) {
    const u = { ...(dados || editandoUsuario.value) };
    if (!u.usuario || !u.nome) return;
    erro.value = '';
    const existente = usuarios.value.find(ex => ex.usuario === u.usuario);
    try {
      let res, data;
      if (existente) {
        res = await fetch(`/api/admin/usuarios/${encodeURIComponent(u.usuario)}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ nome: u.nome, role: u.role, senha: u.senha || undefined }),
        });
        data = await res.json();
        if (!res.ok) { erro.value = data.erro || 'Erro ao salvar usuário'; return; }
        const idx = usuarios.value.findIndex(ex => ex.usuario === u.usuario);
        usuarios.value[idx] = data;
      } else {
        if (!u.senha) return;
        res = await fetch('/api/admin/usuarios', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ usuario: u.usuario, nome: u.nome, senha: u.senha, role: u.role }),
        });
        data = await res.json();
        if (!res.ok) { erro.value = data.erro || 'Erro ao criar usuário'; return; }
        usuarios.value.push(data);
      }
      editandoUsuario.value = null;
    } catch (e) {
      erro.value = 'Erro de conexão com o servidor';
    }
  }

  async function removerUsuario(usuario, loggedInUser) {
    if (loggedInUser && usuario === loggedInUser) return;
    erro.value = '';
    try {
      const res = await fetch(`/api/admin/usuarios/${encodeURIComponent(usuario)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { erro.value = data.erro || 'Erro ao remover usuário'; return; }
      usuarios.value = usuarios.value.filter(u => u.usuario !== usuario);
    } catch (e) {
      erro.value = 'Erro de conexão com o servidor';
    }
  }

  function cancelarEdicao() {
    editandoUsuario.value = null;
  }

  instance = {
    usuarios, editandoUsuario, carregado, carregando, erro,
    totalUsuarios, admins, usuariosComuns,
    setToken, carregarUsuarios, novoUsuario, editarUsuario,
    salvarUsuario, removerUsuario, cancelarEdicao
  };
  return instance;
}
