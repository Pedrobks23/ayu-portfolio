import { useState, useEffect } from 'react';
import { useObras } from '@/context/ObrasContext';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import HeroSection from '@/components/public/HeroSection';
import ObraCard from '@/components/public/ObraCard';
import Footer from '@/components/public/Footer';
import { HoverUnderlineBtn } from '@/components/public/ui';
import { useNavigate } from 'react-router-dom';

export default function Inicio() {
  const { obras } = useObras();
  const { config } = useConfiguracoes();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const destaques = obras
    .filter(o => o.destaque && o.visivel !== false)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    .slice(0, 4);

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.28s ease-out' }}>
      <HeroSection
        heroImagem={config?.heroImagem}
        portfolioVisualUrl={config?.portfolioVisualUrl}
      />

      {/* Obras em destaque */}
      <section style={{ padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,72px)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '48px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--mid)',
                marginBottom: '10px',
              }}
            >
              Seleção atual
            </div>
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                fontWeight: 300,
              }}
            >
              Obras em destaque
            </div>
          </div>
          <HoverUnderlineBtn
            label="Ver catálogo completo →"
            onClick={() => navigate('/catalogo')}
          />
        </div>

        {destaques.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '32px',
            }}
          >
            {destaques.map(o => (
              <ObraCard key={o.slug} obra={o} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              fontFamily: 'var(--serif)',
              fontSize: '1.2rem',
              fontStyle: 'italic',
              color: 'var(--mid)',
            }}
          >
            Nenhuma obra em destaque no momento.
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
