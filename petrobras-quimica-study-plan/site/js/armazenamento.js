const API_BASE = '/api/dados';

const Armazenamento = {
  _usaServer: false,

  async _init() {
    try {
      const r = await fetch(`${API_BASE}/checklist.json`);
      this._usaServer = r.ok;
    } catch {
      this._usaServer = false;
    }
  },

  async _get(nome) {
    if (this._usaServer) {
      try {
        const r = await fetch(`${API_BASE}/${nome}.json`);
        return r.ok ? await r.json() : null;
      } catch { return null; }
    }
    return null;
  },

  async _put(nome, dados) {
    if (this._usaServer) {
      try {
        await fetch(`${API_BASE}/${nome}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
      } catch { /* fallback silencioso */ }
    }
  },

  async _delete(nome, chave) {
    if (this._usaServer) {
      try {
        await fetch(`${API_BASE}/${nome}.json/${encodeURIComponent(chave)}`, { method: 'DELETE' });
      } catch { /* fallback */ }
    }
  },

  // --- CheckList ---
  async getChecklist() {
    const server = await this._get('checklist');
    const local = this._carregarLocal('checklist', {});
    if (server && Object.keys(server).length > Object.keys(local).length) return server;
    return local;
  },

  async salvarChecklist(idItem, valor) {
    const lista = await this.getChecklist();
    lista[idItem] = valor;
    this._salvarLocal('checklist', lista);
    await this._put('checklist', lista);
  },

  // --- Horas ---
  async getHoras() {
    const server = await this._get('horas');
    const local = this._carregarLocal('horas', {});
    if (server && Object.keys(server).length > Object.keys(local).length) return server;
    return local;
  },

  async salvarHora(semana, dia, materia, valor) {
    const horas = await this.getHoras();
    if (!horas[semana]) horas[semana] = {};
    if (!horas[semana][dia]) horas[semana][dia] = {};
    horas[semana][dia][materia] = Number(valor) || 0;
    this._salvarLocal('horas', horas);
    await this._put('horas', horas);
  },

  // --- Simulados ---
  async getSimulados() {
    const server = await this._get('simulados');
    const local = this._carregarLocal('simulados', []);
    if (server && server.length >= local.length) return server;
    return local;
  },

  async salvarSimulado(simulado) {
    const lista = await this.getSimulados();
    const idx = lista.findIndex(s => s.semana === simulado.semana);
    if (idx >= 0) lista[idx] = simulado;
    else lista.push(simulado);
    this._salvarLocal('simulados', lista);
    await this._put('simulados', lista);
  },

  async removerSimulado(semana) {
    const lista = await this.getSimulados();
    const idx = lista.findIndex(s => s.semana === semana);
    if (idx >= 0) lista.splice(idx, 1);
    this._salvarLocal('simulados', lista);
    await this._put('simulados', lista);
  },

  // --- Config ---
  async getConfig() {
    const server = await this._get('config');
    const local = this._carregarLocal('config', { tema: 'light' });
    return server || local;
  },

  async salvarConfig(config) {
    this._salvarLocal('config', config);
    await this._put('config', config);
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

// Inicializar detecção do servidor
Armazenamento._init();
