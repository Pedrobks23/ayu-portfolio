import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dividirTexto, traduzirPtEn, completarTraducoes, CotaEsgotadaError } from '@/lib/traducao';

function respostaMyMemory(texto, status = 200) {
  return { ok: true, json: async () => ({ responseStatus: status, responseData: { translatedText: texto } }) };
}

describe('dividirTexto', () => {
  it('não divide texto curto', () => {
    expect(dividirTexto('Olá mundo.')).toEqual(['Olá mundo.']);
  });

  it('divide em fim de frase sem passar do limite', () => {
    const frase = 'Esta é uma frase de teste com algumas palavras. ';
    const texto = frase.repeat(30);
    const partes = dividirTexto(texto, 200);
    expect(partes.length).toBeGreaterThan(1);
    partes.forEach(p => expect(p.length).toBeLessThanOrEqual(200));
    expect(partes.join(' ').replace(/\s+/g, ' ')).toBe(texto.trim().replace(/\s+/g, ' '));
  });
});

describe('traduzirPtEn (MyMemory)', () => {
  beforeEach(() => { delete globalThis.Translator; });
  afterEach(() => vi.unstubAllGlobals());

  it('preserva parágrafos e decodifica entidades', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respostaMyMemory('First paragraph'))
      .mockResolvedValueOnce(respostaMyMemory('Ayume&#39;s second'));
    vi.stubGlobal('fetch', fetchMock);
    const en = await traduzirPtEn('Primeiro parágrafo\n\nSegundo da Ayume');
    expect(en).toBe("First paragraph\n\nAyume's second");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain('langpair=pt-br%7Cen');
  });

  it('lança CotaEsgotadaError quando o limite diário acaba', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      respostaMyMemory('MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY', 429)
    ));
    await expect(traduzirPtEn('texto')).rejects.toBeInstanceOf(CotaEsgotadaError);
  });

  it('usa o tradutor do Chrome quando existe', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    globalThis.Translator = {
      availability: async () => 'available',
      create: async () => ({ translate: async t => `EN:${t}` }),
    };
    expect(await traduzirPtEn('Cerâmica')).toBe('EN:Cerâmica');
    expect(fetchMock).not.toHaveBeenCalled();
    delete globalThis.Translator;
  });
});

describe('completarTraducoes', () => {
  beforeEach(() => {
    delete globalThis.Translator;
    vi.stubGlobal('fetch', vi.fn(async url => respostaMyMemory(`EN(${new URL(url).searchParams.get('q')})`)));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('traduz EN vazio, mantém EN atual quando PT não mudou', async () => {
    const { valores } = await completarTraducoes({
      form: { descricao: 'nova', descricaoEn: '', tecnica: 'Cerâmica', tecnicaEn: 'Ceramics' },
      original: { descricao: '', tecnica: 'Cerâmica' },
      campos: ['descricao', 'tecnica'],
    });
    expect(valores).toEqual({ descricaoEn: 'EN(nova)', tecnicaEn: 'Ceramics' });
  });

  it('retraduz quando o PT mudou, mas respeita EN editado à mão', async () => {
    const r1 = await completarTraducoes({
      form: { descricao: 'texto novo', descricaoEn: 'old text' },
      original: { descricao: 'texto antigo' },
      campos: ['descricao'],
    });
    expect(r1.valores.descricaoEn).toBe('EN(texto novo)');

    const r2 = await completarTraducoes({
      form: { descricao: 'texto novo', descricaoEn: 'my own text' },
      original: { descricao: 'texto antigo' },
      editadosEn: new Set(['descricaoEn']),
      campos: ['descricao'],
    });
    expect(r2.valores.descricaoEn).toBe('my own text');
  });

  it('PT vazio limpa o EN; falha mantém o EN anterior e registra', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { valores, falhou } = await completarTraducoes({
      form: { bio: '', bioEn: 'x', descricao: 'mudou', descricaoEn: 'antigo' },
      original: { descricao: 'antes' },
      campos: ['bio', 'descricao'],
    });
    expect(valores).toEqual({ bioEn: '', descricaoEn: 'antigo' });
    expect(falhou).toEqual(['descricao']);
  });
});
