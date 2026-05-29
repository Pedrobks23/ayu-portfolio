import { useState, useEffect } from 'react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import Footer from '@/components/public/Footer';
import { useT } from '@/i18n/useT';

export default function Contato() {
  const { config } = useConfiguracoes();
  const [visible, setVisible] = useState(false);
  const { t } = useT();

  useEffect(() => {
    const tId = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(tId);
  }, []);

  const contato = config?.contato || {};
  const emailContato = contato.email || 'ayumeandrade00@gmail.com';
  const instagram = contato.instagram || '@ayuandrade';
  const instagramUrl = contato.instagramUrl || 'https://www.instagram.com/ayuandrade/';

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
            fontFamily: 'var(--sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            marginBottom: '12px',
          }}
        >
          {t('contato.kicker')}
        </div>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2.2rem,4vw,3.4rem)',
            fontWeight: 300,
            marginBottom: '64px',
          }}
        >
          {t('contato.titulo')}
        </h1>

        {/* Informações */}
        <div style={{ maxWidth: '480px' }}>
            <div style={{ marginBottom: '40px' }}>
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
                {t('contato.labelWhatsApp')}
              </div>
              <a
                href={`https://wa.me/${contato.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: 'var(--text)',
                  textDecoration: 'none',
                }}
              >
                {t('contato.abrirWhatsApp')}
              </a>
            </div>

            <div style={{ marginBottom: '40px' }}>
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
                {t('contato.labelEmailContato')}
              </div>
              <a
                href={`mailto:${emailContato}`}
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: 'var(--text)',
                  textDecoration: 'none',
                }}
              >
                {emailContato}
              </a>
            </div>

            <div>
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
                {t('contato.labelInstagram')}
              </div>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  color: 'var(--text)',
                  textDecoration: 'none',
                }}
              >
                {instagram}
              </a>
            </div>

            <div
              style={{
                marginTop: '64px',
                paddingTop: '40px',
                borderTop: '1px solid rgba(26,26,26,0.1)',
                fontFamily: 'var(--sans)',
                fontSize: '0.72rem',
                lineHeight: 1.8,
                color: 'var(--mid)',
              }}
            >
              {t('contato.respostaInfo')}
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
