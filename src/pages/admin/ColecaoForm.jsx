import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  collection, addDoc, doc, getDoc, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { useObras } from '@/context/ObrasContext';
import { useColecoes } from '@/hooks/useColecoes';
import { chaveColecao } from '@/lib/colecoes';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import TraducaoIngles from '@/components/admin/TraducaoIngles';
import { completarTraducoes } from '@/lib/traducao';

const CAMPOS_TRADUZIVEIS = [{ campo: 'descricao', label: 'Descrição', multiline: true, rows: 7 }];

const estadoVazio = {
  nome: '',
  descricao: '',
  ordem: 0,
  visivel: true,
  nomeEn: '',
  descricaoEn: '',
};

export default function ColecaoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const editando = Boolean(id);
  const { obras } = useObras();
  const { colecoes } = useColecoes();
  const { config } = useConfiguracoes();
  const editadosEn = useRef(new Set()).current;
  const [original, setOriginal] = useState({});

  const [form, setForm] = useState(() => ({
    ...estadoVazio,
    nome: searchParams.get('nome') || '',
  }));
  const [nomeOriginal, setNomeOriginal] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!editando) return;
    getDoc(doc(db, 'colecoes', id)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setForm({
          nome: d.nome || '',
          descricao: d.descricao || '',
          ordem: d.ordem ?? 0,
          visivel: d.visivel !== false,
          nomeEn: d.nomeEn || '',
          descricaoEn: d.descricaoEn || '',
        });
        setNomeOriginal(d.nome || '');
        setOriginal(d);
      }
      setCarregando(false);
    });
  }, [id]);

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Obras que pertencem a esta coleção (pelo nome original, ao editar)
  const chaveAtual = chaveColecao(editando ? nomeOriginal : form.nome);
  const obrasDaColecao = chaveAtual ? obras.filter(o => chaveColecao(o.colecao) === chaveAtual) : [];

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    const nome = form.nome.trim();
    if (!nome) {
      setErro('O nome é obrigatório.');
      return;
    }
    const duplicada = colecoes.find(c => c.id !== id && chaveColecao(c.nome) === chaveColecao(nome));
    if (duplicada) {
      setErro(`Já existe a coleção "${duplicada.nome}".`);
      return;
    }

    setSalvando(true);
    try {
      const { valores: traducoes } = await completarTraducoes({
        form, original, editadosEn,
        campos: ['descricao'],
        email: config?.contato?.email,
      });
      const dados = {
        nome,
        descricao: form.descricao.trim(),
        ordem: Number(form.ordem) || 0,
        visivel: form.visivel,
        nomeEn: form.nomeEn.trim(),
        descricaoEn: (traducoes.descricaoEn ?? form.descricaoEn).trim(),
        atualizadoEm: serverTimestamp(),
      };

      const batch = writeBatch(db);
      if (editando) {
        batch.update(doc(db, 'colecoes', id), dados);
      } else {
        batch.set(doc(collection(db, 'colecoes')), { ...dados, criadoEm: serverTimestamp() });
      }

      // Mantém as obras ligadas à coleção com o nome (e nome EN) atualizados
      for (const o of obrasDaColecao) {
        if (o.colecao !== nome || (o.colecaoEn || '') !== dados.nomeEn) {
          batch.update(doc(db, 'obras', o.slug), {
            colecao: nome,
            colecaoEn: dados.nomeEn,
            atualizadoEm: serverTimestamp(),
          });
        }
      }

      await batch.commit();
      navigate('/painel-ayume/colecoes');
    } catch {
      setErro('Erro ao salvar. Verifique sua conexão e tente novamente.');
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
  const ajudaStyle = {
    fontFamily: 'var(--sans)',
    fontSize: '0.65rem',
    color: 'var(--mid)',
    marginTop: '8px',
    lineHeight: 1.6,
  };

  if (carregando) {
    return (
      <AdminLayout>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--mid)', letterSpacing: '0.1em' }}>
          Carregando...
        </div>
      </AdminLayout>
    );
  }

  const renomeando = editando && nomeOriginal && chaveColecao(form.nome) !== chaveColecao(nomeOriginal);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '680px' }}>
        <button
          onClick={() => navigate('/painel-ayume/colecoes')}
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
            padding: 0,
          }}
        >
          ← Voltar para coleções
        </button>

        <div style={{ fontFamily: 'var(--sans)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '8px' }}>
          Gestão de conteúdo
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, marginBottom: '40px' }}>
          {editando ? 'Editar coleção' : 'Nova coleção'}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <label style={labelStyle} htmlFor="nome">Nome *</label>
              <input id="nome" type="text" required value={form.nome}
                onChange={e => set('nome', e.target.value)}
                style={inputStyle} placeholder="8.092 dias" />
              <div style={ajudaStyle}>
                {obrasDaColecao.length === 1
                  ? '1 obra nesta coleção.'
                  : `${obrasDaColecao.length} obras nesta coleção.`}
                {renomeando && obrasDaColecao.length > 0 && ' Ao salvar, elas passam a usar o novo nome.'}
                {' '}Para incluir uma obra, escolha a coleção no cadastro da obra.
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="descricao">Descrição</label>
              <textarea id="descricao" rows={7} value={form.descricao}
                onChange={e => set('descricao', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="Texto que aparece no catálogo, acima das obras da coleção." />
              <div style={ajudaStyle}>Deixe uma linha em branco para separar parágrafos.</div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="ordem">Ordem</label>
              <input id="ordem" type="number" min="0" value={form.ordem}
                onChange={e => set('ordem', e.target.value)}
                style={inputStyle} />
              <div style={ajudaStyle}>Menor número aparece primeiro. A primeira coleção é a que abre no catálogo.</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input id="visivel" type="checkbox"
                checked={form.visivel}
                onChange={e => set('visivel', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="visivel" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                Visível no site
              </label>
            </div>
          </div>

          <TraducaoIngles
            campos={CAMPOS_TRADUZIVEIS}
            form={form}
            onChange={set}
            editadosEn={editadosEn}
            email={config?.contato?.email}
          />

          {erro && (
            <div role="alert" style={{ marginTop: '24px', padding: '14px 20px', background: 'rgba(138,48,48,0.08)', borderLeft: '3px solid #8a3030', fontFamily: 'var(--sans)', fontSize: '0.75rem', color: '#8a3030' }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(26,26,26,0.1)', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={salvando}
              style={{ fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '16px 36px', cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.5 : 1 }}
            >
              {salvando ? 'Salvando e traduzindo...' : editando ? 'Salvar alterações' : 'Criar coleção'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/painel-ayume/colecoes')}
              style={{ fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'transparent', color: 'var(--text)', border: '1px solid rgba(26,26,26,0.3)', padding: '16px 36px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
