import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import AdminLayout from '@/components/admin/AdminLayout';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { uploadImagem, urlOtimizada } from '@/lib/cloudinary';

function isHeic(file) {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

export default function Configuracoes() {
  const { config, loading, salvarConfig } = useConfiguracoes();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [uploadandoHero, setUploadandoHero] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    if (config && !form) {
      setForm({
        bio: config.bio || '',
        bioEn: config.bioEn || '',
        portfolioVisualUrl: config.portfolioVisualUrl || '',
        contato: {
          email: config.contato?.email || '',
          instagram: config.contato?.instagram || '',
          instagramUrl: config.contato?.instagramUrl || '',
          whatsapp: config.contato?.whatsapp || '',
        },
        heroImagem: config.heroImagem || null,
      });
    }
  }, [config]);

  if (loading || !form) {
    return (
      <AdminLayout>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--mid)', letterSpacing: '0.1em' }}>
          Carregando...
        </div>
      </AdminLayout>
    );
  }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }
  function setContato(key, value) {
    setForm(prev => ({ ...prev, contato: { ...prev.contato, [key]: value } }));
  }

  async function handleHeroUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadandoHero(true);
    try {
      const arquivo = isHeic(file)
        ? file
        : await imageCompression(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 2400,
            useWebWorker: true,
          });
      const { publicId, url } = await uploadImagem(arquivo);
      setField('heroImagem', { publicId, url });
    } catch {
      alert('Erro ao fazer upload da imagem hero.');
    } finally {
      setUploadandoHero(false);
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);
    try {
      await salvarConfig(form);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch {
      alert('Erro ao salvar configurações.');
    } finally {
      setSalvando(false);
    }
  }

  const inputStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid rgba(26,26,26,0.2)',
    background: 'transparent',
    padding: '10px 0',
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
    marginBottom: '8px',
  };
  const sectionTitle = {
    fontFamily: 'var(--sans)',
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--text)',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(26,26,26,0.1)',
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '720px' }}>
        <button
          onClick={() => navigate('/painel-ayume/dashboard')}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
          }}
        >
          ← Voltar para obras
        </button>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            marginBottom: '8px',
          }}
        >
          Configurações do site
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(1.8rem,3vw,2.6rem)',
            fontWeight: 300,
            marginBottom: '48px',
          }}
        >
          Configurações
        </div>

        <form onSubmit={handleSalvar}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Hero */}
            <section>
              <div style={sectionTitle}>Imagem hero (Home)</div>

              {form.heroImagem?.url && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    aspectRatio: '16/9',
                    overflow: 'hidden',
                    background: '#0D0D0D',
                    marginBottom: '16px',
                  }}
                >
                  <img
                    src={urlOtimizada(form.heroImagem.publicId, 'card')}
                    alt="Hero atual"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => heroRef.current?.click()}
                disabled={uploadandoHero}
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  background: 'none',
                  border: '1px solid rgba(26,26,26,0.3)',
                  padding: '10px 20px',
                  cursor: uploadandoHero ? 'not-allowed' : 'pointer',
                  color: 'var(--text)',
                  opacity: uploadandoHero ? 0.5 : 1,
                }}
              >
                {uploadandoHero ? 'Fazendo upload...' : form.heroImagem ? 'Trocar imagem hero' : 'Adicionar imagem hero'}
              </button>
              {form.heroImagem && !uploadandoHero && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remover a imagem hero? A home fica com fundo escuro, sem imagem.')) {
                      setField('heroImagem', null);
                    }
                  }}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    background: 'none',
                    border: 'none',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    color: '#8a3030',
                  }}
                >
                  Remover imagem
                </button>
              )}
              {(form.heroImagem?.publicId ?? null) !== (config.heroImagem?.publicId ?? null) && (
                <div style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', color: 'var(--mid)', marginTop: '10px' }}>
                  Alteração pendente — clique em “Salvar” no fim da página para aplicar no site.
                </div>
              )}
              <input
                ref={heroRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                style={{ display: 'none' }}
                onChange={handleHeroUpload}
              />
            </section>

            {/* Bio */}
            <section>
              <div style={sectionTitle}>Bio</div>
              <label style={labelStyle} htmlFor="bio">Texto da página Sobre</label>
              <textarea
                id="bio"
                rows={6}
                value={form.bio}
                onChange={e => setField('bio', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Texto sobre a artista..."
              />

              {/* Bio EN */}
              <details style={{ marginTop: '24px', border: '1px solid rgba(197,192,186,0.5)', background: 'rgba(197,192,186,0.06)' }}>
                <summary style={{ padding: '12px 16px', fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mid)', cursor: 'pointer', userSelect: 'none' }}>
                  Tradução para inglês (opcional)
                </summary>
                <div style={{ padding: '0 16px 20px' }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: 'var(--mid)', lineHeight: 1.6, marginBottom: '16px', marginTop: '12px' }}>
                    Deixe em branco pra usar o texto em português. Recomendado preencher pelo menos bio e descrições.
                  </div>
                  <label style={labelStyle} htmlFor="bioEn">Bio (EN)</label>
                  <textarea
                    id="bioEn"
                    rows={6}
                    value={form.bioEn}
                    onChange={e => setField('bioEn', e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Text about the artist..."
                  />
                </div>
              </details>
            </section>

            {/* URL portfólio */}
            <div>
              <label style={labelStyle} htmlFor="portfolioUrl">URL do portfólio visual (Canva)</label>
              <input
                id="portfolioUrl"
                type="url"
                value={form.portfolioVisualUrl}
                onChange={e => setField('portfolioVisualUrl', e.target.value)}
                style={inputStyle}
                placeholder="https://canva.link/..."
              />
            </div>

            {/* Contato */}
            <section>
              <div style={sectionTitle}>Contato</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={labelStyle} htmlFor="email">E-mail</label>
                  <input id="email" type="email"
                    value={form.contato.email}
                    onChange={e => setContato('email', e.target.value)}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="instagram">Instagram (ex: @ayuandrade)</label>
                  <input id="instagram" type="text"
                    value={form.contato.instagram}
                    onChange={e => setContato('instagram', e.target.value)}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="instagramUrl">URL do Instagram</label>
                  <input id="instagramUrl" type="url"
                    value={form.contato.instagramUrl}
                    onChange={e => setContato('instagramUrl', e.target.value)}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="whatsapp">WhatsApp (somente números, ex: 5585999999999)</label>
                  <input id="whatsapp" type="text"
                    value={form.contato.whatsapp}
                    onChange={e => setContato('whatsapp', e.target.value)}
                    style={inputStyle} />
                </div>
              </div>
            </section>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(26,26,26,0.1)',
            }}
          >
            <button
              type="submit"
              disabled={salvando}
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.62rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                background: 'var(--text)',
                color: 'var(--bg)',
                border: 'none',
                padding: '16px 36px',
                cursor: salvando ? 'not-allowed' : 'pointer',
                opacity: salvando ? 0.5 : 1,
              }}
            >
              {salvando ? 'Salvando...' : 'Salvar configurações'}
            </button>
            {sucesso && (
              <span style={{ fontFamily: 'var(--sans)', fontSize: '0.7rem', color: '#3a6b3a', letterSpacing: '0.05em' }}>
                Salvo com sucesso.
              </span>
            )}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
