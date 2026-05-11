import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection, addDoc, doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/AdminLayout';

const estadoVazio = {
  titulo: '',
  local: '',
  data: '',
  dataInicioStr: '',
  dataFimStr: '',
  visivel: true,
  ordem: 0,
  tituloEn: '',
  localEn: '',
  dataEn: '',
};

function strToTimestamp(str) {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
}

function timestampToStr(ts) {
  if (!ts) return '';
  const d = ts.toDate?.();
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

export default function ParticipacaoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [form, setForm] = useState(estadoVazio);
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!editando) return;
    getDoc(doc(db, 'participacoes', id)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setForm({
          titulo: d.titulo || '',
          local: d.local || '',
          data: d.data || '',
          dataInicioStr: timestampToStr(d.dataInicio),
          dataFimStr: timestampToStr(d.dataFim),
          visivel: d.visivel !== false,
          ordem: d.ordem ?? 0,
          tituloEn: d.tituloEn || '',
          localEn: d.localEn || '',
          dataEn: d.dataEn || '',
        });
      }
      setCarregando(false);
    });
  }, [id]);

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    if (!form.titulo.trim()) {
      setErro('O título é obrigatório.');
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        titulo: form.titulo.trim(),
        local: form.local.trim(),
        data: form.data.trim(),
        dataInicio: strToTimestamp(form.dataInicioStr),
        dataFim: strToTimestamp(form.dataFimStr),
        visivel: form.visivel,
        ordem: Number(form.ordem) || 0,
        tituloEn: form.tituloEn.trim(),
        localEn: form.localEn.trim(),
        dataEn: form.dataEn.trim(),
        atualizadoEm: serverTimestamp(),
      };
      if (editando) {
        await updateDoc(doc(db, 'participacoes', id), dados);
      } else {
        await addDoc(collection(db, 'participacoes'), {
          ...dados,
          criadoEm: serverTimestamp(),
        });
      }
      navigate('/painel-ayume/participacoes');
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

  if (carregando) {
    return (
      <AdminLayout>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--mid)', letterSpacing: '0.1em' }}>
          Carregando...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '680px' }}>
        <button
          onClick={() => navigate('/painel-ayume/participacoes')}
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
          ← Voltar para participações
        </button>

        <div style={{ fontFamily: 'var(--sans)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '8px' }}>
          Gestão de conteúdo
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, marginBottom: '40px' }}>
          {editando ? 'Editar participação' : 'Nova participação'}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <label style={labelStyle} htmlFor="titulo">Título *</label>
              <input id="titulo" type="text" required value={form.titulo}
                onChange={e => set('titulo', e.target.value)}
                style={inputStyle} placeholder="FARGO" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="local">Local *</label>
              <input id="local" type="text" required value={form.local}
                onChange={e => set('local', e.target.value)}
                style={inputStyle} placeholder="Centro Cultural Oscar Niemeyer — GO" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="data">Data (texto livre)</label>
              <input id="data" type="text" value={form.data}
                onChange={e => set('data', e.target.value)}
                style={inputStyle} placeholder="16 e 17 de maio" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle} htmlFor="dataInicio">Data início (opcional)</label>
                <input id="dataInicio" type="date" value={form.dataInicioStr}
                  onChange={e => set('dataInicioStr', e.target.value)}
                  style={{ ...inputStyle, fontFamily: 'var(--sans)', fontSize: '0.9rem' }} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="dataFim">Data fim (opcional)</label>
                <input id="dataFim" type="date" value={form.dataFimStr}
                  onChange={e => set('dataFimStr', e.target.value)}
                  style={{ ...inputStyle, fontFamily: 'var(--sans)', fontSize: '0.9rem' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="ordem">Ordem</label>
              <input id="ordem" type="number" min="0" value={form.ordem}
                onChange={e => set('ordem', e.target.value)}
                style={inputStyle} />
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

          {/* Tradução EN */}
          <details style={{ marginTop: '32px', border: '1px solid rgba(197,192,186,0.5)', background: 'rgba(197,192,186,0.06)' }}>
            <summary style={{ padding: '14px 18px', fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mid)', cursor: 'pointer', userSelect: 'none' }}>
              Tradução para inglês (opcional)
            </summary>
            <div style={{ padding: '0 18px 22px' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: 'var(--mid)', lineHeight: 1.6, marginBottom: '20px', marginTop: '12px' }}>
                Deixe em branco pra usar o texto em português. Recomendado preencher pelo menos bio e descrições.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle} htmlFor="tituloEn">Título (EN)</label>
                  <input id="tituloEn" type="text" value={form.tituloEn}
                    onChange={e => set('tituloEn', e.target.value)}
                    style={inputStyle} placeholder="FARGO" />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="localEn">Local (EN)</label>
                  <input id="localEn" type="text" value={form.localEn}
                    onChange={e => set('localEn', e.target.value)}
                    style={inputStyle} placeholder="Oscar Niemeyer Cultural Center — GO" />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="dataEn">Data (EN)</label>
                  <input id="dataEn" type="text" value={form.dataEn}
                    onChange={e => set('dataEn', e.target.value)}
                    style={inputStyle} placeholder="May 16–17" />
                </div>
              </div>
            </div>
          </details>

          {erro && (
            <div role="alert" style={{ marginTop: '24px', padding: '14px 20px', background: 'rgba(138,48,48,0.08)', borderLeft: '3px solid #8a3030', fontFamily: 'var(--sans)', fontSize: '0.75rem', color: '#8a3030' }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(26,26,26,0.1)' }}>
            <button
              type="submit"
              disabled={salvando}
              style={{ fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '16px 36px', cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.5 : 1 }}
            >
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar participação'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/painel-ayume/participacoes')}
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
