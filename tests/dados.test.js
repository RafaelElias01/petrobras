import { describe, it, expect } from 'vitest';
import { mapCicloParaMateriaId, CICLO_ESTUDOS } from '../dados.js';

describe('mapCicloParaMateriaId', () => {
  // Bug real corrigido: CICLO_MAP tem chaves acentuadas ('português',
  // 'química', ...) mas o nome recebido tinha os acentos removidos antes de
  // comparar -- 'portugues'.includes('português') é sempre false, então
  // literalmente NENHUM item batia e tudo caía no fallback. O botão
  // "Estudar" do Diário sempre registrava horas no bucket errado.
  it('reconhece cada matéria acentuada do ciclo pelo id certo (não cai no fallback)', () => {
    expect(mapCicloParaMateriaId('Português')).toBe('portugues');
    expect(mapCicloParaMateriaId('Matemática')).toBe('matematica');
    expect(mapCicloParaMateriaId('Química — Orgânica')).toBe('quimica');
    expect(mapCicloParaMateriaId('Química — Soluções + Inorgânica')).toBe('quimica');
  });

  it('todo item real de CICLO_ESTUDOS mapeia pra um materiaId válido, nunca null', () => {
    CICLO_ESTUDOS.forEach(item => {
      expect(mapCicloParaMateriaId(item.materia)).not.toBeNull();
    });
  });

  it('retorna null (não mais "quimica" por padrão) quando não há nenhuma palavra-chave correspondente', () => {
    expect(mapCicloParaMateriaId('Revisão Geral Sem Matéria Definida')).toBeNull();
  });
});
