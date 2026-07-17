const API_BASE = '/api/dados';

const Armazenamento = {
  _usaServer: undefined, // undefined: não verificado, false: offline, true: online
  _initPromise: null,
  _cache: {},
  _debounceTimers: {},
  _status: 'idle', // 'idle', 'saving', 'saved', 'error'

  _init() {
    if (!this._initPromise) {
      this._initPromise = (async () => {
        try {
          // Um endpoint leve para verificar a conectividade
          const r = await fetch('/api/arquivos');
          this._usaServer = r.ok;
          console.log(`Modo de armazenamento: ${this._usaServer ? 'Servidor' : 'Local'}`);
        } catch {
          this._usaServer = false;
          console.log('Modo de armazenamento: Local (servidor indisponível)');
        }
      })();
    }
    return this._initPromise;
  },

  async _getFromServer(nome) {
    await this._init();
    if (!this._usaServer) return null;
    try {
      const r = await fetch(`${API_BASE}/${nome}.json`);
      return r.ok ? await r.json() : null;
    } catch (err) {
      console.error(`Falha ao buscar '${nome}' do servidor:`, err);
      return null;
    }
  },

  _putToServer(nome, dados, debounceMs = 1000) {
    this._status = 'saving';

    return new Promise((resolve) => {
      // Agrupa múltiplas chamadas para o mesmo endpoint
      if (this._debounceTimers[nome]) {
        clearTimeout(this._debounceTimers[nome].timer);
      }

      const timer = setTimeout(async () => {
        await this._init();
        if (!this._usaServer) return resolve({ ok: true, offline: true });
        try {
          const response = await fetch(`${API_BASE}/${nome}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
          });
          this._status = response.ok ? 'saved' : 'error';
          resolve({ ok: response.ok });
        } catch (err) {
          console.error(`Falha ao salvar '${nome}' no servidor:`, err);
          this._status = 'error';
          resolve({ ok: false, error: err });
        } finally {
          setTimeout(() => { if (this._status !== 'saving') this._status = 'idle'; }, 2000);
        }
      }, debounceMs);

      this._debounceTimers[nome] = { timer, resolve };
    });
  },

  async _deleteFromServer(nome, chave) {
    await this._init();
    if (!this._usaServer) return { ok: true, offline: true };
    try {
      const response = await fetch(`${API_BASE}/${nome}.json/${encodeURIComponent(chave)}`, { method: 'DELETE' });
      return { ok: response.ok };
    } catch (err) {
      console.error(`Falha ao deletar chave '${chave}' de '${nome}' no servidor:`, err);
      return { ok: false, error: err };
    }
  },

  _mergeObj(server, local) {
    // A estratégia de merge pode ser aprimorada, mas para este caso,
    // o dado local (mais recente) tem preferência sobre o do servidor.
    // Garante que ambos sejam objetos para evitar erros com null/undefined.
    const localObj = (typeof local === 'object' && local !== null && !Array.isArray(local)) ? local : {};
    const serverObj = (typeof server === 'object' && server !== null && !Array.isArray(server)) ? server : {};
    return { ...serverObj, ...localObj };
  },

  _mergeArray(server, local) {
    if (!Array.isArray(server)) server = [];
    if (!Array.isArray(local)) local = [];
    
    const mapa = new Map();
    // A chave de identificação pode variar (semana, id, etc.)
    const getKey = (item) => (typeof item === 'object' && item !== null) ? (item.id ?? item.semana) : null;

    // Dados do servidor são a base, dados locais sobrescrevem
    [...server, ...local].forEach(item => {
      const key = getKey(item);
      if (key !== undefined) {
        mapa.set(key, item);
      }
    });
    return [...mapa.values()];
  },

  // --- Métodos Genéricos de Acesso a Dados ---
  async _getData(nome, padrao, tipoMerge = 'obj') {
    if (this._cache[nome]) return this._cache[nome];

    const serverData = await this._getFromServer(nome);
    const localData = this._carregarLocal(nome, padrao);

    const mergedData = tipoMerge === 'array'
      ? this._mergeArray(serverData, localData)
      : this._mergeObj(serverData, localData);

    this._cache[nome] = mergedData;
    this._salvarLocal(nome, mergedData); // Sincroniza o local com o merge
    return this._cache[nome];
  },

  // --- CheckList ---
  getChecklist() {
    return this._getData('checklist', {});
  },

  async salvarChecklist(idItem, valor) {
    const lista = await this.getChecklist();
    lista[idItem] = valor;
    this._salvarLocal('checklist', lista);
    return this._putToServer('checklist', lista);
  },

  // --- Horas ---
  getHoras() {
    return this._getData('horas', {});
  },

  async salvarHora(semana, dia, materia, valor) {
    const horas = await this.getHoras();
    if (!horas[semana]) horas[semana] = {};
    if (!horas[semana][dia]) horas[semana][dia] = {};
    horas[semana][dia][materia] = Number(valor) || 0;
    this._salvarLocal('horas', horas);
    return this._putToServer('horas', horas);
  },

  // --- Simulados ---
  getSimulados() {
    return this._getData('simulados', [], 'array');
  },

  async salvarSimulado(simulado) {
    const lista = await this.getSimulados();
    const idx = lista.findIndex(s => s.semana === simulado.semana);
    if (idx >= 0) lista[idx] = simulado;
    else lista.push(simulado);
    this._salvarLocal('simulados', lista);
    return this._putToServer('simulados', lista);
  },

  async removerSimulado(semana) {
    const lista = await this.getSimulados();
    const idx = lista.findIndex(s => s.semana === semana);
    if (idx >= 0) lista.splice(idx, 1);
    this._salvarLocal('simulados', lista);
    return this._deleteFromServer('simulados', semana);
  },

  // --- Erros (Caderno de Erros) ---
  getErros() {
    return this._getData('erros', [], 'array');
  },

  async salvarErro(erro) {
    const lista = await this.getErros();
    const idx = lista.findIndex(e => e.id === erro.id);
    if (idx >= 0) lista[idx] = erro;
    else lista.push(erro);
    this._salvarLocal('erros', lista);
    return this._putToServer('erros', lista);
  },

  async removerErro(id) {
    const lista = await this.getErros();
    const idx = lista.findIndex(e => e.id === id);
    if (idx >= 0) lista.splice(idx, 1);
    this._salvarLocal('erros', lista);
    return this._deleteFromServer('erros', id);
  },

  // --- Diário (Daily Checklist) ---
  getDiario() {
    return this._getData('diario', {});
  },

  async salvarDiario(data, items) {
    const diario = await this.getDiario();
    diario[data] = items;
    this._salvarLocal('diario', diario);
    return this._putToServer('diario', diario);
  },

  // --- Revisões ---
  getRevisoes() {
    return this._getData('revisoes', [], 'array');
  },

  async salvarRevisao(rev) {
    const lista = await this.getRevisoes();
    const idx = lista.findIndex(r => r.id === rev.id);
    if (idx >= 0) lista[idx] = rev;
    else lista.push(rev);
    this._salvarLocal('revisoes', lista);
    return this._putToServer('revisoes', lista);
  },

  async removerRevisao(id) {
    const lista = await this.getRevisoes();
    const idx = lista.findIndex(r => r.id === id);
    if (idx >= 0) lista.splice(idx, 1);
    this._salvarLocal('revisoes', lista);
    return this._deleteFromServer('revisoes', id);
  },

  // --- Flashcards ---
  getFlashcards() {
    return this._getData('flashcards', [], 'array');
  },

  async salvarFlashcard(card) {
    const lista = await this.getFlashcards();
    const idx = lista.findIndex(f => f.id === card.id);
    if (idx >= 0) {
      lista[idx] = card;
    } else {
      lista.push(card);
    }
    this._salvarLocal('flashcards', lista);
    return this._putToServer('flashcards', lista);
  },

  async removerFlashcard(id) {
    const lista = await this.getFlashcards();
    const idx = lista.findIndex(f => f.id === id);
    if (idx > -1) lista.splice(idx, 1);
    this._salvarLocal('flashcards', lista);
    return this._deleteFromServer('flashcards', id);
  },

  // --- Cronograma (progresso semanal) ---
  async getCronograma() {
    return this._getData('cronograma', {});
  },

  async alternarCronograma(chave, concluido) {
    const prog = await this.getCronograma();
    prog[chave] = concluido;
    this._salvarLocal('cronograma', prog);
    return this._putToServer('cronograma', prog);
  },

  // --- Ciclo (posição atual) ---
  getCiclo() {
    return this._getData('ciclo', { posicao: 0, concluido: {} });
  },

  async salvarCiclo(ciclo) {
    this._salvarLocal('ciclo', ciclo);
    return this._putToServer('ciclo', ciclo);
  },

  // --- Admin (Usuários) ---
  async getAdminUsuarios() {
    const server = await this._getFromServer('admin_usuarios');
    const local = this._carregarLocal('admin_usuarios', null);
    if (server && Array.isArray(server) && server.length > 0) {
      this._salvarLocal('admin_usuarios', server);
      return server;
    }
    if (local && Array.isArray(local) && local.length > 0) return local;
    const padrao = [
      { usuario: 'admin', senha: 'admin123', nome: 'Administrador', role: 'admin' },
      { usuario: 'estudante', senha: 'petro2026', nome: 'Estudante', role: 'user' },
    ];
    this._salvarLocal('admin_usuarios', padrao);
    return padrao;
  },

  async salvarAdminUsuarios(lista) {
    this._salvarLocal('admin_usuarios', lista);
    return this._putToServer('admin_usuarios', lista);
  },

  // --- Config ---
  async getConfig() {
    const server = await this._getFromServer('config');
    const local = this._carregarLocal('config', { tema: 'light' });
    const merged = server || local;
    this._salvarLocal('config', merged);
    if (this._usaServer && !server) this._putToServer('config', merged);
    return merged;
  },

  async salvarConfig(config) {
    this._salvarLocal('config', config);
    return this._putToServer('config', config);
  },

  // --- Fallback localStorage ---
  _prefixo: 'petrobras_quimica_',
  _chave(nome) { return this._prefixo + nome; },

  _salvarLocal(nome, dados) {
    try { localStorage.setItem(this._chave(nome), JSON.stringify(dados)); }
    catch(e) { console.error('localStorage error:', e); }
  },

  _carregarLocal(nome, padrao) {
    try {
      const dados = localStorage.getItem(this._chave(nome));
      return dados ? JSON.parse(dados) : padrao;
    } catch { return padrao; }
  }
};

Armazenamento._init();
