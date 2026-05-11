import { useNavigate } from 'react-router-dom';
import { IgButton } from '@/components/public/ui';
import { useT } from '@/i18n/useT';

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useT();
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(26,26,26,0.1)',
        padding: '48px clamp(24px,5vw,72px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
      }}
    >
      <button
        onClick={() => navigate('/')}
        style={{
          fontFamily: 'var(--serif)',
          fontSize: '1rem',
          letterSpacing: '0.06em',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text)',
        }}
      >
        Ayume Andrade
      </button>
      <div
        style={{
          fontFamily: 'var(--sans)',
          fontSize: '0.62rem',
          color: 'var(--mid)',
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <IgButton />
        {t('footer.direitos')}
      </div>
    </footer>
  );
}
