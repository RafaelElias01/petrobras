const API_BASE = '/api/dados';

const Armazenamento = {
  _usaServer: false,
  _iniciada: false,
  _fila: [],

  async _init() {
    try {
      const r = await fetch(`${API_BASE}/config.json`);
      this._usaServer = r.ok;
    } catch {
      this._usaServer = false;
    }
    this._iniciada = true;
  },

  async _aguardarInit() {
    if (!this._iniciada) {
      await this._init();
    }
  },

  async _get(nome) {
    await this._aguardarInit();
    if (!this._usaServer) return null;
    try {
      const r = await fetch(`${API_BASE}/${nome}.json`);
      return r.ok ? await r.json() : null;
    } catch { return null; }
  },

  async _put(nome, dados) {
    await this._aguardarInit();
    if (!this._usaServer) return;
    try {
      await fetch(`${API_BASE}/${nome}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
    } catch { /* fallback */ }
  },

  async _delete(nome, chave) {
    await this._aguardarInit();
    if (!this._usaServer) return;
    try {
      await fetch(`${API_BASE}/${nome}.json/${encodeURIComponent(chave)}`, { method: 'DELETE' });
    } catch { /* fallback */ }
  },

  _mergeObj(server, local) {
    if (!server && !local) return {};
    if (!server) return local || {};
    if (!local) return server;
    return { ...local, ...server };
  },

  _mergeArray(server, local) {
    if (!server && !local) return [];
    if (!server) return local || [];
    if (!local) return server;
    const mapa = new Map();
    [...local, ...server].forEach(item => mapa.set(item.semana, item));
    return [...mapa.values()];
  },

  // --- CheckList ---
  async getChecklist() {
    const server = await this._get('checklist');
    const local = this._carregarLocal('checklist', {});
    const merged = this._mergeObj(server, local);
    this._salvarLocal('checklist', merged);
    if (this._usaServer) this._put('checklist', merged);
    return merged;
  },

  async salvarChecklist(idItem, valor) {
    const lista = await this.getChecklist();
    if (lista[idItem] === valor) return;
    lista[idItem] = valor;
    this._salvarLocal('checklist', lista);
    if (this._usaServer) await this._put('checklist', lista);
  },

  // --- Horas ---
  async getHoras() {
    const server = await this._get('horas');
    const local = this._carregarLocal('horas', {});
    const merged = this._mergeObj(server, local);
    this._salvarLocal('horas', merged);
    if (this._usaServer) this._put('horas', merged);
    return merged;
  },

  async salvarHora(semana, dia, materia, valor) {
    const horas = await this.getHoras();
    if (!horas[semana]) horas[semana] = {};
    if (!horas[semana][dia]) horas[semana][dia] = {};
    horas[semana][dia][materia] = Number(valor) || 0;
    this._salvarLocal('horas', horas);
    if (this._usaServer) await this._put('horas', horas);
  },

  // --- Simulados ---
  async getSimulados() {
    const server = await this._get('simulados');
    const local = this._carregarLocal('simulados', []);
    const merged = this._mergeArray(server, local);
    this._salvarLocal('simulados', merged);
    if (this._usaServer) this._put('simulados', merged);
    return merged;
  },

  async salvarSimulado(simulado) {
    const lista = await this.getSimulados();
    const idx = lista.findIndex(s => s.semana === simulado.semana);
    if (idx >= 0) lista[idx] = simulado;
    else lista.push(simulado);
    this._salvarLocal('simulados', lista);
    if (this._usaServer) await this._put('simulados', lista);
  },

  async removerSimulado(semana) {
    const lista = await this.getSimulados();
    const idx = lista.findIndex(s => s.semana === semana);
    if (idx >= 0) lista.splice(idx, 1);
    this._salvarLocal('simulados', lista);
    if (this._usaServer) await this._put('simulados', lista);
  },

  // --- Config ---
  async getConfig() {
    const server = await this._get('config');
    const local = this._carregarLocal('config', { tema: 'light' });
    const merged = server || local;
    this._salvarLocal('config', merged);
    if (this._usaServer && !server) this._put('config', merged);
    return merged;
  },

  async salvarConfig(config) {
    this._salvarLocal('config', config);
    if (this._usaServer) await this._put('config', config);
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
