import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IgButton } from '@/components/public/ui';

const links = [
  { path: '/',        label: 'Início'   },
  { path: '/catalogo', label: 'Catálogo' },
  { path: '/sobre',    label: 'Sobre'    },
  { path: '/contato',  label: 'Contato'  },
];

function NavLink({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--sans)',
        fontSize: '0.62rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--text)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        padding: '4px 0',
      }}
    >
      {label}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '1px',
          background: 'var(--text)',
          width: hovered || active ? '100%' : '0%',
          transition: 'width 0.3s ease-out',
          display: 'block',
        }}
      />
    </button>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: scrolled ? 'rgba(245,242,238,0.95)' : 'rgba(245,242,238,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(26,26,26,0.1)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(24px, 5vw, 72px)',
        height: '64px',
        transition: 'all 0.3s ease-out',
      }}
    >
      <button
        onClick={() => navigate('/')}
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

      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(20px, 3vw, 44px)',
        }}
        aria-label="Navegação principal"
      >
        {links.map(l => (
          <NavLink
            key={l.path}
            label={l.label}
            active={isActive(l.path)}
            onClick={() => navigate(l.path)}
          />
        ))}
        <IgButton />
      </nav>
    </header>
  );
}
