// Tradução automática PT → EN usada pelo painel admin.
//
// 1º tenta o tradutor embutido do Chrome (on-device, grátis, sem chave).
// 2º cai no MyMemory (API pública gratuita, sem chave).
// Se ambos falharem, lança erro e o campo EN fica vazio — o site mostra o PT.

const LIMITE_MYMEMORY = 450; // a API aceita ~500 bytes por requisição

let tradutorChrome = null;

async function traduzirComChrome(texto) {
  const API = typeof self !== 'undefined' ? self.Translator : undefined;
  if (!API) return null;
  try {
    if (!tradutorChrome) {
      const opts = { sourceLanguage: 'pt', targetLanguage: 'en' };
      const disp = await API.availability(opts);
      if (disp === 'unavailable') return null;
      tradutorChrome = await API.create(opts);
    }
    return await tradutorChrome.translate(texto);
  } catch {
    tradutorChrome = null;
    return null;
  }
}

function decodificarEntidades(s) {
  if (typeof document === 'undefined') return s;
  const el = document.createElement('textarea');
  el.innerHTML = s;
  return el.value;
}

// Quebra em pedaços ≤ limite, preferindo fim de frase e depois espaço.
export function dividirTexto(texto, limite = LIMITE_MYMEMORY) {
  const pedacos = [];
  let resto = texto.trim();
  while (resto.length > limite) {
    let corte = -1;
    for (const sep of ['. ', '! ', '? ', '; ', ', ', ' ']) {
      const i = resto.lastIndexOf(sep, limite);
      if (i > limite * 0.4) { corte = i + sep.length; break; }
    }
    if (corte <= 0) corte = limite;
    pedacos.push(resto.slice(0, corte).trim());
    resto = resto.slice(corte).trim();
  }
  if (resto) pedacos.push(resto);
  return pedacos;
}

export class CotaEsgotadaError extends Error {}

async function traduzirComMyMemory(texto, { email } = {}) {
  const partes = [];
  for (const pedaco of dividirTexto(texto)) {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', pedaco);
    url.searchParams.set('langpair', 'pt-br|en');
    if (email) url.searchParams.set('de', email);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
    const json = await res.json();
    const traduzido = json?.responseData?.translatedText ?? '';
    if (json?.responseStatus === 429 || /MYMEMORY WARNING|QUOTA/i.test(traduzido)) {
      throw new CotaEsgotadaError('Limite diário de tradução gratuita atingido.');
    }
    if (Number(json?.responseStatus) !== 200 || !traduzido) {
      throw new Error(json?.responseDetails || 'Falha na tradução');
    }
    partes.push(decodificarEntidades(traduzido));
  }
  return partes.join(' ');
}

async function traduzirTrecho(texto, opts) {
  const viaChrome = await traduzirComChrome(texto);
  if (viaChrome) return viaChrome;
  return traduzirComMyMemory(texto, opts);
}

/**
 * Traduz preservando quebras de linha/parágrafos.
 * @param {string} texto
 * @param {{ email?: string }} opts  e-mail opcional (aumenta a cota do MyMemory)
 */
export async function traduzirPtEn(texto, opts = {}) {
  if (!texto || !texto.trim()) return '';
  const blocos = texto.split(/(\n+)/);
  const saida = [];
  for (const bloco of blocos) {
    if (!bloco.trim()) { saida.push(bloco); continue; }
    saida.push(await traduzirTrecho(bloco, opts));
  }
  return saida.join('');
}

/**
 * Decide quais campos EN traduzir ao salvar um formulário e devolve os valores.
 *
 * Regra por campo (ex.: 'descricao' → 'descricaoEn'):
 *  - PT vazio                    → EN vazio
 *  - EN editado à mão nesta tela → mantém o que ela escreveu
 *  - EN vazio ou PT foi alterado → traduz de novo
 *  - caso contrário              → mantém o EN atual
 *
 * @returns {Promise<{ valores: Record<string,string>, falhou: string[] }>}
 */
export async function completarTraducoes({ form, original = {}, editadosEn = new Set(), campos, email }) {
  const valores = {};
  const falhou = [];
  for (const campo of campos) {
    const chaveEn = `${campo}En`;
    const pt = (form[campo] ?? '').trim();
    const en = (form[chaveEn] ?? '').trim();
    if (!pt) { valores[chaveEn] = ''; continue; }
    if (editadosEn.has(chaveEn)) { valores[chaveEn] = en; continue; }
    const ptMudou = pt !== (original[campo] ?? '').trim();
    if (en && !ptMudou) { valores[chaveEn] = en; continue; }
    try {
      valores[chaveEn] = await traduzirPtEn(pt, { email });
    } catch (e) {
      valores[chaveEn] = en; // mantém o que tinha (ou vazio → site usa PT)
      falhou.push(campo);
      if (e instanceof CotaEsgotadaError) break;
    }
  }
  return { valores, falhou };
}
