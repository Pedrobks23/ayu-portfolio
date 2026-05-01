import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
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
          padding: '0 clamp(24px, 5vw, 72px)',
          height: '64px',
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
            }}
          >
            Modo administrativo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Banner de demonstração */}
      <div
        role="status"
        style={{
          background: 'rgba(197,192,186,0.25)',
          borderBottom: '1px solid rgba(197,192,186,0.6)',
          padding: '12px clamp(24px,5vw,72px)',
          fontFamily: 'var(--sans)',
          fontSize: '0.72rem',
          color: 'var(--mid)',
          letterSpacing: '0.02em',
        }}
      >
        ⚠️{' '}
        <strong style={{ color: 'var(--text)', fontWeight: 500 }}>
          Modo de demonstração:
        </strong>{' '}
        as alterações ficam salvas apenas neste navegador. Será conectado ao banco de dados na próxima fase.
      </div>

      {/* Conteúdo */}
      <main style={{ padding: 'clamp(32px,4vw,56px) clamp(24px,5vw,72px)' }}>
        {children}
      </main>
    </div>
  );
}
