import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useObras } from '@/context/ObrasContext';
import { slugify } from '@/lib/utils';

const DISPONIBILIDADES = ['Disponível', 'Sob consulta', 'Indisponível'];
const TIPOS = ['Escultura', 'Pintura'];

const estadoVazio = {
  titulo: '',
  tipo: 'Escultura',
  colecao: '',
  ano: new Date().getFullYear(),
  tecnica: '',
  dimensoes: '',
  disponibilidade: 'Disponível',
  descricao: '',
  imgSeeds: [100, 200, 300],
  destaque: false,
  ordem: 0,
};

export default function FormObra({ obraExistente }) {
  const navigate = useNavigate();
  const { criarObra, atualizarObra, obras } = useObras();
  const [form, setForm] = useState(obraExistente || estadoVazio);
  const [seedsInput, setSeedsInput] = useState(
    obraExistente ? obraExistente.imgSeeds.join(', ') : '100, 200, 300'
  );
  const [slugPreview, setSlugPreview] = useState(
    obraExistente ? obraExistente.slug : ''
  );
  const [erro, setErro] = useState('');

  const colecoes = [...new Set(obras.map(o => o.colecao).filter(Boolean))];
  const editando = Boolean(obraExistente);

  useEffect(() => {
    if (!editando) {
      setSlugPreview(slugify(form.titulo));
    }
  }, [form.titulo, editando]);

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function parseSeeds(raw) {
    return raw
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n))
      .slice(0, 3);
  }

  function handleSeedsChange(raw) {
    setSeedsInput(raw);
    const seeds = parseSeeds(raw);
    if (seeds.length > 0) set('imgSeeds', seeds);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    const seeds = parseSeeds(seedsInput);
    if (seeds.length === 0) {
      setErro('Informe ao menos um seed de imagem.');
      return;
    }

    const slug = editando ? obraExistente.slug : slugPreview;
    if (!slug) {
      setErro('O título não gerou um slug válido.');
      return;
    }

    const obra = { ...form, imgSeeds: seeds, slug };

    if (editando) {
      atualizarObra(obraExistente.slug, obra);
    } else {
      const existe = obras.find(o => o.slug === slug);
      if (existe) {
        setErro(`Já existe uma obra com o slug "${slug}". Altere o título.`);
        return;
      }
      criarObra(obra);
    }

    navigate('/painel-ayume/dashboard');
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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px 48px',
        }}
      >
        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Título */}
          <div>
            <label style={labelStyle} htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              required
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              style={inputStyle}
              placeholder="quando se corrói"
            />
            {!editando && slugPreview && (
              <div
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: '0.65rem',
                  color: 'var(--mid)',
                  marginTop: '6px',
                  letterSpacing: '0.05em',
                }}
              >
                slug: <em>{slugPreview}</em>
              </div>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label style={labelStyle} htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={e => set('tipo', e.target.value)}
              style={selectStyle}
            >
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Coleção */}
          <div>
            <label style={labelStyle} htmlFor="colecao">Coleção</label>
            <input
              id="colecao"
              type="text"
              list="colecoes-lista"
              value={form.colecao}
              onChange={e => set('colecao', e.target.value)}
              style={inputStyle}
              placeholder="8.092 dias em casa"
            />
            <datalist id="colecoes-lista">
              {colecoes.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Ano */}
          <div>
            <label style={labelStyle} htmlFor="ano">Ano</label>
            <input
              id="ano"
              type="number"
              required
              min="1900"
              max="2100"
              value={form.ano}
              onChange={e => set('ano', parseInt(e.target.value, 10))}
              style={inputStyle}
            />
          </div>

          {/* Técnica */}
          <div>
            <label style={labelStyle} htmlFor="tecnica">Técnica</label>
            <input
              id="tecnica"
              type="text"
              value={form.tecnica}
              onChange={e => set('tecnica', e.target.value)}
              style={inputStyle}
              placeholder="Cerâmica esmaltada"
            />
          </div>

          {/* Dimensões */}
          <div>
            <label style={labelStyle} htmlFor="dimensoes">Dimensões</label>
            <input
              id="dimensoes"
              type="text"
              value={form.dimensoes}
              onChange={e => set('dimensoes', e.target.value)}
              style={inputStyle}
              placeholder="22 × 20 × 18 cm · 3kg"
            />
          </div>
        </div>

        {/* Coluna direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Disponibilidade */}
          <div>
            <label style={labelStyle} htmlFor="disponibilidade">Disponibilidade</label>
            <select
              id="disponibilidade"
              value={form.disponibilidade}
              onChange={e => set('disponibilidade', e.target.value)}
              style={selectStyle}
            >
              {DISPONIBILIDADES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label style={labelStyle} htmlFor="descricao">Descrição (opcional)</label>
            <textarea
              id="descricao"
              rows={4}
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Texto livre sobre a obra..."
            />
          </div>

          {/* Image seeds */}
          <div>
            <label style={labelStyle} htmlFor="imgSeeds">
              Seeds de imagem (1–3 números separados por vírgula)
            </label>
            <input
              id="imgSeeds"
              type="text"
              value={seedsInput}
              onChange={e => handleSeedsChange(e.target.value)}
              style={inputStyle}
              placeholder="431, 892, 312"
            />
            {/* Preview das imagens */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {parseSeeds(seedsInput).map((seed, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    aspectRatio: '1/1',
                    overflow: 'hidden',
                    background: '#0D0D0D',
                  }}
                >
                  <img
                    src={`https://picsum.photos/seed/${seed}/200/200`}
                    alt={`Preview ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      filter: 'grayscale(15%) brightness(0.8)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Destaque */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              id="destaque"
              type="checkbox"
              checked={form.destaque}
              onChange={e => set('destaque', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label
              htmlFor="destaque"
              style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}
            >
              Exibir na página inicial (destaque)
            </label>
          </div>

          {/* Ordem */}
          <div>
            <label style={labelStyle} htmlFor="ordem">Ordem de exibição</label>
            <input
              id="ordem"
              type="number"
              min="0"
              value={form.ordem}
              onChange={e => set('ordem', parseInt(e.target.value, 10))}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div
          role="alert"
          style={{
            marginTop: '24px',
            padding: '14px 20px',
            background: 'rgba(138,48,48,0.08)',
            borderLeft: '3px solid #8a3030',
            fontFamily: 'var(--sans)',
            fontSize: '0.75rem',
            color: '#8a3030',
          }}
        >
          {erro}
        </div>
      )}

      {/* Botões */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(26,26,26,0.1)',
        }}
      >
        <button
          type="submit"
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            background: 'var(--text)',
            color: 'var(--bg)',
            border: 'none',
            padding: '16px 36px',
            cursor: 'pointer',
          }}
        >
          {editando ? 'Salvar alterações' : 'Criar obra'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/painel-ayume/dashboard')}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            background: 'transparent',
            color: 'var(--text)',
            border: '1px solid rgba(26,26,26,0.3)',
            padding: '16px 36px',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
