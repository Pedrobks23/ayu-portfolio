import { useEffect, useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { traduzirPtEn } from '@/lib/traducao';

// Tradução feita no navegador do visitante quando o site está em inglês e o
// texto ainda não tem versão EN salva pelo painel. O resultado fica guardado
// no navegador (localStorage) para não traduzir de novo.

const PREFIXO = 'ayume:tr:';
const memoria = new Map();      // texto PT → EN (esta aba)
const emAndamento = new Map();  // texto PT → Promise (evita pedir duas vezes)

function chave(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return `${PREFIXO}${(h >>> 0).toString(36)}:${texto.length}`;
}

function lerCache(texto) {
  if (memoria.has(texto)) return memoria.get(texto);
  try {
    const salvo = localStorage.getItem(chave(texto));
    if (salvo) { memoria.set(texto, salvo); return salvo; }
  } catch { /* storage indisponível */ }
  return null;
}

function gravarCache(texto, en) {
  memoria.set(texto, en);
  try { localStorage.setItem(chave(texto), en); } catch { /* cheio ou bloqueado */ }
}

export function traduzirComCache(texto) {
  const pronto = lerCache(texto);
  if (pronto) return Promise.resolve(pronto);
  if (!emAndamento.has(texto)) {
    const p = traduzirPtEn(texto)
      .then(en => { if (en) gravarCache(texto, en); return en; })
      .finally(() => emAndamento.delete(texto));
    emAndamento.set(texto, p);
  }
  return emAndamento.get(texto);
}

/**
 * Texto de um campo no idioma atual.
 * PT → campo original. EN → campo `${campo}En` salvo; se vazio, traduz na hora
 * (mostra o português enquanto traduz ou se a tradução falhar).
 */
export function useTextoTraduzido(obj, campo) {
  const { lang } = useLang();
  const pt = (obj?.[campo] ?? '').toString();
  const salvo = (obj?.[`${campo}En`] ?? '').toString().trim();
  const precisa = lang === 'en' && !salvo && pt.trim() !== '';
  const [auto, setAuto] = useState(() => (precisa ? lerCache(pt) : null));

  useEffect(() => {
    if (!precisa) { setAuto(null); return; }
    const cache = lerCache(pt);
    if (cache) { setAuto(cache); return; }
    let ativo = true;
    setAuto(null);
    traduzirComCache(pt)
      .then(en => { if (ativo && en) setAuto(en); })
      .catch(() => { /* fica em português */ });
    return () => { ativo = false; };
  }, [precisa, pt]);

  if (lang !== 'en') return pt;
  return salvo || auto || pt;
}
