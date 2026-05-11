import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import Footer from '@/components/public/Footer';
import { BtnBlack } from '@/components/public/ui';
import { useT } from '@/i18n/useT';

export default function Contato() {
  const [searchParams] = useSearchParams();
  const { getObra } = useObras();
  const { config } = useConfiguracoes();
  const [visible, setVisible] = useState(false);
  const { t } = useT();

  const obraSlug = searchParams.get('obra');
  const obraPreset = obraSlug ? getObra(obraSlug) : null;

  const [form, setForm] = useState({
    nome: '',
    email: '',
    obra: obraPreset?.titulo || '',
    mensagem: '',
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (obraPreset?.titulo) setForm(f => ({ ...f, obra: obraPreset.titulo }));
  }, [obraPreset?.titulo]);

  useEffect(() => {
    const tId = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(tId);
  }, []);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  const contato = config?.contato || {};
  const emailContato = contato.email || 'ayumeandrade@gmail.com';
  const instagram = contato.instagram || '@ayuandrade';
  const instagramUrl = contato.instagramUrl || 'https://www.instagram.com/ayuandrade/';

  const inputStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid rgba(26,26,26,0.2)',
    background: 'transparent',
    padding: '12px 0',
    fontFamily: 'var(--serif)',
    fontSize: '1rem',
    color: 'var(--text)',
    outline: 'none',
  };
  const labelStyle = {
    fontFamily: 'var(--sans)',
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--mid)',
    display: 'block',
    marginBottom: '10px',
  };

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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(48px,6vw,96px)',
            alignItems: 'start',
          }}
        >
          {/* Formulário */}
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
              {t('contato.kicker')}
            </div>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2.2rem,4vw,3.4rem)',
                fontWeight: 300,
                marginBottom: '40px',
              }}
            >
              {t('contato.titulo')}
            </h1>

            {sent ? (
              <div style={{ padding: '48px 0' }}>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: '1.8rem',
                    fontStyle: 'italic',
                    marginBottom: '16px',
                  }}
                >
                  {t('contato.enviada')}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: '0.75rem',
                    color: 'var(--mid)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('contato.retornaremos')}
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                <div>
                  <label style={labelStyle} htmlFor="nome">{t('contato.labelNome')}</label>
                  <input id="nome" type="text" required value={form.nome}
                    onChange={e => set('nome', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="email">{t('contato.labelEmail')}</label>
                  <input id="email" type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="obra">{t('contato.labelObra')}</label>
                  <input id="obra" type="text" value={form.obra}
                    onChange={e => set('obra', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="mensagem">{t('contato.labelMensagem')}</label>
                  <textarea id="mensagem" rows={5} value={form.mensagem}
                    onChange={e => set('mensagem', e.target.value)}
                    style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <BtnBlack label={t('contato.enviar')} type="submit" style={{ marginTop: '8px' }} />
              </form>
            )}
          </div>

          {/* Informações */}
          <div style={{ paddingTop: '8px' }}>
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
