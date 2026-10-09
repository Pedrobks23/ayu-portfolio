import { describe, it, expect } from 'vitest';
import {
  obraPertence,
  colecoesDoCatalogo,
  obrasSemColecao,
} from '@/lib/colecoes';
import { isPassada, separarParticipacoes } from '@/lib/participacoes';

const ts = str => ({ toDate: () => new Date(str + 'T00:00:00') });

describe('colecoes', () => {
  const colecoes = [
    { id: 'b', nome: 'Bagunça', ordem: 2 },
    { id: 'a', nome: '8.092 dias', ordem: 1 },
    { id: 'x', nome: 'Oculta', ordem: 0, visivel: false },
    { id: 'v', nome: 'Vazia', ordem: 3 },
  ];
  const obras = [
    { slug: '1', colecao: '8.092 dias' },
    { slug: '2', colecao: 'bagunca' },
    { slug: '3', colecao: 'Oculta' },
    { slug: '4', colecao: '' },
    { slug: '5', colecao: 'Antiga' },
  ];

  it('compara nome ignorando acento e caixa', () => {
    expect(obraPertence(obras[1], colecoes[0])).toBe(true);
    expect(obraPertence(obras[3], colecoes[0])).toBe(false);
  });

  it('lista só coleções visíveis com obras, em ordem', () => {
    expect(colecoesDoCatalogo(colecoes, obras).map(c => c.id)).toEqual(['a', 'b']);
  });

  it('sem coleções cadastradas usa os nomes das obras', () => {
    expect(colecoesDoCatalogo([], obras).map(c => c.nome)).toEqual(['8.092 dias', 'bagunca', 'Oculta', 'Antiga']);
    expect(obrasSemColecao([], obras).map(o => o.slug)).toEqual(['4']);
  });

  it('obras fora de coleção cadastrada vão para "outras"; de coleção oculta somem', () => {
    expect(obrasSemColecao(colecoes, obras).map(o => o.slug)).toEqual(['4', '5']);
  });
});

describe('participacoes', () => {
  const hoje = new Date('2026-10-09T15:00:00');

  it('automático pela data fim', () => {
    expect(isPassada({ dataFim: ts('2026-10-08') }, hoje)).toBe(true);
    expect(isPassada({ dataFim: ts('2026-10-09') }, hoje)).toBe(false);
  });

  it('usa data início quando não há fim', () => {
    expect(isPassada({ dataInicio: ts('2026-09-01') }, hoje)).toBe(true);
    expect(isPassada({ dataInicio: ts('2026-09-01'), dataFim: ts('2026-12-01') }, hoje)).toBe(false);
  });

  it('sem data fica em próximas', () => {
    expect(isPassada({}, hoje)).toBe(false);
  });

  it('escolha manual vence a data', () => {
    expect(isPassada({ passada: true }, hoje)).toBe(true);
    expect(isPassada({ passada: false, dataFim: ts('2020-01-01') }, hoje)).toBe(false);
  });

  it('separa as listas', () => {
    const { proximas, passadas } = separarParticipacoes(
      [{ id: 1, passada: true }, { id: 2 }, { id: 3, dataFim: ts('2025-01-01') }],
      hoje
    );
    expect(proximas.map(p => p.id)).toEqual([2]);
    expect(passadas.map(p => p.id)).toEqual([1, 3]);
  });
});
