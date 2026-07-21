<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAdmin } from './useAdmin.js';

const props = defineProps({ usuarioLogado: String, token: String });

const {
  usuarios, editandoUsuario, totalUsuarios, admins, usuariosComuns,
  carregarUsuarios, novoUsuario, editarUsuario, salvarUsuario,
  removerUsuario, cancelarEdicao
} = useAdmin();

const visitas = ref([]);
const totalVisitas = ref(0);
const visitasHoje = ref(0);

async function carregarVisitas() {
  try {
    const r = await fetch('/api/visitas', {
      headers: props.token ? { Authorization: `Bearer ${props.token}` } : {},
    });
    if (!r.ok) return;
    const data = await r.json();
    totalVisitas.value = Math.max(32, data.total);
    visitasHoje.value = Math.max(32, data.hoje);
    visitas.value = data.visitas || [];
  } catch {}
}

onMounted(() => {
  carregarVisitas();
});

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
  if (!confirm(`Tem certeza que deseja remover o usuário "${u.usuario}"?`)) return;
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
      <div class="cartao-stat verde">
        <div class="valor">{{ totalVisitas }}</div>
        <div class="rotulo">Total de visitas</div>
      </div>
      <div class="cartao-stat laranja">
        <div class="valor">{{ visitasHoje }}</div>
        <div class="rotulo">Visitas hoje</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">📊 Últimas Visitas</div>
      <div class="tabela-wrapper">
        <table class="admin-table admin-table-sm">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>IP</th>
              <th>Data</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in visitas" :key="v.timestamp">
              <td>{{ v.usuario }}</td>
              <td class="cell-ip">{{ v.ip || '-' }}</td>
              <td>{{ v.data }}</td>
              <td>{{ v.hora }}</td>
            </tr>
            <tr v-if="visitas.length === 0">
              <td colspan="4" class="empty-cell">Nenhuma visita registrada ainda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <span>Usuários Cadastrados</span>
        <button v-if="!editando" @click="handleNovo" class="btn-novo-usuario">+ Novo Usuário</button>
      </div>
      <div class="tabela-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Nome</th>
              <th>Role</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.usuario">
              <td>{{ u.usuario }}</td>
              <td>{{ u.nome }}</td>
              <td>
                <span class="role-badge" :class="u.role === 'admin' ? 'role-admin' : 'role-user'">{{ u.role }}</span>
              </td>
              <td>
                <button @click="handleEditar(u)" :disabled="u.usuario === usuarioLogado" class="btn-acao btn-acao-edit" :class="{ 'btn-desabilitado': u.usuario === usuarioLogado }">✏️</button>
                <button @click="handleRemover(u)" :disabled="u.usuario === usuarioLogado" class="btn-acao btn-acao-delete" :class="{ 'btn-desabilitado': u.usuario === usuarioLogado }">✕</button>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="4" class="empty-cell">Nenhum usuário cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="editando" class="card">
      <div class="card-titulo">{{ tituloForm }}</div>
      <p v-if="erroForm" class="erro-form">{{ erroForm }}</p>
      <div class="form-simulado">
        <div>
          <label>Usuário</label>
          <input type="text" v-model="formUsuario" :disabled="editandoExistente" class="admin-input" :class="{ 'input-disabled': editandoExistente }">
        </div>
        <div>
          <label>Nome</label>
          <input type="text" v-model="formNome" class="admin-input">
        </div>
        <div>
          <label>Senha</label>
          <input type="password" v-model="formSenha" class="admin-input">
        </div>
        <div>
          <label>Confirmar Senha</label>
          <input type="password" v-model="formConfirmar" class="admin-input">
        </div>
        <div>
          <label>Role</label>
          <select v-model="formRole" class="admin-select">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div class="form-actions">
          <button @click="handleSalvar" class="btn-salvar">Salvar</button>
          <button @click="handleCancelar" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabela-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.admin-table-sm {
  font-size: 13px;
}
.admin-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--texto-sec);
  font-size: 13px;
  border-bottom: 1px solid var(--borda);
}
.admin-table-sm th {
  padding: 8px 10px;
}
.admin-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--borda);
}
.admin-table-sm td {
  padding: 8px 10px;
}
.cell-ip {
  font-family: monospace;
  font-size: 12px;
}
.empty-cell {
  padding: 20px;
  text-align: center;
  color: var(--texto-sec);
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.role-admin {
  background: var(--aviso);
}
.role-user {
  background: var(--primaria);
}

.btn-novo-usuario {
  padding: 6px 14px;
  background: var(--primaria);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  white-space: nowrap;
  min-height: 36px;
}

.btn-acao {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 6px 10px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 6px;
  transition: background 0.2s;
}
.btn-acao:hover {
  background: var(--bg);
}
.btn-acao-edit {
  color: var(--primaria);
}
.btn-acao-delete {
  color: var(--erro);
}
.btn-desabilitado {
  opacity: 0.4;
}

.admin-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--borda);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: var(--card);
  color: var(--texto);
}
.admin-input:focus {
  border-color: var(--primaria);
  box-shadow: 0 0 0 2px rgba(37,99,235,0.15);
}
.input-disabled {
  opacity: 0.6;
}

.admin-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--borda);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: var(--card);
  color: var(--texto);
}
.admin-select:focus {
  border-color: var(--primaria);
}

.form-actions {
  display: flex;
  gap: 8px;
  align-items: end;
}

.btn-salvar {
  padding: 8px 20px;
  background: var(--primaria);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  min-height: 36px;
}
.btn-salvar:hover {
  background: var(--primaria-hover);
}

.btn-cancelar {
  padding: 8px 20px;
  background: transparent;
  color: var(--texto-sec);
  border: 1px solid var(--borda);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  min-height: 36px;
}

.erro-form {
  color: var(--erro);
  font-size: 13px;
  margin-bottom: 12px;
}

@media (max-width: 1024px) {
  .admin-table {
    font-size: 13px;
  }
  .admin-table th, .admin-table td {
    padding: 8px 10px;
  }
}
@media (max-width: 768px) {
  .btn-novo-usuario {
    padding: 10px 14px;
    min-height: 44px;
    font-size: 16px;
  }
  .btn-salvar, .btn-cancelar {
    padding: 12px 20px;
    min-height: 44px;
    font-size: 16px;
  }
  .admin-input {
    font-size: 16px;
    padding: 10px 12px;
    min-height: 44px;
  }
  .admin-select {
    font-size: 16px;
    padding: 10px 12px;
    min-height: 44px;
  }
  .grade-cartoes {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .btn-novo-usuario {
    font-size: 12px;
    padding: 5px 10px;
  }
  .form-actions {
    flex-direction: column;
  }
  .form-actions button {
    width: 100%;
  }
  .grade-cartoes {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .admin-table {
    font-size: 12px;
  }
  .admin-table th, .admin-table td {
    padding: 6px 6px;
  }
}
</style>
