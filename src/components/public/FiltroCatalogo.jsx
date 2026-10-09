const pillBase = {
  fontFamily: 'var(--sans)',
  fontSize: '0.62rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  padding: '8px 20px',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease-out',
};

function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...pillBase,
        borderColor: active ? 'var(--text)' : 'rgba(26,26,26,0.2)',
        color: active ? 'var(--bg)' : 'var(--mid)',
        background: active ? 'var(--text)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

// Filtro único por coleção. `opcoes`: [{ chave, label }]
export default function FiltroCatalogo({ opcoes, selecionada, onChange }) {
  return (
    <div
      style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
      role="group"
      aria-label="Filtrar por coleção"
    >
      {opcoes.map(({ chave, label }) => (
        <Pill
          key={chave}
          label={label}
          active={selecionada === chave}
          onClick={() => onChange(chave)}
        />
      ))}
    </div>
  );
}
