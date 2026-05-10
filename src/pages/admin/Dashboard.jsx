import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { urlOtimizada } from '@/lib/cloudinary';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CLOUDINARY_LINK = `https://console.cloudinary.com/pm/c-dlaew1b7j/media-explorer`;
const MAX_IMAGENS_POR_OBRA = 5;
const CLOUDINARY_FREE_STORAGE_GB = 25;

function UsageBar({ obras }) {
  const totalImagens = obras.reduce((acc, o) => acc + (o.imagens?.length || 0), 0);
  const maxPossivel = obras.length * MAX_IMAGENS_POR_OBRA;
  const pct = maxPossivel > 0 ? Math.round((totalImagens / maxPossivel) * 100) : 0;

  return (
    <div
      style={{
        marginBottom: '32px',
        padding: '20px 24px',
        background: 'rgba(197,192,186,0.12)',
        border: '1px solid rgba(197,192,186,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
          }}
        >
          Uso de imagens
        </div>
        <span />
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[
          { label: 'Imagens cadastradas', value: totalImagens },
          { label: 'Obras com imagens', value: obras.filter(o => o.imagens?.length > 0).length },
          { label: 'Obras sem imagens', value: obras.filter(o => !o.imagens?.length).length },
          { label: 'Limite por obra', value: `${MAX_IMAGENS_POR_OBRA} imgs` },
          { label: 'Armazenamento', value: `${CLOUDINARY_FREE_STORAGE_GB} GB` },
        ].map(({ label, value }) => (
          <div key={label}>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '1.4rem',
                fontWeight: 300,
                color: 'var(--text)',
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                color: 'var(--mid)',
                marginTop: '4px',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Barra de progresso imagens */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--sans)',
            fontSize: '0.58rem',
            color: 'var(--mid)',
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}
        >
          <span>{totalImagens} de {maxPossivel} slots possíveis preenchidos</span>
          <span>{pct}%</span>
        </div>
        <div
          style={{
            height: '3px',
            background: 'rgba(197,192,186,0.5)',
            width: '100%',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'var(--text)',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
}

const BADGE = {
  Disponível:    { bg: 'rgba(58,107,58,0.1)',    color: '#3a6b3a' },
  'Sob consulta': { bg: 'rgba(107,101,96,0.12)', color: 'var(--mid)' },
  Indisponível:  { bg: 'rgba(138,48,48,0.1)',    color: '#8a3030' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { obras, loading, deletarObra } = useObras();
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODAS');
  const [deletando, setDeletando] = useState(null);
  const [toggling, setToggling] = useState(null);

  async function handleToggleVisivel(slug, atual) {
    setToggling(slug);
    try {
      await updateDoc(doc(db, 'obras', slug), { visivel: !atual });
    } finally {
      setToggling(null);
    }
  }

  const filtradas = obras
    .filter(o => {
      const matchBusca = !busca ||
        o.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
        o.colecao?.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = tipoFiltro === 'TODAS' || o.tipo === tipoFiltro;
      return matchBusca && matchTipo;
    })
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  async function handleDeletar(slug, titulo) {
    if (!window.confirm(`Deletar a obra "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    setDeletando(slug);
    try {
      await deletarObra(slug);
    } finally {
      setDeletando(null);
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

      {/* Monitor de uso */}
      <UsageBar obras={obras} />

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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--mid)', letterSpacing: '0.1em' }}>
          Carregando...
        </div>
      ) : filtradas.length === 0 ? (
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
            style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--sans)' }}
          >
            <thead>
              <tr
                style={{ borderBottom: '1px solid rgba(26,26,26,0.15)', textAlign: 'left' }}
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
                const capa = obra.imagens?.[0];
                return (
                  <tr key={obra.slug} style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
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
                        {capa ? (
                          <img
                            src={urlOtimizada(capa.publicId, 'thumb')}
                            alt=""
                            loading="lazy"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              filter: 'grayscale(20%) brightness(0.85)',
                            }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#1A1A1A' }} />
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px 16px 0', maxWidth: '220px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--serif)',
                          fontSize: '0.95rem',
                          fontStyle: 'italic',
                          color: obra.visivel === false ? 'var(--mid)' : 'var(--text)',
                          marginBottom: '4px',
                        }}
                      >
                        {obra.titulo}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {obra.visivel === false && (
                          <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a3030' }}>
                            ● oculta
                          </span>
                        )}
                        {obra.destaque && obra.visivel !== false && (
                          <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>
                            ★ destaque
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px 16px 0', fontSize: '0.78rem', color: 'var(--mid)', whiteSpace: 'nowrap' }}>
                      {obra.colecao}
                    </td>
                    <td style={{ padding: '16px 16px 16px 0', fontSize: '0.78rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      {obra.tipo}
                    </td>
                    <td style={{ padding: '16px 16px 16px 0', fontSize: '0.78rem', color: 'var(--text)' }}>
                      {obra.ano}
                    </td>

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

                    <td style={{ padding: '16px 0', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => navigate(`/painel-ayume/obras/${obra.slug}/editar`)}
                        style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px', textDecoration: 'underline' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleVisivel(obra.slug, obra.visivel !== false)}
                        disabled={toggling === obra.slug}
                        title={obra.visivel === false ? 'Publicar' : 'Ocultar'}
                        style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: obra.visivel === false ? '#3a6b3a' : 'var(--mid)', background: 'none', border: 'none', cursor: toggling === obra.slug ? 'not-allowed' : 'pointer', marginRight: '12px', opacity: toggling === obra.slug ? 0.5 : 1 }}
                      >
                        {toggling === obra.slug ? '...' : obra.visivel === false ? 'Publicar' : 'Ocultar'}
                      </button>
                      <button
                        onClick={() => handleDeletar(obra.slug, obra.titulo)}
                        disabled={deletando === obra.slug}
                        style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a3030', background: 'none', border: 'none', cursor: deletando === obra.slug ? 'not-allowed' : 'pointer', opacity: deletando === obra.slug ? 0.5 : 1 }}
                      >
                        {deletando === obra.slug ? '...' : 'Deletar'}
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
