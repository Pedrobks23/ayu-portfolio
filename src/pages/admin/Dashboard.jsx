import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import AdminLayout from '@/components/admin/AdminLayout';

const BADGE = {
  Disponível: { bg: 'rgba(58,107,58,0.1)', color: '#3a6b3a' },
  'Sob consulta': { bg: 'rgba(107,101,96,0.12)', color: 'var(--mid)' },
  Indisponível: { bg: 'rgba(138,48,48,0.1)', color: '#8a3030' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { obras, deletarObra } = useObras();
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODAS');

  const filtradas = obras
    .filter(o => {
      const matchBusca = !busca || o.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        o.colecao.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = tipoFiltro === 'TODAS' || o.tipo === tipoFiltro;
      return matchBusca && matchTipo;
    })
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  function handleDeletar(slug, titulo) {
    if (window.confirm(`Deletar a obra "${titulo}"? Esta ação não pode ser desfeita.`)) {
      deletarObra(slug);
    }
  }

  const inputStyle = {
    border: '1px solid rgba(26,26,26,0.2)',
    background: 'transparent',
    padding: '10px 16px',
    fontFamily: 'var(--sans)',
    fontSize: '0.78rem',
    color: 'var(--text)',
    outline: 'none',
  };

  return (
    <AdminLayout>
      {/* Cabeçalho da página */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              marginBottom: '8px',
            }}
          >
            Gestão de conteúdo
          </div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.8rem,3vw,2.6rem)',
              fontWeight: 300,
            }}
          >
            Obras ({obras.length})
          </div>
        </div>
        <button
          onClick={() => navigate('/painel-ayume/obras/nova')}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            background: 'var(--text)',
            color: 'var(--bg)',
            border: 'none',
            padding: '14px 28px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          + Nova obra
        </button>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="search"
          placeholder="Buscar por título ou coleção..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ ...inputStyle, minWidth: '220px', flex: 1 }}
          aria-label="Buscar obras"
        />
        <select
          value={tipoFiltro}
          onChange={e => setTipoFiltro(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          aria-label="Filtrar por tipo"
        >
          <option value="TODAS">Todos os tipos</option>
          <option value="Escultura">Escultura</option>
          <option value="Pintura">Pintura</option>
        </select>
      </div>

      {/* Tabela */}
      {filtradas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            fontFamily: 'var(--serif)',
            fontSize: '1.2rem',
            fontStyle: 'italic',
            color: 'var(--mid)',
          }}
        >
          Nenhuma obra encontrada.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--sans)',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(26,26,26,0.15)',
                  textAlign: 'left',
                }}
              >
                {['', 'Obra', 'Coleção', 'Tipo', 'Ano', 'Disponibilidade', 'Ações'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px 12px 0',
                      fontSize: '0.58rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--mid)',
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map(obra => {
                const badge = BADGE[obra.disponibilidade] || BADGE['Sob consulta'];
                return (
                  <tr
                    key={obra.slug}
                    style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}
                  >
                    {/* Thumbnail */}
                    <td style={{ padding: '16px 16px 16px 0', width: '60px' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          overflow: 'hidden',
                          background: '#0D0D0D',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={`https://picsum.photos/seed/${obra.imgSeeds[0]}/104/104`}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            filter: 'grayscale(20%) brightness(0.85)',
                          }}
                        />
                      </div>
                    </td>

                    {/* Título */}
                    <td style={{ padding: '16px 16px 16px 0', maxWidth: '220px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--serif)',
                          fontSize: '0.95rem',
                          fontStyle: 'italic',
                          color: 'var(--text)',
                          marginBottom: '2px',
                        }}
                      >
                        {obra.titulo}
                      </div>
                      {obra.destaque && (
                        <div
                          style={{
                            fontSize: '0.58rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'var(--mid)',
                          }}
                        >
                          ★ destaque
                        </div>
                      )}
                    </td>

                    {/* Coleção */}
                    <td
                      style={{
                        padding: '16px 16px 16px 0',
                        fontSize: '0.78rem',
                        color: 'var(--mid)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {obra.colecao}
                    </td>

                    {/* Tipo */}
                    <td
                      style={{
                        padding: '16px 16px 16px 0',
                        fontSize: '0.78rem',
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {obra.tipo}
                    </td>

                    {/* Ano */}
                    <td
                      style={{
                        padding: '16px 16px 16px 0',
                        fontSize: '0.78rem',
                        color: 'var(--text)',
                      }}
                    >
                      {obra.ano}
                    </td>

                    {/* Disponibilidade */}
                    <td style={{ padding: '16px 16px 16px 0' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          background: badge.bg,
                          color: badge.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {obra.disponibilidade}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '16px 0', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() =>
                          navigate(`/painel-ayume/obras/${obra.slug}/editar`)
                        }
                        style={{
                          fontFamily: 'var(--sans)',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'var(--text)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginRight: '16px',
                          textDecoration: 'underline',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(obra.slug, obra.titulo)}
                        style={{
                          fontFamily: 'var(--sans)',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#8a3030',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
