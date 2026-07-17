<script setup>
import { ref, computed, watch } from 'vue';
import { useAdmin } from './useAdmin.js';

const props = defineProps({ usuarioLogado: String });

const {
  usuarios, editandoUsuario, totalUsuarios, admins, usuariosComuns,
  carregarUsuarios, novoUsuario, editarUsuario, salvarUsuario,
  removerUsuario, cancelarEdicao
} = useAdmin();

const formUsuario = ref('');
const formNome = ref('');
const formSenha = ref('');
const formConfirmar = ref('');
const formRole = ref('user');
const erroForm = ref('');

watch(editandoUsuario, (e) => {
  if (e) {
    formUsuario.value = e.usuario || '';
    formNome.value = e.nome || '';
    formSenha.value = '';
    formConfirmar.value = '';
    formRole.value = e.role || 'user';
    erroForm.value = '';
  }
});

function handleSalvar() {
  erroForm.value = '';
  if (!formUsuario.value.trim() || !formNome.value.trim() || !formSenha.value.trim() || !formConfirmar.value.trim()) {
    erroForm.value = 'Todos os campos são obrigatórios.';
    return;
  }
  if (formUsuario.value.trim().length < 3) {
    erroForm.value = 'Usuário deve ter no mínimo 3 caracteres.';
    return;
  }
  if (formSenha.value.length < 3) {
    erroForm.value = 'Senha deve ter no mínimo 3 caracteres.';
    return;
  }
  if (formSenha.value !== formConfirmar.value) {
    erroForm.value = 'Senhas não conferem.';
    return;
  }
  salvarUsuario({
    usuario: formUsuario.value.trim(),
    nome: formNome.value.trim(),
    senha: formSenha.value,
    role: formRole.value,
  });
}

function handleEditar(u) {
  editarUsuario(u);
}

function handleRemover(u) {
  if (u.usuario === props.usuarioLogado) return;
  removerUsuario(u.usuario);
}

function handleNovo() {
  formUsuario.value = '';
  formNome.value = '';
  formSenha.value = '';
  formConfirmar.value = '';
  formRole.value = 'user';
  erroForm.value = '';
  novoUsuario();
}

function handleCancelar() {
  cancelarEdicao();
}

const editando = computed(() => editandoUsuario.value !== null);
const editandoExistente = computed(() => editandoUsuario.value && editandoUsuario.value.usuario);
const tituloForm = computed(() => editandoExistente.value ? 'Editar Usuário' : 'Novo Usuário');
</script>

<template>
  <div>
    <div class="grade-cartoes">
      <div class="cartao-stat">
        <div class="valor">{{ totalUsuarios }}</div>
        <div class="rotulo">Total de usuários</div>
      </div>
      <div class="cartao-stat">
        <div class="valor">{{ admins }}</div>
        <div class="rotulo">Administradores</div>
      </div>
      <div class="cartao-stat">
        <div class="valor">{{ usuariosComuns }}</div>
        <div class="rotulo">Usuários</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Usuários Cadastrados</span>
        <button v-if="!editando" @click="handleNovo" style="padding:6px 14px;background:var(--primaria);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit;">+ Novo Usuário</button>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:var(--texto-sec);font-size:13px;border-bottom:1px solid var(--borda);">Usuário</th>
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:var(--texto-sec);font-size:13px;border-bottom:1px solid var(--borda);">Nome</th>
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:var(--texto-sec);font-size:13px;border-bottom:1px solid var(--borda);">Role</th>
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:var(--texto-sec);font-size:13px;border-bottom:1px solid var(--borda);">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.usuario">
            <td style="padding:10px 12px;border-bottom:1px solid var(--borda);">{{ u.usuario }}</td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--borda);">{{ u.nome }}</td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--borda);">
              <span :style="{background:u.role==='admin'?'var(--aviso)':'var(--primaria)',color:'#fff',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',fontWeight:600}">{{ u.role }}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid var(--borda);">
              <button @click="handleEditar(u)" :disabled="u.usuario === usuarioLogado" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px 8px;" :style="{opacity: u.usuario === usuarioLogado ? 0.4 : 1, color: 'var(--primaria)'}">✏️</button>
              <button @click="handleRemover(u)" :disabled="u.usuario === usuarioLogado" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px 8px;" :style="{opacity: u.usuario === usuarioLogado ? 0.4 : 1, color: 'var(--erro)'}">✕</button>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="4" style="padding:20px;text-align:center;color:var(--texto-sec);">Nenhum usuário cadastrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="editando" class="card">
      <div class="card-titulo">{{ tituloForm }}</div>
      <p v-if="erroForm" style="color:var(--erro);font-size:13px;margin-bottom:12px;">{{ erroForm }}</p>
      <div class="form-simulado">
        <div>
          <label>Usuário</label>
          <input type="text" v-model="formUsuario" :disabled="editandoExistente" :style="{opacity: editandoExistente ? 0.6 : 1}">
        </div>
        <div>
          <label>Nome</label>
          <input type="text" v-model="formNome">
        </div>
        <div>
          <label>Senha</label>
          <input type="password" v-model="formSenha">
        </div>
        <div>
          <label>Confirmar Senha</label>
          <input type="password" v-model="formConfirmar">
        </div>
        <div>
          <label>Role</label>
          <select v-model="formRole" style="width:100%;padding:8px 10px;border:1px solid var(--borda);border-radius:6px;font-size:14px;font-family:inherit;outline:none;background:var(--card);color:var(--texto);">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;align-items:end;">
          <button @click="handleSalvar" style="padding:8px 20px;background:var(--primaria);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-family:inherit;">Salvar</button>
          <button @click="handleCancelar" style="padding:8px 20px;background:transparent;color:var(--texto-sec);border:1px solid var(--borda);border-radius:6px;cursor:pointer;font-size:14px;font-family:inherit;">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>
