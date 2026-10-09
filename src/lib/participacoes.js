function paraDate(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  if (typeof valor.toDate === 'function') return valor.toDate();
  return null;
}

function inicioDoDia(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Situação da participação, controlada pelo campo `passada`:
 * - true      → sempre em "Passadas"
 * - false     → sempre em "Próximas"
 * - ausente   → automático: passada quando a data fim (ou a de início,
 *               se não houver fim) já ficou para trás. Sem data nenhuma,
 *               continua em "Próximas".
 */
export function isPassada(p, hoje = new Date()) {
  if (p?.passada === true) return true;
  if (p?.passada === false) return false;
  const ref = paraDate(p?.dataFim) ?? paraDate(p?.dataInicio);
  if (!ref) return false;
  return inicioDoDia(ref) < inicioDoDia(hoje);
}

export function separarParticipacoes(lista, hoje = new Date()) {
  const proximas = [];
  const passadas = [];
  for (const p of lista) (isPassada(p, hoje) ? passadas : proximas).push(p);
  return { proximas, passadas };
}
