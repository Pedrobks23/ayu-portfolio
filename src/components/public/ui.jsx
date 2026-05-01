import { useState } from 'react';

// Botão CTA preto com preenchimento da esquerda pra direita no hover
export function BtnBlack({ label, onClick, style, type = 'button' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--text)',
        color: 'var(--bg)',
        fontFamily: 'var(--sans)',
        fontSize: '0.62rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        border: 'none',
        padding: '20px 40px',
        cursor: 'pointer',
        width: '100%',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          left: hovered ? '0%' : '-100%',
          background: '#2a2a2a',
          transition: 'left 0.4s ease-out',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
    </button>
  );
}

// Botão de texto com underline animado
export function HoverUnderlineBtn({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--sans)',
        fontSize: '0.65rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text)',
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
          width: hovered ? '100%' : '0%',
          transition: 'width 0.3s ease-out',
          display: 'block',
        }}
      />
    </button>
  );
}

// Pill de filtro
export function Pill({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--sans)',
        fontSize: '0.62rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        border: `1px solid ${active || hovered ? 'var(--text)' : 'rgba(26,26,26,0.25)'}`,
        padding: '9px 22px',
        cursor: 'pointer',
        background: active ? 'var(--text)' : 'transparent',
        color: active ? 'var(--bg)' : 'var(--text)',
        transition: 'all 0.25s ease-out',
      }}
    >
      {label}
    </button>
  );
}

// Ícone do Instagram
export function IgIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Botão do Instagram
export function IgButton() {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="https://instagram.com/ayumeandrade"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram de Ayume Andrade"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#1A1A1A',
        color: 'white',
        transition: 'transform 0.25s ease-out, opacity 0.25s ease-out',
        transform: hov ? 'scale(1.1)' : 'scale(1)',
        opacity: hov ? 0.85 : 1,
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <IgIcon size={14} />
    </a>
  );
}
