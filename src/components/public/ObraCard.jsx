import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Imagem from '@/components/public/Imagem';

export default function ObraCard({ obra, onHoverChange }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const capa = obra.imagens?.[0];

  function handleEnter() {
    setHovered(true);
    onHoverChange?.(true);
  }
  function handleLeave() {
    setHovered(false);
    onHoverChange?.(false);
  }

  return (
    <div
      onClick={() => navigate(`/obra/${obra.slug}`)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#0D0D0D',
          aspectRatio: capa?.width && capa?.height ? `${capa.width}/${capa.height}` : '4/5',
        }}
      >
        {capa ? (
          <Imagem
            publicId={capa.publicId}
            alt={obra.titulo}
            size="card"
            style={{
              transform: hovered ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.5s ease-out',
              filter: 'grayscale(10%) contrast(1.08) brightness(0.82)',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)',
                textTransform: 'uppercase',
              }}
            >
              sem imagem
            </span>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.52)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.35s ease-out',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '28px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.3rem',
              color: 'white',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.3,
            }}
          >
            {obra.titulo}
          </div>
        </div>
      </div>
      <div style={{ paddingTop: '14px' }}>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '1.05rem',
            fontWeight: 400,
            color: 'var(--text)',
          }}
        >
          {obra.titulo}
        </div>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.68rem',
            color: 'var(--mid)',
            marginTop: '4px',
            letterSpacing: '0.03em',
          }}
        >
          {obra.tipo} · {obra.ano}
        </div>
      </div>
    </div>
  );
}
