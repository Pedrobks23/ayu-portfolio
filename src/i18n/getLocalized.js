export function getLocalized(obj, campo, lang) {
  if (lang === 'en') {
    const en = obj?.[`${campo}En`];
    if (en && en.trim()) return en;
  }
  return obj?.[campo] ?? '';
}

export function traduzirDisponibilidade(valor, t) {
  if (valor === 'Disponível') return t('obra.disp_Disponivel');
  if (valor === 'Sob consulta') return t('obra.disp_SobConsulta');
  if (valor === 'Indisponível') return t('obra.disp_Indisponivel');
  return valor;
}
