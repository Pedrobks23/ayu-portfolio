import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { isPassada, separarParticipacoes } from '@/lib/participacoes';

const subtituloStyle = {
  fontFamily: 'var(--sans)',
  fontSize: '0.6rem',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--mid)',
  margin: '0 0 4px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(26,26,26,0.15)',
};

export default function Participacoes() {
  const navigate = useNavigate();
  const [participacoes, setParticipacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [movendo, setMovendo] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'participacoes'), orderBy('ordem', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setParticipacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  async function handleToggleVisivel(id, atual) {
    setToggling(id);
    try {
      await updateDoc(doc(db, 'participacoes', id), {
        visivel: !atual,
        atualizadoEm: serverTimestamp(),
      });
    } finally {
      setToggling(null);
    }
  }

  // Grava a escolha explícita: passada true/false (sai do modo automático)
  async function handleMover(p) {
    setMovendo(p.id);
    try {
      await updateDoc(doc(db, 'participacoes', p.id), {
        passada: !isPassada(p),
        atualizadoEm: serverTimestamp(),
      });
    } finally {
      setMovendo(null);
    }
  }

  const { proximas, passadas } = separarParticipacoes(participacoes);

  async function handleDeletar(id, titulo) {
    if (!window.confirm(`Deletar "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    setDeletando(id);
    try {
      await deleteDoc(doc(db, 'participacoes', id));
    } finally {
      setDeletando(null);
    }
  }

  function renderItem(p) {
    return (
      <div
        key={p.id}
        style={{
          borderBottom: '1px solid rgba(26,26,26,0.1)',
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: p.visivel === false ? 'var(--mid)' : 'var(--text)',
              }}
            >
              {p.titulo}
            </div>
            {p.visivel === false && (
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a3030' }}>
                ● oculta
              </span>
            )}
          </div>
          {p.data && (
            <div style={{ fontFamily: 'var(--sans)', fontSize: '0.7rem', color: 'var(--mid)', letterSpacing: '0.1em', marginBottom: '2px' }}>
              {p.data}
            </div>
          )}
          {p.local && (
            <div style={{ fontFamily: 'var(--serif)', fontSize: '0.85rem', color: 'var(--mid)' }}>
              {p.local}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleMover(p)}
            disabled={movendo === p.id}
            title={p.passada === undefined ? 'Hoje está no modo automático (pela data)' : undefined}
            style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', background: 'none', border: 'none', cursor: movendo === p.id ? 'not-allowed' : 'pointer', opacity: movendo === p.id ? 0.5 : 1 }}
          >
            {movendo === p.id ? '...' : isPassada(p) ? '↑ Voltar p/ próximas' : '↓ Mover p/ passadas'}
          </button>
          <button
            onClick={() => navigate(`/painel-ayume/participacoes/${p.id}/editar`)}
            style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Editar
          </button>
          <button
            onClick={() => handleToggleVisivel(p.id, p.visivel !== false)}
            disabled={toggling === p.id}
            style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: p.visivel === false ? '#3a6b3a' : 'var(--mid)', background: 'none', border: 'none', cursor: toggling === p.id ? 'not-allowed' : 'pointer', opacity: toggling === p.id ? 0.5 : 1 }}
          >
            {toggling === p.id ? '...' : p.visivel === false ? 'Publicar' : 'Ocultar'}
          </button>
          <button
            onClick={() => handleDeletar(p.id, p.titulo)}
            disabled={deletando === p.id}
            style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a3030', background: 'none', border: 'none', cursor: deletando === p.id ? 'not-allowed' : 'pointer', opacity: deletando === p.id ? 0.5 : 1 }}
          >
            {deletando === p.id ? '...' : 'Deletar'}
          </button>
        </div>
      </div>
    );
  }

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
            Participações ({participacoes.length})
          </div>
        </div>
        <button
          onClick={() => navigate('/painel-ayume/participacoes/nova')}
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
          + Nova participação
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--mid)', letterSpacing: '0.1em' }}>
          Carregando...
        </div>
      ) : participacoes.length === 0 ? (
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
          Nenhuma participação cadastrada.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {[
            { titulo: `Próximas (${proximas.length})`, lista: proximas, vazio: 'Nenhuma participação próxima.' },
            { titulo: `Passadas (${passadas.length})`, lista: passadas, vazio: 'Nenhuma participação passada.' },
          ].map(grupo => (
            <div key={grupo.titulo}>
              <h2 style={subtituloStyle}>{grupo.titulo}</h2>
              {grupo.lista.length === 0 ? (
                <div style={{ padding: '20px 0', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--mid)' }}>
                  {grupo.vazio}
                </div>
              ) : (
                grupo.lista.map(renderItem)
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
