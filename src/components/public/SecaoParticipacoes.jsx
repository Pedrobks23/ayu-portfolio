import { useState } from 'react';
import { useParticipacoes } from '@/hooks/useParticipacoes';
import { useT } from '@/i18n/useT';
import { useLang } from '@/context/LanguageContext';
import { getLocalized } from '@/i18n/getLocalized';
import { separarParticipacoes } from '@/lib/participacoes';

function ItemParticipacao({ p, primeiro, lang, apagado }) {
  const titulo = getLocalized(p, 'titulo', lang) || p.titulo;
  const local = getLocalized(p, 'local', lang) || p.local;
  const data = getLocalized(p, 'data', lang) || p.data;

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(26,26,26,0.1)',
        padding: apagado ? '18px 0' : '24px 0',
        borderTop: primeiro ? '1px solid rgba(26,26,26,0.1)' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '8px 24px',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: apagado ? '1.15rem' : '1.4rem',
            fontStyle: 'italic',
            fontWeight: 300,
            color: apagado ? 'var(--mid)' : 'var(--text)',
          }}
        >
          {titulo}
        </div>
        {data && (
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              whiteSpace: 'nowrap',
            }}
          >
            {data}
          </div>
        )}
      </div>
      {local && (
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: apagado ? '0.88rem' : '0.95rem',
            color: 'var(--mid)',
          }}
        >
          {local}
        </div>
      )}
    </div>
  );
}

export default function SecaoParticipacoes() {
  const { participacoes, loading } = useParticipacoes();
  const [mostrarPassadas, setMostrarPassadas] = useState(false);
  const { t } = useT();
  const { lang } = useLang();

  if (loading || participacoes.length === 0) return null;

  const { proximas, passadas } = separarParticipacoes(participacoes);

  return (
    <section
      style={{
        padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,72px) 0',
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
        {t('home.secaoParticipacoesKicker')}
      </div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(1.8rem,3vw,2.8rem)',
          fontWeight: 300,
          marginBottom: '40px',
        }}
      >
        {t('home.secaoParticipacoesTitulo')}
      </div>

      {proximas.length > 0 ? (
        <div>
          {proximas.map((p, idx) => (
            <ItemParticipacao key={p.id} p={p} primeiro={idx === 0} lang={lang} />
          ))}
        </div>
      ) : (
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '1.1rem',
            fontStyle: 'italic',
            color: 'var(--mid)',
          }}
        >
          {t('home.semParticipacoes')}
        </div>
      )}

      {passadas.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <button
            type="button"
            onClick={() => setMostrarPassadas(v => !v)}
            aria-expanded={mostrarPassadas}
            aria-controls="participacoes-passadas"
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>
              {mostrarPassadas ? t('home.ocultarPassadas') : t('home.verPassadas')} ({passadas.length})
            </span>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                transition: 'transform 0.2s ease-out',
                transform: mostrarPassadas ? 'rotate(180deg)' : 'none',
              }}
            >
              ↓
            </span>
          </button>

          {mostrarPassadas && (
            <div id="participacoes-passadas" style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
              <div
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'var(--mid)',
                  marginBottom: '16px',
                }}
              >
                {t('home.participacoesPassadas')}
              </div>
              {passadas.map((p, idx) => (
                <ItemParticipacao key={p.id} p={p} primeiro={idx === 0} lang={lang} apagado />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
