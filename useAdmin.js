import { ref, computed, watch } from 'vue';
import { Armazenamento } from './armazenamento.js';
import { USUARIOS_PADRAO } from './usuarios.js';

let instance;

export function useAdmin() {
  if (instance) return instance;

  const usuarios = ref(Armazenamento.carregar('admin_usuarios', USUARIOS_PADRAO));
  const editandoUsuario = ref(null);
  const carregado = ref(false);

  const totalUsuarios = computed(() => usuarios.value.length);
  const admins = computed(() => usuarios.value.filter(u => u.role === 'admin'));
  const usuariosComuns = computed(() => usuarios.value.filter(u => u.role === 'user'));

  watch(usuarios, (novoValor) => {
    Armazenamento.salvar('admin_usuarios', novoValor);
  }, { deep: true });

  function carregarUsuarios() {
    if (carregado.value) return;
    usuarios.value = Armazenamento.carregar('admin_usuarios', USUARIOS_PADRAO);
    carregado.value = true;
  }

  function novoUsuario() {
    editandoUsuario.value = { usuario: '', senha: '', nome: '', role: 'user' };
  }

  function editarUsuario(u) {
    editandoUsuario.value = { ...u };
  }

  function salvarUsuario() {
    if (!editandoUsuario.value) return;
    const u = { ...editandoUsuario.value };
    if (!u.usuario || !u.senha || !u.nome) return;
    const idx = usuarios.value.findIndex(ex => ex.usuario === u.usuario);
    if (idx > -1) {
      usuarios.value[idx] = u;
    } else {
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
