import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FadeImg from '@/components/public/FadeImg';
import Footer from '@/components/public/Footer';
import { HoverUnderlineBtn } from '@/components/public/ui';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

export default function Sobre() {
  const navigate = useNavigate();
  const { config } = useConfiguracoes();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const bio = config?.bio || '';

  return (
    <div
      style={{
        paddingTop: '64px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.28s ease-out',
      }}
    >
      <section style={{ padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,72px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(48px,6vw,96px)',
            alignItems: 'start',
          }}
        >
          {/* Foto */}
          <div>
            <div
              style={{
                background: '#0D0D0D',
                aspectRatio: '3/4',
                overflow: 'hidden',
              }}
            >
              <FadeImg
                src="https://picsum.photos/seed/ayume-artist/600/800"
                alt="Ayume Andrade"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'grayscale(20%) contrast(1.05) brightness(0.8)',
                }}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--mid)',
                marginBottom: '12px',
              }}
            >
              A artista
            </div>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2.2rem,4vw,3.4rem)',
                fontWeight: 300,
                marginBottom: '36px',
              }}
            >
              Ayume Andrade
            </h1>

            <div
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.82rem',
                lineHeight: 1.85,
                color: '#555',
                marginBottom: '32px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {bio}
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <HoverUnderlineBtn label="Contato →" onClick={() => navigate('/contato')} />
              <HoverUnderlineBtn label="Catálogo →" onClick={() => navigate('/catalogo')} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
