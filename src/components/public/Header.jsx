import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IgButton, IgIcon } from '@/components/public/ui';
import { useT } from '@/i18n/useT';
import { useLang } from '@/context/LanguageContext';

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

function LangToggle({ inMenu = false }) {
  const { lang, setLang } = useLang();
  const activeSt = { color: 'var(--text)' };
  const inactiveSt = { color: 'var(--mid)', cursor: 'pointer' };
  const base = {
    fontFamily: 'var(--sans)',
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    padding: 0,
    lineHeight: 1,
  };

  return (
    <div style={{ ...base, cursor: 'default', ...(inMenu ? { justifyContent: 'center', marginTop: '8px' } : {}) }}>
      <span
        onClick={() => lang !== 'pt' && setLang('pt')}
        style={lang === 'pt' ? activeSt : { ...inactiveSt }}
        role="button"
        aria-pressed={lang === 'pt'}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setLang('pt')}
      >
        PT
      </span>
      <span style={{ color: 'var(--mid)' }}>/</span>
      <span
        onClick={() => lang !== 'en' && setLang('en')}
        style={lang === 'en' ? activeSt : { ...inactiveSt }}
        role="button"
        aria-pressed={lang === 'en'}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setLang('en')}
      >
        EN
      </span>
    </div>
  );
}

function MobileMenu({ open, onClose, links, navigate, isActive, config }) {
  const { t } = useT();
  const { config: _conf } = config;
  const closeRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out',
      }}
    >
      {/* Botão fechar */}
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Fechar menu"
        style={{
          position: 'absolute',
          top: '18px',
          right: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text)',
          fontSize: '1.4rem',
          lineHeight: 1,
          padding: '8px',
        }}
      >
        ×
      </button>

      {/* Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
        {links.map(l => (
          <button
            key={l.path}
            onClick={() => { navigate(l.path); onClose(); }}
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.4rem',
              fontWeight: 300,
              color: isActive(l.path) ? 'var(--text)' : 'var(--mid)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              fontStyle: 'italic',
            }}
          >
            {l.label}
          </button>
        ))}
      </nav>

      {/* Toggle idioma */}
      <LangToggle inMenu />

      {/* Instagram */}
      <div style={{ marginTop: '40px' }}>
        <IgButton />
      </div>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useT();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  const links = [
    { path: '/',         label: t('nav.inicio')   },
    { path: '/catalogo', label: t('nav.catalogo') },
    { path: '/sobre',    label: t('nav.sobre')    },
    { path: '/contato',  label: t('nav.contato')  },
  ];

  return (
    <>
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
          padding: isMobile ? '0 16px' : '0 clamp(24px, 5vw, 72px)',
          height: '64px',
          transition: 'all 0.3s ease-out',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'var(--serif)',
            fontSize: isMobile ? 'clamp(0.95rem, 4vw, 1.1rem)' : '1.1rem',
            letterSpacing: '0.06em',
            fontWeight: 400,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Ayume Andrade
        </button>

        {isMobile ? (
          /* Hambúrguer */
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              flexShrink: 0,
            }}
          >
            <span style={{ display: 'block', width: '24px', height: '1.5px', background: 'var(--text)', transition: 'all 0.25s ease-out' }} />
            <span style={{ display: 'block', width: '24px', height: '1.5px', background: 'var(--text)', transition: 'all 0.25s ease-out' }} />
            <span style={{ display: 'block', width: '24px', height: '1.5px', background: 'var(--text)', transition: 'all 0.25s ease-out' }} />
          </button>
        ) : (
          /* Nav desktop */
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
            <LangToggle />
            <IgButton />
          </nav>
        )}
      </header>

      {/* Menu mobile overlay */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        navigate={navigate}
        isActive={isActive}
        config={{}}
      />
    </>
  );
}
