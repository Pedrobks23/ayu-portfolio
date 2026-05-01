import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ seed }) {
  const [btnHovered, setBtnHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '92vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#0D0D0D',
      }}
    >
      <img
        src={`https://picsum.photos/seed/${seed}/1920/1080`}
        alt="obra em destaque"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.68) contrast(1.05)',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10vh',
          left: 'clamp(32px, 6vw, 96px)',
        }}
      >
        <button
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={() => navigate('/catalogo')}
          aria-label="Explorar obras — ir para o catálogo"
          style={{
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.65)',
            background: 'transparent',
            color: 'white',
            padding: '15px 36px',
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: 0,
              left: btnHovered ? '0%' : '-100%',
              background: 'rgba(255,255,255,0.18)',
              transition: 'left 0.4s ease-out',
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>Explorar obras</span>
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              transform: btnHovered ? 'translateX(5px)' : 'translateX(0)',
              transition: 'transform 0.35s ease-out',
              fontSize: '0.9rem',
            }}
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}
