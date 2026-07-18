import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { getDefaultUsuarios, hashPassword } from './usuarios.js';

let instance;

export function useAdmin() {
  if (instance) return instance;

  const usuarios = ref([]);
  const editandoUsuario = ref(null);
  const carregado = ref(false);

  const totalUsuarios = computed(() => usuarios.value.length);
  const admins = computed(() => usuarios.value.filter(u => u.role === 'admin'));
  const usuariosComuns = computed(() => usuarios.value.filter(u => u.role === 'user'));

  watch(usuarios, (novoValor) => {
    Armazenamento.salvar('admin_usuarios', novoValor);
  }, { deep: true });

  async function carregarUsuarios() {
    if (carregado.value) return;
    const data = await Armazenamento.carregar('admin_usuarios', null);
    if (data && Array.isArray(data) && data.length > 0) {
      if (data[0].senha && !data[0].senhaHash) {
        const migrados = await Promise.all(data.map(async u => ({
          ...u,
          senhaHash: await hashPassword(u.senha),
          senha: undefined
        })));
        usuarios.value = migrados;
        Armazenamento.salvar('admin_usuarios', migrados);
      } else {
        usuarios.value = data;
      }
    } else {
      usuarios.value = getDefaultUsuarios();
    }
    carregado.value = true;
  }

  function novoUsuario() {
    editandoUsuario.value = { usuario: '', senha: '', nome: '', role: 'user' };
  }

  function editarUsuario(u) {
    editandoUsuario.value = { ...u, senha: '' };
  }

  async function salvarUsuario() {
    if (!editandoUsuario.value) return;
    const u = { ...editandoUsuario.value };
    if (!u.usuario || !u.nome) return;
    const idx = usuarios.value.findIndex(ex => ex.usuario === u.usuario);
    if (idx > -1) {
      if (u.senha) {
        u.senhaHash = await hashPassword(u.senha);
      } else {
        u.senhaHash = usuarios.value[idx].senhaHash;
      }
      u.senha = undefined;
      usuarios.value[idx] = u;
    } else {
      if (!u.senha) return;
      u.senhaHash = await hashPassword(u.senha);
      u.senha = undefined;
      usuarios.value.push(u);
    }
    editandoUsuario.value = null;
  }

  function removerUsuario(usuario, loggedInUser) {
    if (loggedInUser && usuario === loggedInUser) return;
    usuarios.value = usuarios.value.filter(u => u.usuario !== usuario);
  }

  function cancelarEdicao() {
    editandoUsuario.value = null;
  }

  instance = {
    usuarios, editandoUsuario, carregado,
    totalUsuarios, admins, usuariosComuns,
    carregarUsuarios, novoUsuario, editarUsuario,
    salvarUsuario, removerUsuario, cancelarEdicao
  };
  return instance;
}
