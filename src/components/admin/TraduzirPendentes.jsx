import { useState, useEffect } from 'react';
import { collection, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useObras } from '@/context/ObrasContext';
import { useColecoes } from '@/hooks/useColecoes';
import { traduzirPtEn, CotaEsgotadaError } from '@/lib/traducao';

// O que é traduzido automaticamente em cada coleção do Firestore.
// Nomes de obras/coleções e nomes de lugares ficam de fora de propósito.
const CAMPOS = {
  obras: ['tecnica', 'descricao'],
  colecoes: ['descricao'],
  participacoes: ['data'],
};

const vazio = v => !(v ?? '').toString().trim();

function pendentesDe(colecao, docs, idDe) {
  const lista = [];
  for (const d of docs) {
    for (const campo of CAMPOS[colecao]) {
      if (!vazio(d[campo]) && vazio(d[`${campo}En`])) {
        lista.push({ colecao, id: idDe(d), campo, texto: d[campo], nome: d.titulo || d.nome || '' });
      }
    }
  }
  return lista;
}

/**
 * Traduz de uma vez tudo o que tem português e ainda não tem inglês.
 * config: documento configuracoes/site (para a bio)
 * onBioTraduzida(en): atualiza o formulário de Configurações aberto
 */
export default function TraduzirPendentes({ config, onBioTraduzida }) {
  const { obras } = useObras();
  const { colecoes } = useColecoes();
  const [participacoes, setParticipacoes] = useState([]);
  const [progresso, setProgresso] = useState(null); // { feitos, total }
  const [mensagem, setMensagem] = useState('');
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    getDocs(collection(db, 'participacoes'))
      .then(snap => setParticipacoes(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, [recarregar]);

  const pendentes = [
    ...(!vazio(config?.bio) && vazio(config?.bioEn)
      ? [{ colecao: 'configuracoes', id: 'site', campo: 'bio', texto: config.bio, nome: 'Bio' }]
      : []),
    ...pendentesDe('obras', obras, o => o.slug),
    ...pendentesDe('colecoes', colecoes, c => c.id),
    ...pendentesDe('participacoes', participacoes, p => p.id),
  ];

  async function traduzirTudo() {
    const fila = [...pendentes];
    setMensagem('');
    setProgresso({ feitos: 0, total: fila.length });
    let feitos = 0;
    let falhas = 0;
    for (const item of fila) {
      try {
        const en = await traduzirPtEn(item.texto, { email: config?.contato?.email });
        await updateDoc(doc(db, item.colecao, item.id), {
          [`${item.campo}En`]: en,
          atualizadoEm: serverTimestamp(),
        });
        if (item.colecao === 'configuracoes') onBioTraduzida?.(en);
        feitos++;
      } catch (e) {
        falhas++;
        if (e instanceof CotaEsgotadaError) {
          setMensagem(`Limite diário de tradução gratuita atingido depois de ${feitos} textos. Clique de novo amanhã para terminar.`);
          break;
        }
      }
      setProgresso({ feitos: feitos + falhas, total: fila.length });
    }
    setProgresso(null);
    setRecarregar(n => n + 1);
    setMensagem(m => m || (falhas
      ? `${feitos} textos traduzidos, ${falhas} falharam. Pode clicar de novo para tentar os que faltaram.`
      : `${feitos} textos traduzidos. Confira o site em inglês e ajuste o que quiser em cada item.`));
  }

  const ocupado = progresso !== null;

  return (
    <section style={{ padding: '20px', border: '1px solid rgba(197,192,186,0.6)', background: 'rgba(197,192,186,0.08)' }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '10px' }}>
        Site em inglês
      </div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '14px' }}>
        {pendentes.length === 0
          ? 'Tudo que tem texto em português já tem versão em inglês.'
          : `${pendentes.length} ${pendentes.length === 1 ? 'texto ainda não tem' : 'textos ainda não têm'} versão em inglês (bio, descrições de obras e coleções, técnica, datas). Sem tradução, o site em inglês mostra o português.`}
      </div>
      {pendentes.length > 0 && (
        <button
          type="button"
          onClick={traduzirTudo}
          disabled={ocupado}
          style={{ fontFamily: 'var(--sans)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '12px 22px', cursor: ocupado ? 'not-allowed' : 'pointer', opacity: ocupado ? 0.6 : 1 }}
        >
          {ocupado ? `Traduzindo ${progresso.feitos} de ${progresso.total}...` : 'Traduzir tudo automaticamente'}
        </button>
      )}
      {mensagem && (
        <div role="status" style={{ fontFamily: 'var(--sans)', fontSize: '0.7rem', color: 'var(--mid)', marginTop: '12px', lineHeight: 1.6 }}>
          {mensagem}
        </div>
      )}
    </section>
  );
}
