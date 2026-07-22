// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// armazenamento.js exporta um singleton simples (não é composable com `let
// instance` reiniciável por vi.resetModules() de forma útil, pois
// debounceTimers/saveStatus são module-level) — ainda assim resetamos
// módulos entre testes para isolar debounceTimers de um teste para outro.
async function montarArmazenamento() {
  vi.resetModules();
  const mod = await import('../../armazenamento.js');
  return mod;
}

describe('Armazenamento', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('carregar() retorna o valor padrão quando a chave não existe', async () => {
    const { Armazenamento } = await montarArmazenamento();
    expect(Armazenamento.carregar('inexistente', 'padrao')).toBe('padrao');
    expect(Armazenamento.carregar('inexistente2', [1, 2])).toEqual([1, 2]);
  });

  it('carregar() retorna null como padrão implícito quando nenhum padrão é passado', async () => {
    const { Armazenamento } = await montarArmazenamento();
    expect(Armazenamento.carregar('nada')).toBeNull();
  });

  it('salvar() grava no localStorage sob o prefixo correto, após o debounce', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('minhaChave', { a: 1 });
    expect(localStorage.getItem('petrobras_quimica_minhaChave')).toBeNull(); // ainda não passou o debounce

    await vi.advanceTimersByTimeAsync(1100);

    expect(localStorage.getItem('petrobras_quimica_minhaChave')).toBe(JSON.stringify({ a: 1 }));
  });

  it('salvar() com debounceMs=0 grava imediatamente após o próximo tick', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('chaveRapida', [1, 2, 3], 0);
    await vi.advanceTimersByTimeAsync(0);

    expect(JSON.parse(localStorage.getItem('petrobras_quimica_chaveRapida'))).toEqual([1, 2, 3]);
  });

  it('carregar() depois de salvar() (com o debounce decorrido) retorna o mesmo valor', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('roundtrip', { x: 'y', arr: [1, 2, 3] });
    await vi.advanceTimersByTimeAsync(1100);

    expect(Armazenamento.carregar('roundtrip')).toEqual({ x: 'y', arr: [1, 2, 3] });
  });

  it('chamadas repetidas a salvar() na mesma chave dentro da janela de debounce só persistem a última', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('debounced', 'primeiro');
    await vi.advanceTimersByTimeAsync(300);
    Armazenamento.salvar('debounced', 'segundo');
    await vi.advanceTimersByTimeAsync(300);
    Armazenamento.salvar('debounced', 'terceiro');
    await vi.advanceTimersByTimeAsync(1100);

    expect(Armazenamento.carregar('debounced')).toBe('terceiro');
  });

  it('chaves sensíveis (admin_usuarios, sessao) são armazenadas ofuscadas (base64), não em texto puro', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('sessao', { token: 'segredo-super-secreto' }, 0);
    await vi.advanceTimersByTimeAsync(0);

    const raw = localStorage.getItem('petrobras_quimica_sessao');
    expect(raw).not.toContain('segredo-super-secreto');
    // Mas carregar() decodifica corretamente de volta.
    expect(Armazenamento.carregar('sessao')).toEqual({ token: 'segredo-super-secreto' });
  });

  it('chave que contém "admin_usuarios" como substring também é tratada como sensível', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('painel_admin_usuarios_cache', ['ana'], 0);
    await vi.advanceTimersByTimeAsync(0);

    const raw = localStorage.getItem('petrobras_quimica_painel_admin_usuarios_cache');
    expect(raw).not.toContain('ana');
    expect(Armazenamento.carregar('painel_admin_usuarios_cache')).toEqual(['ana']);
  });

  it('carregar() de uma chave sensível com dado corrompido (não-base64) retorna o padrão em vez de lançar', async () => {
    const { Armazenamento } = await montarArmazenamento();
    localStorage.setItem('petrobras_quimica_sessao', 'isso-nao-e-base64-valido!!!{{{');

    const resultado = Armazenamento.carregar('sessao', 'fallback');
    expect(resultado).toBe('fallback');
  });

  it('carregar() de JSON corrompido retorna o padrão em vez de lançar', async () => {
    const { Armazenamento } = await montarArmazenamento();
    localStorage.setItem('petrobras_quimica_corrompida', '{ json invalido');

    expect(Armazenamento.carregar('corrompida', 'fallback')).toBe('fallback');
  });

  it('saveStatus transita para "saving" imediatamente e depois "saved" após o debounce', async () => {
    vi.useFakeTimers();
    const { Armazenamento, saveStatus } = await montarArmazenamento();

    expect(saveStatus.value).toBe('idle');
    Armazenamento.salvar('status-teste', 1);
    expect(saveStatus.value).toBe('saving');

    await vi.advanceTimersByTimeAsync(1100);
    expect(saveStatus.value).toBe('saved');
  });

  it('limparTudo remove somente as chaves com o prefixo do app, preservando outras chaves do localStorage', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('chaveApp1', 'a', 0);
    Armazenamento.salvar('chaveApp2', 'b', 0);
    await vi.advanceTimersByTimeAsync(0);
    localStorage.setItem('chave_de_outro_app', 'nao mexer');

    Armazenamento.limparTudo();

    expect(localStorage.getItem('petrobras_quimica_chaveApp1')).toBeNull();
    expect(localStorage.getItem('petrobras_quimica_chaveApp2')).toBeNull();
    expect(localStorage.getItem('chave_de_outro_app')).toBe('nao mexer');
  });

  it('limparTudo cancela debounces pendentes, evitando que um salvar() atrasado recrie a chave removida', async () => {
    vi.useFakeTimers();
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('pendente', 'valor-que-nao-deve-persistir');
    Armazenamento.limparTudo(); // chamado antes do debounce completar (ex: logout rápido)

    await vi.advanceTimersByTimeAsync(2000);

    expect(localStorage.getItem('petrobras_quimica_pendente')).toBeNull();
  });

  it('escreve imediatamente uma escrita pendente quando a aba é escondida/fechada antes do debounce completar (pagehide/visibilitychange)', async () => {
    const { Armazenamento } = await montarArmazenamento();

    Armazenamento.salvar('checklist-urgente', { concluido: true }); // debounce padrão de 1000ms

    // Sem isso, fechar a aba/dar refresh em menos de 1s perderia essa
    // escrita em silêncio -- o timer nunca chegaria a disparar.
    window.dispatchEvent(new Event('pagehide'));

    expect(localStorage.getItem('petrobras_quimica_checklist-urgente')).toBe(JSON.stringify({ concluido: true }));
    expect(Armazenamento.carregar('checklist-urgente')).toEqual({ concluido: true });
  });
});
