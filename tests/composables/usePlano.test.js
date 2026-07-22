// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// usePlano() usa singleton em nível de módulo, então cada teste precisa de
// vi.resetModules() + import dinâmico. Também depende de fetch global, que é
// stubado por teste com vi.stubGlobal.
async function montarPlano() {
  vi.resetModules();
  const { usePlano } = await import('../../usePlano.js');
  return usePlano();
}

describe('usePlano', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('estado inicial: planos vazio, nada selecionado, não carregando', async () => {
    const { planos, planoSelecionado, planoHtml, carregandoPlano } = await montarPlano();
    expect(planos.value).toEqual([]);
    expect(planoSelecionado.value).toBe('');
    expect(planoHtml.value).toBe('');
    expect(carregandoPlano.value).toBe(false);
  });

  it('fetchPlanos popula planos.value quando a API responde ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{ id: 'plano-a', nome: 'Plano A' }]),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { fetchPlanos, planos } = await montarPlano();
    await fetchPlanos();

    expect(fetchMock).toHaveBeenCalledWith('/api/planos');
    expect(planos.value).toEqual([{ id: 'plano-a', nome: 'Plano A' }]);
  });

  it('fetchPlanos não altera planos.value quando a resposta não é ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ([]) }));

    const { fetchPlanos, planos } = await montarPlano();
    await fetchPlanos();

    expect(planos.value).toEqual([]);
  });

  it('fetchPlanos não lança erro quando fetch rejeita (falha de rede)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const { fetchPlanos, planos } = await montarPlano();
    await expect(fetchPlanos()).resolves.toBeUndefined();
    expect(planos.value).toEqual([]);
  });

  it('carregarPlano não faz nada se nenhum plano estiver selecionado', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { carregarPlano } = await montarPlano();
    await carregarPlano();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('carregarPlano busca o markdown do plano selecionado e converte para HTML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '# Título\n\nTexto',
    }));

    const { planoSelecionado, carregarPlano, planoHtml, carregandoPlano } = await montarPlano();
    planoSelecionado.value = 'plano-a';
    const promessa = carregarPlano();
    expect(carregandoPlano.value).toBe(true);
    await promessa;

    expect(carregandoPlano.value).toBe(false);
    expect(planoHtml.value).toContain('<h1>Título</h1>');
  });

  it('carregarPlano usa a URL correta com o id do plano selecionado', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => 'md' });
    vi.stubGlobal('fetch', fetchMock);

    const { planoSelecionado, carregarPlano } = await montarPlano();
    planoSelecionado.value = 'meu-plano-123';
    await carregarPlano();

    expect(fetchMock).toHaveBeenCalledWith('/api/plano/meu-plano-123');
  });

  it('carregarPlano não altera planoHtml quando a resposta não é ok, mas limpa carregandoPlano', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, text: async () => 'erro' }));

    const { planoSelecionado, carregarPlano, planoHtml, carregandoPlano } = await montarPlano();
    planoSelecionado.value = 'plano-a';
    await carregarPlano();

    expect(planoHtml.value).toBe('');
    expect(carregandoPlano.value).toBe(false);
  });

  it('carregarPlano em erro de rede não lança e restaura carregandoPlano para false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const { planoSelecionado, carregarPlano, carregandoPlano } = await montarPlano();
    planoSelecionado.value = 'plano-a';
    await expect(carregarPlano()).resolves.toBeUndefined();

    expect(carregandoPlano.value).toBe(false);
  });

  it('apenas a resposta da requisição mais recente atualiza planoHtml (corrida entre requisições)', async () => {
    // Simula troca rápida de plano selecionado: a 1ª requisição (lenta)
    // resolve depois da 2ª (rápida) — o resultado da 1ª não pode sobrescrever
    // o da 2ª, pois nesse ponto o usuário já está vendo outro plano.
    let resolvePrimeira;
    const primeiraPromise = new Promise(resolve => { resolvePrimeira = resolve; });

    const fetchMock = vi.fn()
      .mockImplementationOnce(() => primeiraPromise)
      .mockImplementationOnce(() => Promise.resolve({ ok: true, text: async () => '# Segundo' }));
    vi.stubGlobal('fetch', fetchMock);

    const { planoSelecionado, carregarPlano, planoHtml } = await montarPlano();

    planoSelecionado.value = 'plano-lento';
    const chamadaLenta = carregarPlano();

    planoSelecionado.value = 'plano-rapido';
    const chamadaRapida = carregarPlano();
    await chamadaRapida;

    expect(planoHtml.value).toContain('Segundo');

    // Agora resolve a requisição lenta (antiga) - não deve sobrescrever o HTML atual.
    resolvePrimeira({ ok: true, text: async () => '# Primeiro (obsoleto)' });
    await chamadaLenta;

    expect(planoHtml.value).toContain('Segundo');
    expect(planoHtml.value).not.toContain('Primeiro');
  });
});
