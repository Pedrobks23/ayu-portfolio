import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

let langAtual = 'en';
vi.mock('@/context/LanguageContext', () => ({ useLang: () => ({ lang: langAtual }) }));

import { useTextoTraduzido } from '@/i18n/useTraducao';

function resposta(texto) {
  return { ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: texto } }) };
}

describe('useTextoTraduzido', () => {
  beforeEach(() => {
    langAtual = 'en';
    delete globalThis.Translator;
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('em PT devolve o original sem chamar a API', () => {
    langAtual = 'pt';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useTextoTraduzido({ bio: 'Olá' }, 'bio'));
    expect(result.current).toBe('Olá');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('em EN usa o inglês salvo pelo painel', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useTextoTraduzido({ bio: 'Olá', bioEn: 'Hello' }, 'bio'));
    expect(result.current).toBe('Hello');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sem inglês salvo: mostra PT, traduz na hora e guarda no navegador', async () => {
    const fetchMock = vi.fn().mockResolvedValue(resposta('Ceramic series'));
    vi.stubGlobal('fetch', fetchMock);
    const obj = { descricao: 'Série em cerâmica' };
    const { result } = renderHook(() => useTextoTraduzido(obj, 'descricao'));
    expect(result.current).toBe('Série em cerâmica');
    await waitFor(() => expect(result.current).toBe('Ceramic series'));

    // segunda vez vem do cache, sem nova chamada
    const { result: r2 } = renderHook(() => useTextoTraduzido(obj, 'descricao'));
    expect(r2.current).toBe('Ceramic series');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('se a tradução falhar, continua em português', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { result } = renderHook(() => useTextoTraduzido({ data: 'Abertura dia 5' }, 'data'));
    await new Promise(r => setTimeout(r, 20));
    expect(result.current).toBe('Abertura dia 5');
  });

  it('objeto nulo não quebra', () => {
    const { result } = renderHook(() => useTextoTraduzido(null, 'descricao'));
    expect(result.current).toBe('');
  });
});
