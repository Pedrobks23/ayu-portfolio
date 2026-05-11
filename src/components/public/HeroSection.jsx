import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Imagem from '@/components/public/Imagem';
import { useT } from '@/i18n/useT';

export default function HeroSection({ heroImagem, portfolioVisualUrl }) {
  const [btnHovered, setBtnHovered]   = useState(false);
  const [ghostHovered, setGhostHovered] = useState(false);
  const navigate = useNavigate();
  const { t } = useT();

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
          bottom: 'clamp(4vh, 6vh, 10vh)',
          left: 'clamp(20px, 5vw, 96px)',
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
          aria-label={t('home.ctaExplore')}
          style={{
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.65)',
            background: 'transparent',
            color: 'white',
            padding: 'clamp(12px,1.5vw,15px) clamp(22px,3vw,36px)',
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
          <span style={{ position: 'relative', zIndex: 1 }}>{t('home.ctaExplore')}</span>
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
              padding: 'clamp(10px,1.2vw,12px) clamp(20px,2.5vw,28px)',
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
            {t('home.ctaPortfolio')} ↗
          </a>
        )}
      </div>
    </div>
  );
}
