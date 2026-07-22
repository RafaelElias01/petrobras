<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAdmin } from './useAdmin.js';

const props = defineProps({ usuarioLogado: String, token: { type: String, default: '' } });

const {
  usuarios, editandoUsuario, carregando, erro, totalUsuarios, admins, usuariosComuns,
  setToken, carregarUsuarios, novoUsuario, editarUsuario, salvarUsuario,
  removerUsuario, cancelarEdicao
} = useAdmin();

const visitas = ref([]);
const totalVisitas = ref(0);
const visitasHoje = ref(0);
const visitantesUnicos = ref(0);
const visitasPorDia = ref([]);
const visitasPorPagina = ref([]);

const filtroData = ref('');
const filtroUsuario = ref('');
const filtroIp = ref('');
const erroVisitas = ref('');

async function carregarVisitas() {
  try {
    const r = await fetch('/api/visitas', {
      headers: props.token ? { Authorization: `Bearer ${props.token}` } : {},
    });
    if (!r.ok) {
      // Sem isso, uma falha aqui deixa todos os cartões em 0/vazio --
      // indistinguível de "site realmente sem visitas" pro admin.
      erroVisitas.value = 'Não foi possível carregar as estatísticas de visitas.';
      return;
    }
    const data = await r.json();
    totalVisitas.value = data.total;
    visitasHoje.value = data.hoje;
    visitantesUnicos.value = data.unicos || 0;
    visitasPorDia.value = data.porDia || [];
    visitasPorPagina.value = data.porPagina || [];
    visitas.value = data.visitas || [];
    erroVisitas.value = '';
  } catch {
    erroVisitas.value = 'Não foi possível carregar as estatísticas de visitas.';
  }
}

onMounted(() => {
  carregarVisitas();
  setToken(props.token);
  carregarUsuarios();
});

const visitasFiltradas = computed(() => {
  return visitas.value.filter(v => {
    if (filtroData.value && v.data !== filtroData.value) return false;
    if (filtroUsuario.value && !v.usuario.toLowerCase().includes(filtroUsuario.value.toLowerCase())) return false;
    if (filtroIp.value && !String(v.ip || '').includes(filtroIp.value)) return false;
    return true;
  });
});

const maxVisitasDia = computed(() => Math.max(1, ...visitasPorDia.value.map(d => d.total)));

const NOMES_PAGINA = {
  dashboard: 'Dashboard', checklist: 'Conteúdos', ciclo: 'Ciclo de Estudos',
  horas: 'Quadro de Horas', simulados: 'Simulados', erros: 'Caderno de Erros',
  flashcards: 'Flashcards', diario: 'Diário', relatorio: 'Relatório',
  exercicios: 'Exercícios', plano: 'Plano', admin: 'Admin'
};
function nomePagina(p) {
  return NOMES_PAGINA[p] || p;
}

const formUsuario = ref('');
const formNome = ref('');
const formSenha = ref('');
const formConfirmar = ref('');
const formRole = ref('user');
const formPremium = ref(false);
const erroForm = ref('');

watch(editandoUsuario, (e) => {
  if (e) {
    formUsuario.value = e.usuario || '';
    formNome.value = e.nome || '';
    formSenha.value = '';
    formConfirmar.value = '';
    formRole.value = e.role || 'user';
    formPremium.value = e.premium === true;
    erroForm.value = '';
  }
});

async function handleSalvar() {
  erroForm.value = '';
  const senhaObrigatoria = !editandoExistente.value;
  if (!formUsuario.value.trim() || !formNome.value.trim() || (senhaObrigatoria && (!formSenha.value.trim() || !formConfirmar.value.trim()))) {
    erroForm.value = 'Todos os campos são obrigatórios.';
    return;
  }
  if (formUsuario.value.trim().length < 3) {
    erroForm.value = 'Usuário deve ter no mínimo 3 caracteres.';
    return;
  }
  if (formSenha.value && formSenha.value.length < 3) {
    erroForm.value = 'Senha deve ter no mínimo 3 caracteres.';
    return;
  }
  if (formSenha.value !== formConfirmar.value) {
    erroForm.value = 'Senhas não conferem.';
    return;
  }
  await salvarUsuario({
    usuario: formUsuario.value.trim(),
    nome: formNome.value.trim(),
    senha: formSenha.value,
    role: formRole.value,
    premium: formPremium.value,
  });
  if (erro.value) erroForm.value = erro.value;
}

function handleEditar(u) {
  editarUsuario(u);
}

async function handleRemover(u) {
  if (u.usuario === props.usuarioLogado) return;
  if (!confirm(`Tem certeza que deseja remover o usuário "${u.usuario}"?`)) return;
  await removerUsuario(u.usuario);
}

