import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Imagem from '@/components/public/Imagem';

export default function HeroSection({ heroImagem, portfolioVisualUrl }) {
  const [btnHovered, setBtnHovered]   = useState(false);
  const [ghostHovered, setGhostHovered] = useState(false);
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
      {heroImagem?.publicId ? (
        <Imagem
          publicId={heroImagem.publicId}
          alt="obra em destaque"
          size="hero"
          priority
          style={{
            width: '100%',
            height: '100%',
            filter: 'brightness(0.68) contrast(1.05)',
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#111' }} />
      )}

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
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Botão principal */}
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

        {/* Botão ghost — portfólio visual */}
        {portfolioVisualUrl && (
          <a
            href={portfolioVisualUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setGhostHovered(true)}
            onMouseLeave={() => setGhostHovered(false)}
            style={{
              border: '1px solid rgba(255,255,255,0.3)',
              background: ghostHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: 'rgba(255,255,255,0.75)',
              padding: '12px 28px',
              fontFamily: 'var(--sans)',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.3s ease-out, color 0.3s ease-out',
            }}
          >
            Acessar portfólio visual ↗
          </a>
        )}
      </div>
    </div>
  );
}
