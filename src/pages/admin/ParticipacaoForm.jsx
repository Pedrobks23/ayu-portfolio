import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, Timestamp, deleteField
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { isPassada } from '@/lib/participacoes';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import TraducaoIngles from '@/components/admin/TraducaoIngles';
import { completarTraducoes } from '@/lib/traducao';

// Título e local costumam ser nomes próprios (exposição, galeria): ficam manuais.
const CAMPOS_TRADUZIVEIS = [
  { campo: 'data', label: 'Data (texto)' },
  { campo: 'titulo', label: 'Título', auto: false },
  { campo: 'local', label: 'Local', auto: false },
];

const estadoVazio = {
  titulo: '',
  local: '',
  data: '',
  dataInicioStr: '',
  dataFimStr: '',
  visivel: true,
  situacao: 'auto',
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

// Campo `passada` no Firestore: true / false / ausente (automático pela data)
function situacaoDoDoc(d) {
  if (d.passada === true) return 'passada';
  if (d.passada === false) return 'proxima';
  return 'auto';
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
  const [original, setOriginal] = useState({});
  const { config } = useConfiguracoes();
  const editadosEn = useRef(new Set()).current;

  useEffect(() => {
    if (!editando) return;
    getDoc(doc(db, 'participacoes', id)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setOriginal(d);
        setForm({
          titulo: d.titulo || '',
          local: d.local || '',
          data: d.data || '',
          dataInicioStr: timestampToStr(d.dataInicio),
          dataFimStr: timestampToStr(d.dataFim),
          visivel: d.visivel !== false,
          situacao: situacaoDoDoc(d),
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
      const { valores: traducoes } = await completarTraducoes({
        form, original, editadosEn,
        campos: CAMPOS_TRADUZIVEIS.filter(c => c.auto !== false).map(c => c.campo),
        email: config?.contato?.email,
      });
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
        dataEn: (traducoes.dataEn ?? form.dataEn).trim(),
        atualizadoEm: serverTimestamp(),
      };
      const passada =
        form.situacao === 'passada' ? true : form.situacao === 'proxima' ? false : null;
      if (editando) {
        await updateDoc(doc(db, 'participacoes', id), {
          ...dados,
          passada: passada === null ? deleteField() : passada,
        });
      } else {
        await addDoc(collection(db, 'participacoes'), {
          ...dados,
          ...(passada === null ? {} : { passada }),
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
              <label style={labelStyle} htmlFor="situacao">Seção no site</label>
              <select id="situacao" value={form.situacao}
                onChange={e => set('situacao', e.target.value)}
                style={{ ...inputStyle, fontFamily: 'var(--sans)', fontSize: '0.9rem', cursor: 'pointer' }}>
                <option value="auto">Automática (vai para "Passadas" quando a data acabar)</option>
                <option value="proxima">Sempre em "Próximas"</option>
                <option value="passada">Mover para "Passadas"</option>
              </select>
              {form.situacao === 'auto' && (
                <div style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', color: 'var(--mid)', marginTop: '8px', lineHeight: 1.6 }}>
                  {!form.dataInicioStr && !form.dataFimStr
                    ? 'Sem data início/fim preenchida, ela fica em "Próximas" até você mover.'
                    : isPassada({
                        dataInicio: form.dataInicioStr ? new Date(form.dataInicioStr + 'T00:00:00') : null,
                        dataFim: form.dataFimStr ? new Date(form.dataFimStr + 'T00:00:00') : null,
                      })
                      ? 'Pelas datas, ela aparece hoje em "Passadas".'
                      : 'Pelas datas, ela aparece hoje em "Próximas".'}
                </div>
              )}
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

          <div style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(26,26,26,0.1)' }}>
            <button
              type="submit"
              disabled={salvando}
              style={{ fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '16px 36px', cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.5 : 1 }}
            >
              {salvando ? 'Salvando e traduzindo...' : editando ? 'Salvar alterações' : 'Criar participação'}
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
