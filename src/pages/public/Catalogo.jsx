import { useState, useEffect } from 'react';
import { useObras } from '@/context/ObrasContext';
import ObraCard from '@/components/public/ObraCard';
import FiltroCatalogo from '@/components/public/FiltroCatalogo';
import Footer from '@/components/public/Footer';

export default function Catalogo() {
  const { obras } = useObras();
  const [categoria, setCategoria] = useState('Todas');
  const [colecao, setColecao] = useState('Todas');
  const [anyHovered, setAnyHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const filtered = obras
    .filter(o => {
      if (o.visivel === false) return false;
      if (categoria !== 'Todas' && o.tipo !== categoria) return false;
      if (colecao !== 'Todas' && o.colecao !== colecao) return false;
      return true;
    })
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  return (
    <div
      style={{
        paddingTop: '64px',
        background: anyHovered ? '#ffffff' : 'var(--bg)',
        transition: 'background 0.4s ease-out',
        minHeight: '100vh',
        opacity: visible ? 1 : 0,
        transitionProperty: 'background, opacity',
        transitionDuration: '0.4s, 0.28s',
        transitionTimingFunction: 'ease-out',
      }}
    >
      <section style={{ padding: 'clamp(48px,6vw,88px) clamp(24px,5vw,72px) 40px' }}>
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
          Coleção completa
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2.4rem,5vw,4rem)',
            fontWeight: 300,
            marginBottom: '40px',
          }}
        >
          Catálogo
        </div>
        <FiltroCatalogo
          obras={obras}
          categoria={categoria}
          colecao={colecao}
          onCategoriaChange={setCategoria}
          onColecaoChange={setColecao}
        />
      </section>

      <section style={{ padding: '8px clamp(24px,5vw,72px) clamp(64px,8vw,120px)' }}>
        {filtered.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '32px 24px',
            }}
          >
            {filtered.map(o => (
              <ObraCard
                key={o.slug}
                obra={o}
                onHoverChange={h => setAnyHovered(h)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
              fontFamily: 'var(--serif)',
              fontSize: '1.2rem',
              fontStyle: 'italic',
              color: 'var(--mid)',
            }}
          >
            Nenhuma obra encontrada.
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
