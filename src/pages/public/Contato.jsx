import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import Footer from '@/components/public/Footer';
import { BtnBlack } from '@/components/public/ui';

export default function Contato() {
  const [searchParams] = useSearchParams();
  const { getObra } = useObras();
  const [visible, setVisible] = useState(false);

  const obraSlug = searchParams.get('obra');
  const obraPreset = obraSlug ? getObra(obraSlug) : null;
  const obraPresetTitulo = obraPreset ? obraPreset.titulo : '';

  const [form, setForm] = useState({
    nome: '',
    email: '',
    obra: obraPresetTitulo,
    mensagem: '',
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (obraPresetTitulo) {
      setForm(f => ({ ...f, obra: obraPresetTitulo }));
    }
  }, [obraPresetTitulo]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

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
              Fale conosco
            </div>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2.2rem,4vw,3.4rem)',
                fontWeight: 300,
                marginBottom: '40px',
              }}
            >
              Contato
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
                  Mensagem enviada
                </div>
                <div
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: '0.75rem',
                    color: 'var(--mid)',
                    letterSpacing: '0.05em',
                  }}
                >
                  Retornaremos em breve.
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                <div>
                  <label style={labelStyle} htmlFor="nome">Nome</label>
                  <input
                    id="nome"
                    type="text"
                    required
                    value={form.nome}
                    onChange={e => set('nome', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="obra">
                    Obra de interesse (opcional)
                  </label>
                  <input
                    id="obra"
                    type="text"
                    value={form.obra}
                    onChange={e => set('obra', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="mensagem">Mensagem</label>
                  <textarea
                    id="mensagem"
                    rows={5}
                    value={form.mensagem}
                    onChange={e => set('mensagem', e.target.value)}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>
                <BtnBlack
                  label="Enviar mensagem →"
                  type="submit"
                  style={{ marginTop: '8px' }}
                />
              </form>
            )}
          </div>

          {/* Informações de contato */}
          <div style={{ paddingTop: '8px' }}>
            <div style={{ marginBottom: '48px' }}>
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
                E-mail
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                }}
              >
                contato@ayumeandrade.com.br
              </div>
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
                Instagram
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                }}
              >
                @ayumeandrade
              </div>
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
              Respondemos a todas as consultas em até 3 dias úteis. Para questões
              sobre disponibilidade de obras, informe o título da obra no campo
              correspondente.
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
