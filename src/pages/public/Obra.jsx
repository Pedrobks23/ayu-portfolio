import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import Imagem from '@/components/public/Imagem';
import ObraCard from '@/components/public/ObraCard';
import Footer from '@/components/public/Footer';
import { BtnBlack } from '@/components/public/ui';
import { useT } from '@/i18n/useT';
import { useLang } from '@/context/LanguageContext';
import { getLocalized, traduzirDisponibilidade } from '@/i18n/getLocalized';

function dispColor(disponibilidade) {
  if (disponibilidade === 'Disponível') return '#3a6b3a';
  if (disponibilidade === 'Indisponível') return '#8a3030';
  return 'var(--mid)';
}

function ModalContato({ obra, contato, onClose, t }) {
  const titulo = encodeURIComponent(obra.titulo);
  const whatsappUrl = `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(
    `Olá! Tenho interesse na obra "${obra.titulo}". Está disponível?`
  )}`;
  const emailUrl = `mailto:${contato.email}?subject=${encodeURIComponent(
    `Interesse na obra "${obra.titulo}"`
  )}&body=${encodeURIComponent(
    `Olá Ayume,\n\nTenho interesse na obra "${obra.titulo}" e gostaria de saber mais informações sobre disponibilidade e valores.\n\nObrigado(a).`
  )}`;

  return (
    <div
      onClick={onClose}
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
          padding: 'clamp(32px,5vw,56px)',
          maxWidth: '420px',
          width: '100%',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
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

        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            marginBottom: '12px',
          }}
        >
          {t('obra.modalKicker')}
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '1.3rem',
            fontStyle: 'italic',
            fontWeight: 300,
            marginBottom: '32px',
            lineHeight: 1.3,
          }}
        >
          {obra.titulo}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'var(--text)',
              color: 'var(--bg)',
              padding: '16px 24px',
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {t('obra.whatsapp')}
          </a>
          <a
            href={emailUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: '1px solid rgba(26,26,26,0.3)',
              color: 'var(--text)',
              padding: '16px 24px',
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {t('obra.email')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Obra() {
  const { slug } = useParams();
  const { obras, loading, getObra } = useObras();
  const { config } = useConfiguracoes();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [visible, setVisible] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const { t } = useT();
  const { lang } = useLang();

  const obra = getObra(slug) ?? (!loading ? obras[0] : null);

  useEffect(() => {
    setActiveImg(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const tId = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(tId);
  }, []);

  if (loading) return null;
  if (!obra) return null;

  const imagens = obra.imagens || [];
  const outras = obras.filter(o => o.slug !== slug && o.visivel !== false).slice(0, 3);
  const contato = config?.contato || {};

  const titulo = getLocalized(obra, 'titulo', lang) || obra.titulo;
  const tecnica = getLocalized(obra, 'tecnica', lang) || obra.tecnica;
  const colecaoVal = getLocalized(obra, 'colecao', lang) || obra.colecao;
  const descricao = getLocalized(obra, 'descricao', lang) || obra.descricao;

  const metaRows = [
    { label: t('obra.colecao'), value: colecaoVal, serif: true },
    { label: t('obra.ano'), value: obra.ano },
    { label: t('obra.tecnica'), value: tecnica },
    { label: t('obra.dimensoes'), value: obra.dimensoes },
    {
      label: t('obra.disponibilidade'),
      value: traduzirDisponibilidade(obra.disponibilidade, t),
      color: dispColor(obra.disponibilidade),
    },
  ].filter(row => row.value);

  return (
    <div
      style={{
        paddingTop: '64px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.28s ease-out',
      }}
    >
      {modalAberto && (
        <ModalContato obra={obra} contato={contato} onClose={() => setModalAberto(false)} t={t} />
      )}

      {/* Breadcrumb */}
      <div style={{ padding: '24px clamp(24px,5vw,72px) 0' }}>
        <button
          onClick={() => navigate('/catalogo')}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {t('obra.voltar')}
        </button>
      </div>

      {/* Layout 50/50 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(32px,4vw,80px)',
          padding: 'clamp(32px,4vw,64px) clamp(24px,5vw,72px)',
          alignItems: 'start',
        }}
      >
        {/* Galeria */}
        <div>
          <div
            style={{
              background: '#0D0D0D',
              aspectRatio: imagens[activeImg]?.width && imagens[activeImg]?.height
                ? `${imagens[activeImg].width}/${imagens[activeImg].height}`
                : '4/3',
              overflow: 'hidden',
            }}
          >
            {imagens[activeImg] ? (
              <img
                key={activeImg}
                src={imagens[activeImg].url}
                alt={titulo}
                loading={activeImg === 0 ? 'eager' : 'lazy'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase',
                }}
              >
                sem imagem
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {imagens.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {imagens.map((img, i) => (
                <button
                  key={img.publicId}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Ver imagem ${i + 1}`}
                  style={{
                    flex: 1,
                    aspectRatio: '1/1',
                    overflow: 'hidden',
                    background: '#0D0D0D',
                    border: i === activeImg
                      ? '2px solid var(--text)'
                      : '2px solid transparent',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Imagem
                    publicId={img.publicId}
                    crop={img.crop}
                    alt=""
                    size="thumb"
                    style={{ filter: 'grayscale(15%) brightness(0.8)' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div style={{ paddingTop: '8px' }}>
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--mid)',
              marginBottom: '14px',
            }}
          >
            {obra.tipo}
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.15,
              marginBottom: '40px',
            }}
          >
            {titulo}
          </h1>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: descricao ? '24px' : '40px',
            }}
          >
            <tbody>
              {metaRows.map(({ label, value, serif, color }) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(26,26,26,0.1)' }}>
                  <td
                    style={{
                      padding: '16px 0',
                      fontFamily: 'var(--sans)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--mid)',
                      width: '42%',
                      verticalAlign: 'top',
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: '16px 0',
                      fontFamily: serif ? 'var(--serif)' : 'var(--sans)',
                      fontSize: serif ? '1rem' : '0.85rem',
                      textAlign: 'right',
                      color: color || 'var(--text)',
                      fontStyle: serif ? 'italic' : 'normal',
                    }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {descricao && (
            <div
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.82rem',
                lineHeight: 1.85,
                color: 'var(--mid)',
                marginBottom: '40px',
              }}
            >
              {descricao}
            </div>
          )}

          <BtnBlack
            label={t('obra.consultar')}
            onClick={() => setModalAberto(true)}
          />
        </div>
      </div>

      {/* Outras obras */}
      {outras.length > 0 && (
        <section
          style={{
            padding: '40px clamp(24px,5vw,72px) clamp(64px,8vw,100px)',
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
            {t('obra.outrasKicker')}
          </div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.5rem,3vw,2.2rem)',
              fontWeight: 300,
              marginBottom: '36px',
            }}
          >
            {t('obra.outrasTitulo')}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '28px',
            }}
          >
            {outras.map(o => (
              <ObraCard key={o.slug} obra={o} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
