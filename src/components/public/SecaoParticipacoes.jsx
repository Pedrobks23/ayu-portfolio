import { useParticipacoes } from '@/hooks/useParticipacoes';
import { useT } from '@/i18n/useT';
import { useLang } from '@/context/LanguageContext';
import { getLocalized } from '@/i18n/getLocalized';

export default function SecaoParticipacoes() {
  const { participacoes, loading } = useParticipacoes();
  const { t } = useT();
  const { lang } = useLang();

  if (loading || participacoes.length === 0) return null;

  return (
    <section
      style={{
        padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,72px)',
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

      <div>
        {participacoes.map((p, idx) => {
          const titulo = getLocalized(p, 'titulo', lang) || p.titulo;
          const local = getLocalized(p, 'local', lang) || p.local;
          const data = getLocalized(p, 'data', lang) || p.data;

          return (
            <div
              key={p.id}
              style={{
                borderBottom: '1px solid rgba(26,26,26,0.1)',
                padding: '24px 0',
                borderTop: idx === 0 ? '1px solid rgba(26,26,26,0.1)' : 'none',
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
                    fontSize: '1.4rem',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: 'var(--text)',
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
                    fontSize: '0.95rem',
                    color: 'var(--mid)',
                  }}
                >
                  {local}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
