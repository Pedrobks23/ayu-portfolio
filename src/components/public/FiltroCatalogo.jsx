import { Pill } from '@/components/public/ui';

export default function FiltroCatalogo({ obras, filtroAtivo, onChange }) {
  const colecoes = [...new Set(obras.map(o => o.colecao))];
  const pills = ['TODAS', 'PINTURA', 'ESCULTURA', ...colecoes];

  return (
    <div
      style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
      role="group"
      aria-label="Filtros do catálogo"
    >
      {pills.map(p => (
        <Pill
          key={p}
          label={p}
          active={filtroAtivo === p}
          onClick={() => onChange(p)}
        />
      ))}
    </div>
  );
}