function handleNovo() {
  formUsuario.value = '';
  formNome.value = '';
  formSenha.value = '';
  formConfirmar.value = '';
  formRole.value = 'user';
  formPremium.value = false;
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
    <p v-if="erroVisitas" class="erro-form" role="alert">⚠ {{ erroVisitas }}</p>
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
      <div class="cartao-stat roxo">
        <div class="valor">{{ visitantesUnicos }}</div>
        <div class="rotulo">Visitantes únicos</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">📈 Visitas por dia (últimos 30 dias)</div>
      <div class="grafico-visitas" v-if="visitasPorDia.length">
        <div class="grafico-barra-wrap" v-for="d in visitasPorDia" :key="d.data" :title="`${d.data}: ${d.total} visita(s)`">
          <div class="grafico-barra" :style="{ height: (d.total / maxVisitasDia * 100) + '%' }"></div>
          <span class="grafico-label">{{ d.data.slice(5) }}</span>
        </div>
      </div>
      <p v-else class="empty-cell">Sem dados suficientes ainda.</p>
    </div>

    <div class="card">
      <div class="card-titulo">📄 Visitas por página</div>
      <div class="tabela-wrapper">
        <table class="admin-table admin-table-sm">
          <thead>
            <tr><th>Página</th><th>Visitas</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in visitasPorPagina" :key="p.pagina">
              <td>{{ nomePagina(p.pagina) }}</td>
              <td>{{ p.total }}</td>
            </tr>
            <tr v-if="visitasPorPagina.length === 0">
              <td colspan="2" class="empty-cell">Nenhuma visita registrada ainda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">📊 Últimas Visitas</div>
      <div class="filtros-visitas">
        <input type="date" v-model="filtroData" class="admin-input" placeholder="Data">
        <input type="text" v-model="filtroUsuario" class="admin-input" placeholder="Filtrar por usuário">
        <input type="text" v-model="filtroIp" class="admin-input" placeholder="Filtrar por IP">
      </div>
      <div class="tabela-wrapper">
        <table class="admin-table admin-table-sm">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Página</th>
              <th>IP</th>
              <th>Data</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in visitasFiltradas" :key="v.timestamp">
              <td>{{ v.usuario }}</td>
              <td>{{ nomePagina(v.pagina) }}</td>
              <td class="cell-ip">{{ v.ip || '-' }}</td>
              <td>{{ v.data }}</td>
              <td>{{ v.hora }}</td>
            </tr>
            <tr v-if="visitasFiltradas.length === 0">
              <td colspan="5" class="empty-cell">Nenhuma visita encontrada.</td>
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
      <p v-if="erro" class="erro-form" role="alert">⚠ {{ erro }}</p>
      <div class="tabela-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Premium</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.usuario">
              <td>{{ u.usuario }}</td>
              <td>{{ u.nome }}</td>
              <td>{{ u.email || '—' }}</td>
              <td>
                <span class="role-badge" :class="u.role === 'admin' ? 'role-admin' : 'role-user'">{{ u.role }}</span>
              </td>
              <td>
                <span v-if="u.premium" class="role-badge role-premium">👑 premium</span>
                <span v-else class="rotulo-sutil">—</span>
              </td>
              <td>
                <button @click="handleEditar(u)" :disabled="u.usuario === usuarioLogado" class="btn-acao btn-acao-edit" :class="{ 'btn-desabilitado': u.usuario === usuarioLogado }" :aria-label="`Editar usuário ${u.usuario}`">✏️</button>
                <button @click="handleRemover(u)" :disabled="u.usuario === usuarioLogado" class="btn-acao btn-acao-delete" :class="{ 'btn-desabilitado': u.usuario === usuarioLogado }" :aria-label="`Remover usuário ${u.usuario}`">✕</button>
              </td>
            </tr>
            <tr v-if="carregando && usuarios.length === 0">
              <td colspan="6" class="empty-cell">Carregando usuários...</td>
            </tr>
            <tr v-else-if="usuarios.length === 0">
              <td colspan="6" class="empty-cell">Nenhum usuário cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="editando" class="card">
      <div class="card-titulo">{{ tituloForm }}</div>
      <p v-if="erroForm" class="erro-form" role="alert">{{ erroForm }}</p>
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
        <div class="campo-checkbox">
          <label class="label-checkbox">
            <input type="checkbox" v-model="formPremium">
            👑 Premium (concede manualmente, ex: pagamento combinado fora do Mercado Pago)
          </label>
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

.grafico-visitas {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 140px;
  padding: 8px 4px 0;
  overflow-x: auto;
}
.grafico-barra-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 18px;
  flex: 1;
  height: 100%;
  cursor: default;
}
.grafico-barra {
  width: 100%;
  min-height: 2px;
  background: var(--primaria);
  border-radius: 3px 3px 0 0;
  transition: background 0.15s;
}
.grafico-barra-wrap:hover .grafico-barra {
  background: var(--primaria-hover);
}
.grafico-label {
  font-size: 10px;
  color: var(--texto-sec);
  margin-top: 6px;
  writing-mode: vertical-rl;
  white-space: nowrap;
}

.filtros-visitas {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.filtros-visitas .admin-input {
  width: auto;
  min-width: 160px;
  flex: 1;
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
  color: #241d15;
}
.role-user {
  background: var(--primaria);
}
.role-premium {
  background: #b5561f;
}
.rotulo-sutil {
  color: var(--texto-sec);
}

.campo-checkbox {
  grid-column: 1 / -1;
}
.label-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--texto);
  cursor: pointer;
}
.label-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
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
