import { slugify } from '@/lib/utils';

// As obras guardam o nome da coleção em texto (campo `colecao`).
// A comparação é feita pelo slug pra tolerar diferenças de acento/caixa/espaço.
export function chaveColecao(nome) {
  return slugify(String(nome ?? ''));
}

export function obraPertence(obra, colecao) {
  if (!obra?.colecao || !colecao?.nome) return false;
  return chaveColecao(obra.colecao) === chaveColecao(colecao.nome);
}

export function ordenarColecoes(lista) {
  return [...lista].sort((a, b) => {
    const oa = a.ordem ?? 0;
    const ob = b.ordem ?? 0;
    if (oa !== ob) return oa - ob;
    return String(a.nome ?? '').localeCompare(String(b.nome ?? ''), 'pt-BR');
  });
}

/**
 * Coleções que aparecem no catálogo público:
 * - as cadastradas (visíveis) que têm pelo menos uma obra visível;
 * - enquanto nenhuma coleção estiver cadastrada, cai para os nomes
 *   usados nas próprias obras (pra o site não ficar vazio).
 */
export function colecoesDoCatalogo(colecoes, obrasVisiveis) {
  const cadastradas = ordenarColecoes(colecoes.filter(c => c.visivel !== false));
  if (cadastradas.length > 0) {
    return cadastradas.filter(c => obrasVisiveis.some(o => obraPertence(o, c)));
  }
  const nomes = [...new Set(obrasVisiveis.map(o => o.colecao).filter(Boolean))];
  return nomes.map(nome => ({ id: chaveColecao(nome), nome }));
}

/**
 * Obras visíveis que não pertencem a nenhuma coleção cadastrada
 * (nem às ocultas — obra de coleção oculta fica fora do catálogo).
 * No modo sem coleções cadastradas, só as obras sem nome de coleção.
 */
export function obrasSemColecao(colecoes, obrasVisiveis) {
  if (colecoes.length === 0) return obrasVisiveis.filter(o => !o.colecao);
  return obrasVisiveis.filter(o => !colecoes.some(c => obraPertence(o, c)));
}
