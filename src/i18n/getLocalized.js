export function getLocalized(obj, campo, lang) {
  if (lang === 'en') {
    const en = obj?.[`${campo}En`];
    if (en && en.trim()) return en;
  }
  return obj?.[campo] ?? '';
}

export function traduzirTipo(valor, t) {
  if (valor === 'Escultura') return t('obra.tipo_Escultura');
  if (valor === 'Pintura') return t('obra.tipo_Pintura');
  return valor;
}

export function traduzirDisponibilidade(valor, t) {
  if (valor === 'Disponível') return t('obra.disp_Disponivel');
  if (valor === 'Sob consulta') return t('obra.disp_SobConsulta');
  if (valor === 'Indisponível') return t('obra.disp_Indisponivel');
  return valor;
}
