import { describe, it, expect, beforeAll, vi } from 'vitest';

// heic2any usa Worker que não existe em ambiente de teste
vi.mock('heic2any', () => ({ default: vi.fn() }));

const { urlOtimizada } = await import('@/lib/cloudinary');

// Usa o cloud name real configurado no .env.local
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;

describe('urlOtimizada — sem crop', () => {
  it('retorna string vazia para publicId falsy', () => {
    expect(urlOtimizada(null)).toBe('');
    expect(urlOtimizada('')).toBe('');
    expect(urlOtimizada(undefined)).toBe('');
  });

  it('gera URL correta para tamanho card (padrão)', () => {
    expect(urlOtimizada('ayume/obras/abc123')).toBe(
      `${BASE}/f_auto,q_auto:good,w_600,h_600,c_fill,g_auto/ayume/obras/abc123`
    );
  });

  it('gera URL correta para tamanho thumb', () => {
    expect(urlOtimizada('ayume/obras/abc123', 'thumb')).toBe(
      `${BASE}/f_auto,q_auto:eco,w_400,h_400,c_fill,g_auto/ayume/obras/abc123`
    );
  });

  it('gera URL correta para tamanho hero', () => {
    expect(urlOtimizada('ayume/obras/abc123', 'hero')).toBe(
      `${BASE}/f_auto,q_auto:good,w_1920/ayume/obras/abc123`
    );
  });

  it('gera URL correta para tamanho full', () => {
    expect(urlOtimizada('ayume/obras/abc123', 'full')).toBe(
      `${BASE}/f_auto,q_auto:best,w_1600/ayume/obras/abc123`
    );
  });
});

describe('urlOtimizada — com crop', () => {
  const crop = { x: 100, y: 200, w: 900, h: 900 };

  it('prefixo c_crop aplicado em card', () => {
    expect(urlOtimizada('ayume/obras/abc123', 'card', crop)).toBe(
      `${BASE}/c_crop,x_100,y_200,w_900,h_900/f_auto,q_auto:good,w_600,h_600,c_fill,g_auto/ayume/obras/abc123`
    );
  });

  it('prefixo c_crop aplicado em thumb', () => {
    expect(urlOtimizada('ayume/obras/abc123', 'thumb', crop)).toBe(
      `${BASE}/c_crop,x_100,y_200,w_900,h_900/f_auto,q_auto:eco,w_400,h_400,c_fill,g_auto/ayume/obras/abc123`
    );
  });

  it('crop NÃO aplicado em hero', () => {
    const url = urlOtimizada('ayume/obras/abc123', 'hero', crop);
    expect(url).not.toContain('c_crop');
    expect(url).toBe(`${BASE}/f_auto,q_auto:good,w_1920/ayume/obras/abc123`);
  });

  it('crop NÃO aplicado em full', () => {
    const url = urlOtimizada('ayume/obras/abc123', 'full', crop);
    expect(url).not.toContain('c_crop');
  });

  it('arredonda coordenadas com casas decimais', () => {
    const cropDecimal = { x: 100.7, y: 200.3, w: 900.9, h: 900.1 };
    const url = urlOtimizada('ayume/obras/abc123', 'card', cropDecimal);
    expect(url).toContain('c_crop,x_101,y_200,w_901,h_900');
  });

  it('crop null equivale a sem crop', () => {
    const comNull = urlOtimizada('ayume/obras/abc123', 'card', null);
    const semCrop  = urlOtimizada('ayume/obras/abc123', 'card');
    expect(comNull).toBe(semCrop);
    expect(comNull).not.toContain('c_crop');
  });

  it('retrocompatibilidade: crop undefined não quebra e usa g_auto', () => {
    const url = urlOtimizada('ayume/obras/antiga', 'card', undefined);
    expect(url).toContain('g_auto');
    expect(url).not.toContain('c_crop');
  });
});

describe('urlOtimizada — estrutura da URL', () => {
  it('c_crop vem antes do c_fill na URL', () => {
    const crop = { x: 10, y: 20, w: 500, h: 500 };
    const url = urlOtimizada('id', 'card', crop);
    expect(url.indexOf('c_crop')).toBeLessThan(url.indexOf('c_fill'));
  });

  it('publicId aparece no final da URL', () => {
    const url = urlOtimizada('ayume/obras/minha-obra', 'card');
    expect(url.endsWith('ayume/obras/minha-obra')).toBe(true);
  });
});
