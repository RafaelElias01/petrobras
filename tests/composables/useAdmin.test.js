// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// useAdmin() usa singleton em nível de módulo, então cada teste precisa de
// vi.resetModules() + import dinâmico. fetch é mockado por teste.
async function montarAdmin() {
  vi.resetModules();
  const { useAdmin } = await import('../../useAdmin.js');
  return useAdmin();
}

function jsonResponse(ok, data) {
  return { ok, json: async () => data };
}

describe('useAdmin', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('estado inicial: usuarios vazio, não carregado, sem erro', async () => {
    const { usuarios, carregado, carregando, erro, totalUsuarios, admins, usuariosComuns } = await montarAdmin();
    expect(usuarios.value).toEqual([]);
    expect(carregado.value).toBe(false);
    expect(carregando.value).toBe(false);
    expect(erro.value).toBe('');
    expect(totalUsuarios.value).toBe(0);
    expect(admins.value).toBe(0);
    expect(usuariosComuns.value).toBe(0);
  });

  it('setToken define o token usado no header Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(true, []));
    vi.stubGlobal('fetch', fetchMock);

    const { setToken, carregarUsuarios } = await montarAdmin();
    setToken('meu-token-123');
    await carregarUsuarios();

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/usuarios', {
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer meu-token-123' },
    });
  });

  it('setToken(null) usa string vazia no header (não "Bearer null")', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(true, []));
    vi.stubGlobal('fetch', fetchMock);

    const { setToken, carregarUsuarios } = await montarAdmin();
    setToken(null);
    await carregarUsuarios();

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer ');
  });

  it('carregarUsuarios popula usuarios.value e marca carregado', async () => {
    const lista = [{ usuario: 'ana', nome: 'Ana', role: 'admin' }, { usuario: 'bob', nome: 'Bob', role: 'user' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(true, lista)));

    const { carregarUsuarios, usuarios, carregado, totalUsuarios, admins, usuariosComuns } = await montarAdmin();
    await carregarUsuarios();

    expect(usuarios.value).toEqual(lista);
    expect(carregado.value).toBe(true);
    expect(totalUsuarios.value).toBe(2);
    expect(admins.value).toBe(1);
    expect(usuariosComuns.value).toBe(1);
  });

  it('carregarUsuarios não refaz o fetch se já carregado e force não for passado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(true, []));
    vi.stubGlobal('fetch', fetchMock);

    const { carregarUsuarios } = await montarAdmin();
    await carregarUsuarios();
    await carregarUsuarios();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('carregarUsuarios com force=true refaz o fetch mesmo já carregado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(true, []));
    vi.stubGlobal('fetch', fetchMock);

    const { carregarUsuarios } = await montarAdmin();
    await carregarUsuarios();
    await carregarUsuarios(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('carregarUsuarios com resposta de erro define erro.value e não marca carregado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(false, { erro: 'Não autorizado' })));

    const { carregarUsuarios, erro, carregado, usuarios } = await montarAdmin();
    await carregarUsuarios();

    expect(erro.value).toBe('Não autorizado');
    expect(carregado.value).toBe(false);
    expect(usuarios.value).toEqual([]);
  });

  it('carregarUsuarios com falha de rede define mensagem de erro genérica', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const { carregarUsuarios, erro, carregando } = await montarAdmin();
    await carregarUsuarios();

    expect(erro.value).toBe('Erro de conexão com o servidor');
    expect(carregando.value).toBe(false);
  });

  it('novoUsuario prepara um usuário em edição com role padrão "user"', async () => {
    const { novoUsuario, editandoUsuario } = await montarAdmin();
    novoUsuario();
    expect(editandoUsuario.value).toEqual({ usuario: '', senha: '', nome: '', role: 'user' });
  });

  it('editarUsuario copia o usuário para edição mas sempre zera a senha', async () => {
    const { editarUsuario, editandoUsuario } = await montarAdmin();
    editarUsuario({ usuario: 'ana', nome: 'Ana', role: 'admin', senha: 'hash-nao-deve-aparecer' });
    expect(editandoUsuario.value).toEqual({ usuario: 'ana', nome: 'Ana', role: 'admin', senha: '' });
  });

  it('salvarUsuario não faz nada se usuario ou nome estiverem vazios', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { salvarUsuario } = await montarAdmin();
    await salvarUsuario({ usuario: '', nome: '', senha: 'x', role: 'user' });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('salvarUsuario cria um novo usuário via POST quando o usuário ainda não existe', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(true, { usuario: 'carlos', nome: 'Carlos', role: 'user' }));
    vi.stubGlobal('fetch', fetchMock);

    const { salvarUsuario, usuarios, editandoUsuario } = await montarAdmin();
    await salvarUsuario({ usuario: 'carlos', nome: 'Carlos', senha: '123456', role: 'user' });

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/usuarios', expect.objectContaining({ method: 'POST' }));
    expect(usuarios.value).toContainEqual({ usuario: 'carlos', nome: 'Carlos', role: 'user' });
    expect(editandoUsuario.value).toBeNull();
  });

  it('salvarUsuario não cria usuário novo sem senha', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { salvarUsuario } = await montarAdmin();
    await salvarUsuario({ usuario: 'carlos', nome: 'Carlos', senha: '', role: 'user' });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('salvarUsuario atualiza via PUT quando o usuário já existe na lista carregada', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(true, [{ usuario: 'ana', nome: 'Ana', role: 'user' }]))
      .mockResolvedValueOnce(jsonResponse(true, { usuario: 'ana', nome: 'Ana Atualizada', role: 'admin' })));

    const { carregarUsuarios, salvarUsuario, usuarios } = await montarAdmin();
    await carregarUsuarios();

    await salvarUsuario({ usuario: 'ana', nome: 'Ana Atualizada', role: 'admin', senha: '' });

    expect(usuarios.value[0]).toEqual({ usuario: 'ana', nome: 'Ana Atualizada', role: 'admin' });
  });

  it('salvarUsuario define erro.value quando o servidor rejeita a criação', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(false, { erro: 'usuário já existe' })));

    const { novoUsuario, salvarUsuario, erro, editandoUsuario } = await montarAdmin();
    novoUsuario();
    editandoUsuario.value = { usuario: 'novo', nome: 'Novo', senha: '123', role: 'user' };
    await salvarUsuario();

    expect(erro.value).toBe('usuário já existe');
    // Em erro, não deve fechar o formulário de edição.
    expect(editandoUsuario.value).not.toBeNull();
  });

  it('removerUsuario remove da lista quando a API confirma', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(true, [{ usuario: 'ana', nome: 'Ana', role: 'user' }]))
      .mockResolvedValueOnce(jsonResponse(true, {})));

    const { carregarUsuarios, removerUsuario, usuarios } = await montarAdmin();
    await carregarUsuarios();

    await removerUsuario('ana');

    expect(usuarios.value).toEqual([]);
  });

  it('removerUsuario recusa remover o próprio usuário logado', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { removerUsuario } = await montarAdmin();
    await removerUsuario('rafaelelias', 'rafaelelias');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('removerUsuario define erro.value quando a API rejeita a remoção', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(false, { erro: 'não encontrado' })));

    const { removerUsuario, erro } = await montarAdmin();
    await removerUsuario('fantasma');

    expect(erro.value).toBe('não encontrado');
  });

  it('cancelarEdicao limpa editandoUsuario', async () => {
    const { novoUsuario, cancelarEdicao, editandoUsuario } = await montarAdmin();
    novoUsuario();
    expect(editandoUsuario.value).not.toBeNull();
    cancelarEdicao();
    expect(editandoUsuario.value).toBeNull();
  });
});
