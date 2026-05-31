import { useState, useEffect } from 'react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import Footer from '@/components/public/Footer';
import { useT } from '@/i18n/useT';
import { BtnBlack } from '@/components/public/ui';

const FORM_VAZIO = { nome: '', email: '', obra: '', mensagem: '' };

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

const kickerStyle = {
  fontFamily: 'var(--sans)',
  fontSize: '0.58rem',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'var(--mid)',
  marginBottom: '16px',
};

export default function Contato() {
  const { config } = useConfiguracoes();
  const [visible, setVisible] = useState(false);
  const { t } = useT();
  const [form, setForm] = useState(FORM_VAZIO);
  const [status, setStatus] = useState('idle'); // idle | enviando | sucesso | erro
  const [erroDetalhe, setErroDetalhe] = useState('');

  useEffect(() => {
    const tId = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(tId);
  }, []);

  const contato = config?.contato || {};
  const emailContato = contato.email || 'ayumeandrade00@gmail.com';
  const instagram = contato.instagram || '@ayuandrade';
  const instagramUrl = contato.instagramUrl || 'https://www.instagram.com/ayuandrade/';

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'enviando') return;

    const key = import.meta.env.VITE_WEB3FORMS_KEY;

    if (!key) {
      setErroDetalhe('Chave de acesso não configurada (VITE_WEB3FORMS_KEY).');
      setStatus('erro');
      return;
    }

    setStatus('enviando');
    setErroDetalhe('');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          name: form.nome,
          email: form.email,
          obra: form.obra,
          mensagem: form.mensagem,
          subject: `Novo contato pelo site — ${form.nome}`,
          from_name: form.nome,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('sucesso');
        setForm(FORM_VAZIO);
      } else {
        const msg = data.body?.message || data.message || `HTTP ${res.status}`;
        setErroDetalhe(msg);
        setStatus('erro');
      }
    } catch (error) {
      setErroDetalhe(String(error));
      setStatus('erro');
    }
  }

  return (
    <div
      style={{
        paddingTop: '64px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.28s ease-out',
      }}
    >
      <section style={{ padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,72px)' }}>
        <div style={{ ...kickerStyle, marginBottom: '12px' }}>
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

        {/* Grid duas colunas no desktop, uma no mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(48px, 6vw, 96px)',
            alignItems: 'start',
          }}
        >
          {/* Coluna esquerda — formulário */}
          <div>
            {status === 'sucesso' ? (
              <div role="alert">
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                    marginBottom: '8px',
                  }}
                >
                  {t('contato.enviada')}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: '0.72rem',
                    color: 'var(--mid)',
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
                {/* honeypot anti-spam */}
                <input
                  type="checkbox"
                  name="botcheck"
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label htmlFor="nome" style={labelStyle}>
                    {t('contato.labelNome')}
                  </label>
                  <input
                    id="nome"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.nome}
                    onChange={set('nome')}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="emailVisitante" style={labelStyle}>
                    {t('contato.labelEmail')}
                  </label>
                  <input
                    id="emailVisitante"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="obra" style={labelStyle}>
                    {t('contato.labelObra')}
                  </label>
                  <input
                    id="obra"
                    type="text"
                    value={form.obra}
                    onChange={set('obra')}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="mensagem" style={labelStyle}>
                    {t('contato.labelMensagem')}
                  </label>
                  <textarea
                    id="mensagem"
                    required
                    rows={5}
                    value={form.mensagem}
                    onChange={set('mensagem')}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                {status === 'erro' && (
                  <div
                    role="alert"
                    style={{
                      fontFamily: 'var(--sans)',
                      fontSize: '0.72rem',
                      color: '#8a3030',
                    }}
                  >
                    <div>{t('contato.erroEnvio')}</div>
                    {erroDetalhe && (
                      <div style={{ marginTop: '4px', opacity: 0.75 }}>{erroDetalhe}</div>
                    )}
                  </div>
                )}

                <BtnBlack
                  type="submit"
                  label={status === 'enviando' ? t('contato.enviando') : t('contato.enviar')}
                  style={status === 'enviando' ? { opacity: 0.6, pointerEvents: 'none' } : {}}
                />
              </form>
            )}
          </div>

          {/* Coluna direita — informações de contato */}
          <div>
            <div style={{ marginBottom: '40px' }}>
              <div style={kickerStyle}>{t('contato.labelWhatsApp')}</div>
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
              <div style={kickerStyle}>{t('contato.labelEmailContato')}</div>
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

            <div style={{ marginBottom: '40px' }}>
              <div style={kickerStyle}>{t('contato.labelInstagram')}</div>
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
                paddingTop: '32px',
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
