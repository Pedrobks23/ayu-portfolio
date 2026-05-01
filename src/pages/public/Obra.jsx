import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import FadeImg from '@/components/public/FadeImg';
import ObraCard from '@/components/public/ObraCard';
import Footer from '@/components/public/Footer';
import { BtnBlack } from '@/components/public/ui';

function dispColor(disponibilidade) {
  if (disponibilidade === 'Disponível') return '#3a6b3a';
  if (disponibilidade === 'Indisponível') return '#8a3030';
  return 'var(--mid)';
}

export default function Obra() {
  const { slug } = useParams();
  const { obras, getObra } = useObras();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [visible, setVisible] = useState(false);

  const obra = getObra(slug) || obras[0];

  useEffect(() => {
    setActiveImg(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  if (!obra) return null;

  const outras = obras.filter(o => o.slug !== slug).slice(0, 3);

  return (
    <div
      style={{
        paddingTop: '64px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.28s ease-out',
      }}
    >
      {/* Breadcrumb */}
      <div style={{ padding: '24px clamp(24px,5vw,72px) 0' }}>
        <button
          onClick={() => navigate('/catalogo')}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ← Catálogo
        </button>
      </div>

      {/* Layout 50/50 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(32px,4vw,80px)',
          padding: 'clamp(32px,4vw,64px) clamp(24px,5vw,72px)',
          alignItems: 'start',
        }}
      >
        {/* Imagem */}
        <div>
          <div
            style={{
              background: '#0D0D0D',
              aspectRatio: '4/5',
              overflow: 'hidden',
            }}
          >
            <FadeImg
              key={activeImg}
              src={`https://picsum.photos/seed/${obra.imgSeeds[activeImg]}/800/1000`}
              alt={obra.titulo}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: 'grayscale(8%) contrast(1.05) brightness(0.85)',
              }}
            />
          </div>
          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            {obra.imgSeeds.map((seed, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                aria-label={`Ver imagem ${i + 1}`}
                style={{
                  flex: 1,
                  aspectRatio: '1/1',
                  overflow: 'hidden',
                  background: '#0D0D0D',
                  border: i === activeImg
                    ? '2px solid var(--text)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'border-color 0.2s',
                }}
              >
                <img
                  src={`https://picsum.photos/seed/${seed}/200/200`}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'grayscale(15%) brightness(0.8)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Informações */}
        <div style={{ paddingTop: '8px' }}>
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              marginBottom: '14px',
            }}
          >
            {obra.tipo}
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.15,
              marginBottom: '40px',
            }}
          >
            {obra.titulo}
          </h1>

          {/* Tabela de metadados */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: obra.descricao ? '24px' : '40px',
            }}
          >
            <tbody>
              {[
                { label: 'Coleção', value: obra.colecao, serif: true },
                { label: 'Ano', value: obra.ano },
                { label: 'Técnica', value: obra.tecnica },
                { label: 'Dimensões', value: obra.dimensoes },
                {
                  label: 'Disponibilidade',
                  value: obra.disponibilidade,
                  color: dispColor(obra.disponibilidade),
                },
              ].filter(row => row.value).map(({ label, value, serif, color }) => (
                <tr
                  key={label}
                  style={{ borderBottom: '1px solid rgba(26,26,26,0.1)' }}
                >
                  <td
                    style={{
                      padding: '16px 0',
                      fontFamily: 'var(--sans)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--mid)',
                      width: '42%',
                      verticalAlign: 'top',
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: '16px 0',
                      fontFamily: serif ? 'var(--serif)' : 'var(--sans)',
                      fontSize: serif ? '1rem' : '0.85rem',
                      textAlign: 'right',
                      color: color || 'var(--text)',
                      fontStyle: serif ? 'italic' : 'normal',
                    }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Descrição opcional */}
          {obra.descricao && (
            <div
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.82rem',
                lineHeight: 1.85,
                color: 'var(--mid)',
                marginBottom: '40px',
              }}
            >
              {obra.descricao}
            </div>
          )}

          <BtnBlack
            label="Consultar disponibilidade →"
            onClick={() => navigate(`/contato?obra=${obra.slug}`)}
          />
        </div>
      </div>

      {/* Outras obras */}
      {outras.length > 0 && (
        <section
          style={{
            padding: '40px clamp(24px,5vw,72px) clamp(64px,8vw,100px)',
            borderTop: '1px solid rgba(26,26,26,0.08)',
          }}
        >
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
            Continuar explorando
          </div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.5rem,3vw,2.2rem)',
              fontWeight: 300,
              marginBottom: '36px',
            }}
          >
            Outras obras
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '28px',
            }}
          >
            {outras.map(o => (
              <ObraCard key={o.slug} obra={o} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
