import { useT } from '@/i18n/useT';

const CATEGORIAS = [
  { value: 'Todas', labelKey: 'catalogo.filtroTodas' },
  { value: 'Pintura', labelKey: 'catalogo.filtroPintura' },
  { value: 'Escultura', labelKey: 'catalogo.filtroEscultura' },
];

const pillBase = {
  fontFamily: 'var(--sans)',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  background: 'none',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease-out',
};

function Pill({ label, active, onClick, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...pillBase,
        fontSize: small ? '0.55rem' : '0.62rem',
        padding: small ? '6px 14px' : '8px 20px',
        borderColor: active ? 'var(--text)' : 'rgba(26,26,26,0.2)',
        color: active ? 'var(--text)' : 'var(--mid)',
        background: active ? 'var(--text)' : 'none',
        ...(active && { color: 'var(--bg)' }),
      }}
    >
      {label}
    </button>
  );
}

export default function FiltroCatalogo({ obras, categoria, colecao, onCategoriaChange, onColecaoChange }) {
  const { t } = useT();

  const colecoesDeCategoria =
    categoria !== 'Todas'
      ? [...new Set(obras.filter(o => o.tipo === categoria).map(o => o.colecao).filter(Boolean))]
      : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Nível 1 — Categoria */}
      <div
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
        role="group"
        aria-label="Filtrar por categoria"
      >
        {CATEGORIAS.map(({ value, labelKey }) => (
          <Pill
            key={value}
            label={t(labelKey)}
            active={categoria === value}
            onClick={() => {
              onCategoriaChange(value);
              onColecaoChange('Todas');
            }}
          />
        ))}
      </div>

      {/* Nível 2 — Coleção (só aparece se categoria específica selecionada) */}
      {colecoesDeCategoria.length > 0 && (
        <div
          style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingLeft: '2px' }}
          role="group"
          aria-label="Filtrar por coleção"
        >
          <Pill label={t('catalogo.todasColecoes')} active={colecao === 'Todas'} onClick={() => onColecaoChange('Todas')} small />
          {colecoesDeCategoria.map(c => (
            <Pill key={c} label={c} active={colecao === c} onClick={() => onColecaoChange(c)} small />
          ))}
        </div>
      )}
    </div>
  );
}
