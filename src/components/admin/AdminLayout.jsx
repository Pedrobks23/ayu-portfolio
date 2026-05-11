import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/painel-ayume/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header admin */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          background: 'rgba(245,242,238,0.97)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(26,26,26,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 5vw, 72px)',
          height: '64px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => navigate('/painel-ayume/dashboard')}
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.1rem',
              letterSpacing: '0.06em',
              fontWeight: 400,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
              whiteSpace: 'nowrap',
            }}
          >
            Ayume Andrade
          </button>
          <span
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              borderLeft: '1px solid rgba(26,26,26,0.15)',
              paddingLeft: '20px',
              whiteSpace: 'nowrap',
            }}
          >
            Modo administrativo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/painel-ayume/participacoes')}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Participações
          </button>
          <button
            onClick={() => navigate('/painel-ayume/configuracoes')}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Configurações
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Ver vitrine →
          </button>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              background: 'none',
              border: '1px solid rgba(26,26,26,0.3)',
              cursor: 'pointer',
              padding: '8px 18px',
              whiteSpace: 'nowrap',
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Banner produção */}
      <div
        role="status"
        style={{
          background: 'rgba(58,107,58,0.06)',
          borderBottom: '1px solid rgba(58,107,58,0.2)',
          padding: '10px clamp(16px,5vw,72px)',
          fontFamily: 'var(--sans)',
          fontSize: '0.7rem',
          color: '#3a6b3a',
          letterSpacing: '0.02em',
        }}
      >
        Conectado ao banco de dados de produção. Alterações são imediatamente públicas.
      </div>

      {/* Conteúdo */}
      <main style={{ padding: 'clamp(32px,4vw,56px) clamp(16px,5vw,72px)' }}>
        {children}
      </main>
    </div>
  );
}
