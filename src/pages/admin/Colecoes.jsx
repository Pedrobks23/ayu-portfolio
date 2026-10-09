import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { useObras } from '@/context/ObrasContext';
import { useColecoes } from '@/hooks/useColecoes';
import { chaveColecao, obraPertence } from '@/lib/colecoes';

const acaoStyle = {
  fontFamily: 'var(--sans)',
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

export default function Colecoes() {
  const navigate = useNavigate();
  const { obras } = useObras();
  const { colecoes, loading } = useColecoes();
  const [ocupado, setOcupado] = useState(null);

  // Nomes usados nas obras que ainda não viraram coleção cadastrada
  const naoCadastradas = [
    ...new Map(
      obras
        .filter(o => o.colecao && !colecoes.some(c => obraPertence(o, c)))
        .map(o => [chaveColecao(o.colecao), o.colecao])
    ).values(),
  ];

  async function handleToggleVisivel(c) {
    setOcupado(c.id);
    try {
      await updateDoc(doc(db, 'colecoes', c.id), {
        visivel: c.visivel === false,
        atualizadoEm: serverTimestamp(),
      });
    } finally {
      setOcupado(null);
    }
  }

  async function handleDeletar(c, qtd) {
    const aviso = qtd > 0
      ? `Deletar a coleção "${c.nome}"?\n\nAs ${qtd} obra(s) dela continuam cadastradas, mas passam a aparecer em "Outras obras" no catálogo.`
      : `Deletar a coleção "${c.nome}"?`;
    if (!window.confirm(aviso)) return;
    setOcupado(c.id);
    try {
      await deleteDoc(doc(db, 'colecoes', c.id));
    } finally {
      setOcupado(null);
    }
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
          <div style={{ fontFamily: 'var(--sans)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '8px' }}>
            Gestão de conteúdo
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300 }}>
            Coleções ({colecoes.length})
          </div>
        </div>
        <button
          onClick={() => navigate('/painel-ayume/colecoes/nova')}
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
          + Nova coleção
        </button>
      </div>

      {naoCadastradas.length > 0 && (
        <div
          style={{
            marginBottom: '40px',
            padding: '18px 20px',
            background: 'rgba(197,192,186,0.12)',
            borderLeft: '3px solid rgba(26,26,26,0.25)',
          }}
        >
          <div style={{ fontFamily: 'var(--sans)', fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '12px' }}>
            Estes nomes de coleção estão nas obras, mas ainda não foram cadastrados
            (sem descrição e fora do filtro do catálogo):
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {naoCadastradas.map(nome => (
              <button
                key={nome}
                onClick={() => navigate(`/painel-ayume/colecoes/nova?nome=${encodeURIComponent(nome)}`)}
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: 'none',
                  border: '1px solid rgba(26,26,26,0.3)',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  color: 'var(--text)',
                }}
              >
                + Cadastrar “{nome}”
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--mid)', letterSpacing: '0.1em' }}>
          Carregando...
        </div>
      ) : colecoes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--serif)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--mid)' }}>
          Nenhuma coleção cadastrada.
        </div>
      ) : (
        <div>
          {colecoes.map(c => {
            const qtd = obras.filter(o => obraPertence(o, c)).length;
            return (
              <div
                key={c.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontStyle: 'italic', color: c.visivel === false ? 'var(--mid)' : 'var(--text)' }}>
                      {c.nome}
                    </div>
                    {c.visivel === false && (
                      <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a3030' }}>
                        ● oculta
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '0.7rem', color: 'var(--mid)', letterSpacing: '0.05em' }}>
                    {qtd === 1 ? '1 obra' : `${qtd} obras`} · ordem {c.ordem ?? 0}
                    {!c.descricao && ' · sem descrição'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(`/painel-ayume/colecoes/${c.id}/editar`)}
                    style={{ ...acaoStyle, color: 'var(--text)', textDecoration: 'underline' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleVisivel(c)}
                    disabled={ocupado === c.id}
                    style={{ ...acaoStyle, color: c.visivel === false ? '#3a6b3a' : 'var(--mid)', opacity: ocupado === c.id ? 0.5 : 1 }}
                  >
                    {c.visivel === false ? 'Publicar' : 'Ocultar'}
                  </button>
                  <button
                    onClick={() => handleDeletar(c, qtd)}
                    disabled={ocupado === c.id}
                    style={{ ...acaoStyle, color: '#8a3030', opacity: ocupado === c.id ? 0.5 : 1 }}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
