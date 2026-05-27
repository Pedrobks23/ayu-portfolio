import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/public/Footer';
import { HoverUnderlineBtn } from '@/components/public/ui';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useT } from '@/i18n/useT';
import { useLang } from '@/context/LanguageContext';
import { getLocalized } from '@/i18n/getLocalized';

export default function Sobre() {
  const navigate = useNavigate();
  const { config } = useConfiguracoes();
  const [visible, setVisible] = useState(false);
  const { t } = useT();
  const { lang } = useLang();

  useEffect(() => {
    const tId = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(tId);
  }, []);

  const bio = getLocalized(config, 'bio', lang) || '';

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
            maxWidth: '640px',
          }}
        >
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
              {t('sobre.kicker')}
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
              <HoverUnderlineBtn label={t('sobre.btnContato')} onClick={() => navigate('/contato')} />
              <HoverUnderlineBtn label={t('sobre.btnCatalogo')} onClick={() => navigate('/catalogo')} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
