import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function CropModal({ imagemUrl, cropInicial, onConfirmar, onFechar }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setArea(croppedAreaPixels);
  }, []);

  function handleConfirmar() {
    if (!area) return;
    onConfirmar({ x: area.x, y: area.y, w: area.width, h: area.height });
  }

  // react-easy-crop usa { x, y, width, height }; nosso shape usa { x, y, w, h }
  const initialCroppedAreaPixels = cropInicial
    ? { x: cropInicial.x, y: cropInicial.y, width: cropInicial.w, height: cropInicial.h }
    : undefined;

  return (
    <div
      onClick={onFechar}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          width: 'min(520px, 100%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            padding: '20px 24px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(26,26,26,0.1)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.58rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
            }}
          >
            Ajustar enquadramento
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'var(--mid)',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Área do cropper */}
        <div style={{ position: 'relative', width: '100%', height: '380px', background: '#111' }}>
          <Cropper
            image={imagemUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            initialCroppedAreaPixels={initialCroppedAreaPixels}
          />
        </div>

        {/* Slider de zoom + legenda */}
        <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                color: 'var(--mid)',
                whiteSpace: 'nowrap',
              }}
            >
              Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.6rem',
              color: 'var(--mid)',
              letterSpacing: '0.05em',
            }}
          >
            Arraste e use o zoom para enquadrar
          </div>
        </div>

        {/* Botões */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={handleConfirmar}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              background: 'var(--text)',
              color: 'var(--bg)',
              border: 'none',
              padding: '14px 28px',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            Confirmar
          </button>
          <button
            onClick={onFechar}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid rgba(26,26,26,0.3)',
              padding: '14px 28px',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
