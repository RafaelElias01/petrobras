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
    const arrServer = Array.isArray(server) ? server : null;
    const arrLocal = Array.isArray(local) ? local : null;
    if (!arrServer && !arrLocal) return [];
    if (!arrServer) return arrLocal;
    if (!arrLocal) return arrServer;
    const mapa = new Map();
    [...arrLocal, ...arrServer].forEach(item => mapa.set(item.semana, item));
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

  // --- Erros (Caderno de Erros) ---
  async getErros() {
    const server = await this._get('erros');
    const local = this._carregarLocal('erros', []);
    const merged = this._mergeArray(server, local);
    this._salvarLocal('erros', merged);
    if (this._usaServer) this._put('erros', merged);
    return merged;
  },

  async salvarErro(erro) {
    const lista = await this.getErros();
    const idx = lista.findIndex(e => e.id === erro.id);
    if (idx >= 0) lista[idx] = erro;
    else lista.push(erro);
    this._salvarLocal('erros', lista);
    if (this._usaServer) await this._put('erros', lista);
  },

  async removerErro(id) {
    const lista = await this.getErros();
    const idx = lista.findIndex(e => e.id === id);
    if (idx >= 0) lista.splice(idx, 1);
    this._salvarLocal('erros', lista);
    if (this._usaServer) await this._put('erros', lista);
  },

  // --- Diário (Daily Checklist) ---
  async getDiario() {
    const server = await this._get('diario');
    const local = this._carregarLocal('diario', {});
    const merged = this._mergeObj(server, local);
    this._salvarLocal('diario', merged);
    if (this._usaServer) this._put('diario', merged);
    return merged;
  },

  async salvarDiario(data, items) {
    const diario = await this.getDiario();
    diario[data] = items;
    this._salvarLocal('diario', diario);
    if (this._usaServer) await this._put('diario', diario);
  },

  // --- Revisões ---
  async getRevisoes() {
    const server = await this._get('revisoes');
    const local = this._carregarLocal('revisoes', []);
    const merged = this._mergeArray(server, local);
    this._salvarLocal('revisoes', merged);
    if (this._usaServer) this._put('revisoes', merged);
    return merged;
  },

  async salvarRevisao(rev) {
    const lista = await this.getRevisoes();
    const idx = lista.findIndex(r => r.id === rev.id);
    if (idx >= 0) lista[idx] = rev;
    else lista.push(rev);
    this._salvarLocal('revisoes', lista);
    if (this._usaServer) await this._put('revisoes', lista);
  },

  async removerRevisao(id) {
    const lista = await this.getRevisoes();
    const idx = lista.findIndex(r => r.id === id);
    if (idx >= 0) lista.splice(idx, 1);
    this._salvarLocal('revisoes', lista);
    if (this._usaServer) await this._put('revisoes', lista);
  },

  // --- Ciclo (posição atual) ---
  async getCiclo() {
    const server = await this._get('ciclo');
    const local = this._carregarLocal('ciclo', { posicao: 0, concluido: {} });
    const merged = this._mergeObj(server, local);
    this._salvarLocal('ciclo', merged);
    if (this._usaServer) this._put('ciclo', merged);
    return merged;
  },

  async salvarCiclo(ciclo) {
    this._salvarLocal('ciclo', ciclo);
    if (this._usaServer) await this._put('ciclo', ciclo);
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
