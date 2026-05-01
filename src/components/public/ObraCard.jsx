import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FadeImg from '@/components/public/FadeImg';

export default function ObraCard({ obra, onHoverChange }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const imgUrl = `https://picsum.photos/seed/${obra.imgSeeds[0]}/600/750`;

  function handleEnter() {
    setHovered(true);
    onHoverChange && onHoverChange(true);
  }
  function handleLeave() {
    setHovered(false);
    onHoverChange && onHoverChange(false);
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
          aspectRatio: '4/5',
        }}
      >
        <FadeImg
          src={imgUrl}
          alt={obra.titulo}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.5s ease-out',
            filter: 'grayscale(10%) contrast(1.08) brightness(0.82)',
          }}
        />
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
