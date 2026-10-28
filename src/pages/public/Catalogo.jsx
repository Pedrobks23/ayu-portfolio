import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import { useColecoes } from '@/hooks/useColecoes';
import ObraCard from '@/components/public/ObraCard';
import FiltroCatalogo from '@/components/public/FiltroCatalogo';
import Footer from '@/components/public/Footer';
import { useT } from '@/i18n/useT';
import { useTextoTraduzido } from '@/i18n/useTraducao';
import {
  chaveColecao,
  colecoesDoCatalogo,
  obraPertence,
  obrasSemColecao,
} from '@/lib/colecoes';

const OUTRAS = 'outras';

export default function Catalogo() {
  const { obras, loading: loadingObras } = useObras();
  const { colecoes, loading: loadingColecoes } = useColecoes();
  const [searchParams, setSearchParams] = useSearchParams();
  const [anyHovered, setAnyHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const { t } = useT();

  useEffect(() => {
    const tId = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(tId);
  }, []);

  const obrasVisiveis = obras
    .filter(o => o.visivel !== false)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const exibidas = colecoesDoCatalogo(colecoes, obrasVisiveis);
  const semColecao = obrasSemColecao(colecoes, obrasVisiveis);

  const opcoes = [
    ...exibidas.map(c => ({
      chave: chaveColecao(c.nome),
      label: c.nome, // nome da coleção não é traduzido
      colecao: c,
    })),
    ...(semColecao.length > 0
      ? [{ chave: OUTRAS, label: t('catalogo.outrasObras'), colecao: null }]
      : []),
  ];

  const pedida = searchParams.get('colecao');
  const selecionada = opcoes.find(o => o.chave === pedida) ?? opcoes[0] ?? null;

  function selecionar(chave) {
    setSearchParams(chave === opcoes[0]?.chave ? {} : { colecao: chave }, { replace: true });
  }

  const filtered = !selecionada
    ? []
    : selecionada.colecao
      ? obrasVisiveis.filter(o => obraPertence(o, selecionada.colecao))
      : semColecao;

  const descricaoTraduzida = useTextoTraduzido(selecionada?.colecao, 'descricao');
  const descricao = selecionada?.colecao
    ? descricaoTraduzida
    : '';

  const carregando = loadingObras || loadingColecoes;

  return (
    <div
      style={{
        paddingTop: '64px',
        background: anyHovered ? '#ffffff' : 'var(--bg)',
        transition: 'background 0.4s ease-out',
        minHeight: '100vh',
        opacity: visible ? 1 : 0,
        transitionProperty: 'background, opacity',
        transitionDuration: '0.4s, 0.28s',
        transitionTimingFunction: 'ease-out',
      }}
    >
      <section style={{ padding: 'clamp(48px,6vw,88px) clamp(24px,5vw,72px) 40px' }}>
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
          {t('catalogo.kicker')}
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2.4rem,5vw,4rem)',
            fontWeight: 300,
            marginBottom: '40px',
          }}
        >
          {t('catalogo.titulo')}
        </div>
        {opcoes.length > 1 && (
          <FiltroCatalogo
            opcoes={opcoes}
            selecionada={selecionada?.chave}
            onChange={selecionar}
          />
        )}
      </section>

      {/* Descrição da coleção */}
      {selecionada?.colecao && (
        <section
          key={selecionada.chave}
          style={{
            padding: '8px clamp(24px,5vw,72px) clamp(40px,5vw,64px)',
            animation: 'fadeIn 0.35s ease-out',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.6rem,2.6vw,2.2rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              marginBottom: descricao ? '18px' : 0,
            }}
          >
            {selecionada.label}
          </div>
          {descricao && (
            <div
              style={{
                maxWidth: '680px',
                fontFamily: 'var(--serif)',
                fontSize: '1.05rem',
                lineHeight: 1.75,
                color: 'var(--text)',
              }}
            >
              {descricao.split(/\n\s*\n/).map((par, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : '1em 0 0', whiteSpace: 'pre-line' }}>
                  {par.trim()}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      <section style={{ padding: '8px clamp(24px,5vw,72px) clamp(64px,8vw,120px)' }}>
        {carregando ? null : filtered.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '32px 24px',
            }}
          >
            {filtered.map(o => (
              <ObraCard
                key={o.slug}
                obra={o}
                onHoverChange={h => setAnyHovered(h)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
              fontFamily: 'var(--serif)',
              fontSize: '1.2rem',
              fontStyle: 'italic',
              color: 'var(--mid)',
            }}
          >
            {t('catalogo.semObras')}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
