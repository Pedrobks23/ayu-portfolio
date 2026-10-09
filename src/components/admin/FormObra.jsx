import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { useObras } from '@/context/ObrasContext';
import { uploadImagem, urlOtimizada } from '@/lib/cloudinary';
import { slugify } from '@/lib/utils';
import CropModal from '@/components/admin/CropModal';
import { useColecoes } from '@/hooks/useColecoes';
import { chaveColecao } from '@/lib/colecoes';

const DISPONIBILIDADES = ['Disponível', 'Sob consulta', 'Indisponível'];
const TIPOS = ['Escultura', 'Pintura'];
const MAX_IMAGENS = 5;
const MAX_MB = 8;
const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

function isHeic(file) {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

const estadoVazio = {
  titulo: '',
  tipo: 'Escultura',
  colecao: '',
  ano: new Date().getFullYear(),
  tecnica: '',
  dimensoes: '',
  disponibilidade: 'Disponível',
  preco: '',
  precoVisivel: false,
  descricao: '',
  visivel: true,
  destaque: false,
  ordem: 0,
  tituloEn: '',
  tecnicaEn: '',
  colecaoEn: '',
  descricaoEn: '',
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

export default function FormObra({ obraExistente }) {
  const navigate = useNavigate();
  const { criarObra, atualizarObra, obras } = useObras();
  const fileRef = useRef(null);

  const [form, setForm] = useState(() => {
    if (!obraExistente) return estadoVazio;
    const { imagens: _, slug: __, criadoEm: ___, atualizadoEm: ____, ...rest } = obraExistente;
    return {
      tituloEn: '',
      tecnicaEn: '',
      colecaoEn: '',
      descricaoEn: '',
      ...rest,
    };
  });

  const [slugPreview, setSlugPreview] = useState(obraExistente?.slug || '');
  const [imagens, setImagens] = useState(() =>
    (obraExistente?.imagens || []).map(img => ({
      id: makeId(),
      publicId: img.publicId,
      url: img.url,
      bytes: img.bytes ?? 0,
      width: img.width ?? 0,
      height: img.height ?? 0,
      crop: img.crop ?? null,
      preview: img.url,
      uploading: false,
      erro: null,
    }))
  );
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [cropModalId, setCropModalId] = useState(null);

  const editando = Boolean(obraExistente);
  const { colecoes } = useColecoes();
  const colecaoAtualCadastrada = colecoes.find(c => chaveColecao(c.nome) === chaveColecao(form.colecao));
  const uploadandoAlguma = imagens.some(i => i.uploading);

  useEffect(() => {
    if (!editando) setSlugPreview(slugify(form.titulo));
  }, [form.titulo, editando]);

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleAddImagens(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const slots = MAX_IMAGENS - imagens.filter(i => !i.erro).length;
    if (slots <= 0) {
      setErro(`Máximo de ${MAX_IMAGENS} imagens por obra.`);
      return;
    }

    const validos = [];
    for (const file of files.slice(0, slots)) {
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      if (!FORMATOS.includes(file.type) && !isHeic) {
        setErro('Formato inválido. Use JPG, PNG, WebP ou HEIC.');
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setErro(`"${file.name}" excede ${MAX_MB}MB.`);
        continue;
      }
      validos.push(file);
    }

    if (!validos.length) return;
    setErro('');

    const novos = validos.map(file => ({
      id: makeId(),
      publicId: null,
      url: null,
      preview: URL.createObjectURL(file),
      uploading: true,
      erro: null,
      _file: file,
    }));

    setImagens(prev => [...prev, ...novos]);

    for (const item of novos) {
      try {
        const arquivo = isHeic(item._file)
          ? item._file
          : await imageCompression(item._file, {
              maxSizeMB: 2,
              maxWidthOrHeight: 2400,
              useWebWorker: true,
            });
        const { publicId, url, bytes, width, height } = await uploadImagem(arquivo);
        URL.revokeObjectURL(item.preview);
        setImagens(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, publicId, url, bytes, width, height, crop: null, preview: url, uploading: false, _file: undefined }
              : i
          )
        );
      } catch {
        setImagens(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, uploading: false, erro: 'Falha no upload. Tente novamente.' }
              : i
          )
        );
      }
    }
  }

  function moverImagem(idx, direcao) {
    setImagens(prev => {
      const arr = [...prev];
      const destino = idx + direcao;
      if (destino < 0 || destino >= arr.length) return arr;
      [arr[idx], arr[destino]] = [arr[destino], arr[idx]];
      return arr;
    });
  }

  function removerImagem(id) {
    setImagens(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (uploadandoAlguma) {
      setErro('Aguarde o upload das imagens terminar.');
      return;
    }

    const slug = editando ? obraExistente.slug : slugPreview;
    if (!slug) {
      setErro('O título não gerou um slug válido.');
      return;
    }
    if (!editando && obras.find(o => o.slug === slug)) {
      setErro(`Já existe uma obra com o slug "${slug}". Altere o título.`);
      return;
    }

    const imagensSalvas = imagens
      .filter(i => i.publicId && !i.erro)
      .map((i, idx) => ({ publicId: i.publicId, url: i.url, bytes: i.bytes ?? 0, width: i.width ?? 0, height: i.height ?? 0, crop: i.crop ?? null, ordem: idx }));

    const dadosObra = { ...form, slug, imagens: imagensSalvas };

    setSalvando(true);
    try {
      if (editando) {
        await atualizarObra(obraExistente.slug, dadosObra);
      } else {
        await criarObra(slug, dadosObra);
      }
      navigate('/painel-ayume/dashboard');
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
  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' };

  const imgParaCrop = imagens.find(i => i.id === cropModalId);

  return (
    <>
    {imgParaCrop && (
      <CropModal
        imagemUrl={imgParaCrop.url}
        cropInicial={imgParaCrop.crop}
        onConfirmar={crop => {
          setImagens(prev => prev.map(i => i.id === cropModalId ? { ...i, crop } : i));
          setCropModalId(null);
        }}
        onFechar={() => setCropModalId(null)}
      />
    )}
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
          <div>
            <label style={labelStyle} htmlFor="titulo">Título</label>
            <input
              id="titulo" type="text" required
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              style={inputStyle}
              placeholder="quando se corrói"
            />
            {!editando && slugPreview && (
              <div style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', color: 'var(--mid)', marginTop: '6px' }}>
                slug: <em>{slugPreview}</em>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle} htmlFor="tipo">Tipo</label>
            <select id="tipo" value={form.tipo} onChange={e => set('tipo', e.target.value)} style={selectStyle}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle} htmlFor="colecao">Coleção</label>
            <select
              id="colecao"
              value={colecaoAtualCadastrada ? colecaoAtualCadastrada.id : form.colecao ? '__atual__' : ''}
              onChange={e => {
                const c = colecoes.find(x => x.id === e.target.value);
                if (c) {
                  setForm(prev => ({ ...prev, colecao: c.nome, colecaoEn: c.nomeEn || '' }));
                } else if (e.target.value === '') {
                  setForm(prev => ({ ...prev, colecao: '', colecaoEn: '' }));
                }
              }}
              style={selectStyle}
            >
              <option value="">— Sem coleção —</option>
              {colecoes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}{c.visivel === false ? ' (oculta)' : ''}
                </option>
              ))}
              {form.colecao && !colecaoAtualCadastrada && (
                <option value="__atual__">{form.colecao} (não cadastrada)</option>
              )}
            </select>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', color: 'var(--mid)', marginTop: '6px' }}>
              Nova coleção?{' '}
              <a href="/painel-ayume/colecoes/nova" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)' }}>
                Cadastre aqui
              </a>{' '}
              (abre em outra aba; ela aparece nesta lista na hora).
            </div>
          </div>

          <div>
            <label style={labelStyle} htmlFor="ano">Ano</label>
            <input id="ano" type="number" required min="1900" max="2100"
              value={form.ano}
              onChange={e => set('ano', parseInt(e.target.value, 10))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="tecnica">Técnica</label>
            <input id="tecnica" type="text"
              value={form.tecnica}
              onChange={e => set('tecnica', e.target.value)}
              style={inputStyle}
              placeholder="Cerâmica esmaltada"
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="dimensoes">Dimensões</label>
            <input id="dimensoes" type="text"
              value={form.dimensoes}
              onChange={e => set('dimensoes', e.target.value)}
              style={inputStyle}
              placeholder="22 × 20 × 18 cm · 3kg"
            />
          </div>
        </div>

        {/* Coluna direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <label style={labelStyle} htmlFor="disponibilidade">Disponibilidade</label>
            <select id="disponibilidade" value={form.disponibilidade}
              onChange={e => set('disponibilidade', e.target.value)} style={selectStyle}>
              {DISPONIBILIDADES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle} htmlFor="preco">Valor (opcional)</label>
            <input
              id="preco"
              type="text"
              value={form.preco || ''}
              onChange={e => set('preco', e.target.value)}
              style={inputStyle}
              placeholder="R$ 1.200,00"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input
                id="precoVisivel"
                type="checkbox"
                checked={form.precoVisivel || false}
                onChange={e => set('precoVisivel', e.target.checked)}
                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
              />
              <label htmlFor="precoVisivel" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                Exibir valor na página da obra
              </label>
            </div>
          </div>

          <div>
            <label style={labelStyle} htmlFor="descricao">Descrição (opcional)</label>
            <textarea id="descricao" rows={4}
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Texto livre sobre a obra..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input id="visivel" type="checkbox"
                checked={form.visivel !== false}
                onChange={e => set('visivel', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="visivel" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                Publicada (visível no catálogo)
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input id="destaque" type="checkbox"
                checked={form.destaque}
                onChange={e => set('destaque', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="destaque" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                Aparecer na página inicial (destaque)
              </label>
            </div>
          </div>

          <div>
            <label style={labelStyle} htmlFor="ordem">Ordem de exibição</label>
            <input id="ordem" type="number" min="0"
              value={form.ordem}
              onChange={e => set('ordem', parseInt(e.target.value, 10))}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Bloco tradução EN */}
      <details
        style={{
          marginTop: '40px',
          border: '1px solid rgba(197,192,186,0.5)',
          background: 'rgba(197,192,186,0.06)',
        }}
      >
        <summary
          style={{
            padding: '16px 20px',
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          Tradução para inglês (opcional)
        </summary>
        <div style={{ padding: '0 20px 24px' }}>
          <div
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.68rem',
              color: 'var(--mid)',
              lineHeight: 1.6,
              marginBottom: '24px',
              marginTop: '12px',
            }}
          >
            Deixe em branco pra usar o texto em português. Recomendado preencher pelo menos bio e descrições.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={labelStyle} htmlFor="tituloEn">Título (EN)</label>
              <input id="tituloEn" type="text"
                value={form.tituloEn || ''}
                onChange={e => set('tituloEn', e.target.value)}
                style={inputStyle}
                placeholder="when it corrodes"
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="tecnicaEn">Técnica (EN)</label>
              <input id="tecnicaEn" type="text"
                value={form.tecnicaEn || ''}
                onChange={e => set('tecnicaEn', e.target.value)}
                style={inputStyle}
                placeholder="Glazed ceramics"
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="colecaoEn">Coleção (EN)</label>
              <input id="colecaoEn" type="text"
                value={form.colecaoEn || ''}
                onChange={e => set('colecaoEn', e.target.value)}
                style={inputStyle}
                placeholder="8,092 days at home"
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="descricaoEn">Descrição (EN)</label>
              <textarea id="descricaoEn" rows={4}
                value={form.descricaoEn || ''}
                onChange={e => set('descricaoEn', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Free text about the work..."
              />
            </div>
          </div>
        </div>
      </details>

      {/* Bloco de imagens */}
      <div style={{ marginTop: '40px' }}>
        <div
          style={{
            background: 'rgba(197,192,186,0.18)',
            border: '1px solid rgba(197,192,186,0.5)',
            padding: '16px 20px',
            marginBottom: '24px',
            fontFamily: 'var(--sans)',
            fontSize: '0.72rem',
            lineHeight: 1.75,
            color: 'var(--mid)',
          }}
        >
          <strong style={{ color: 'var(--text)' }}>Dicas pras imagens</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
            <li>Até {MAX_IMAGENS} imagens por obra</li>
            <li>Tamanho máximo: {MAX_MB}MB por imagem</li>
            <li>Formatos aceitos: JPG, PNG, WebP, HEIC</li>
            <li>A primeira imagem é a capa (use ↑↓ pra reordenar)</li>
            <li>Marque "Aparecer na página inicial" pra destacar a obra na Home</li>
            <li>Use boas fotos com fundo neutro pra melhor apresentação</li>
          </ul>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <label style={{ ...labelStyle, margin: 0 }}>
            Imagens ({imagens.filter(i => i.publicId).length}/{MAX_IMAGENS})
          </label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={imagens.filter(i => !i.erro).length >= MAX_IMAGENS}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'none',
              border: '1px solid rgba(26,26,26,0.3)',
              padding: '8px 18px',
              cursor: 'pointer',
              color: 'var(--text)',
              opacity: imagens.filter(i => !i.erro).length >= MAX_IMAGENS ? 0.4 : 1,
            }}
          >
            + Adicionar imagem
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            multiple
            style={{ display: 'none' }}
            onChange={handleAddImagens}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {imagens.map((img, idx) => (
            <div
              key={img.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                background: img.erro ? 'rgba(138,48,48,0.05)' : 'rgba(197,192,186,0.12)',
                border: `1px solid ${img.erro ? 'rgba(138,48,48,0.2)' : 'rgba(197,192,186,0.4)'}`,
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  background: '#0D0D0D',
                  position: 'relative',
                }}
              >
                <img
                  src={img.publicId && !img.uploading ? urlOtimizada(img.publicId, 'thumb', img.crop) : img.preview}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {img.uploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      color: 'white',
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    ...
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {idx === 0 && !img.erro && (
                  <span
                    style={{
                      fontFamily: 'var(--sans)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--mid)',
                      border: '1px solid rgba(26,26,26,0.2)',
                      padding: '2px 8px',
                      display: 'inline-block',
                      marginBottom: '4px',
                    }}
                  >
                    Capa
                  </span>
                )}
                {img.uploading && (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: 'var(--mid)' }}>
                    Fazendo upload...
                  </div>
                )}
                {img.erro && (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: '#8a3030' }}>
                    {img.erro}
                  </div>
                )}
                {img.publicId && !img.uploading && (
                  <div
                    style={{
                      fontFamily: 'var(--sans)',
                      fontSize: '0.65rem',
                      color: 'var(--mid)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {img.publicId}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {img.publicId && !img.uploading && !img.erro && (
                  <button
                    type="button"
                    onClick={() => setCropModalId(img.id)}
                    title="Ajustar enquadramento"
                    style={{
                      background: 'none',
                      border: '1px solid rgba(26,26,26,0.25)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '0.55rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--sans)',
                      color: 'var(--text)',
                    }}
                  >
                    Ajustar
                  </button>
                )}
                <button type="button" onClick={() => moverImagem(idx, -1)} disabled={idx === 0}
                  title="Mover para cima"
                  style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, padding: '4px 6px', fontSize: '0.8rem', color: 'var(--text)' }}>
                  ↑
                </button>
                <button type="button" onClick={() => moverImagem(idx, 1)} disabled={idx === imagens.length - 1}
                  title="Mover para baixo"
                  style={{ background: 'none', border: 'none', cursor: idx === imagens.length - 1 ? 'default' : 'pointer', opacity: idx === imagens.length - 1 ? 0.3 : 1, padding: '4px 6px', fontSize: '0.8rem', color: 'var(--text)' }}>
                  ↓
                </button>
                <button type="button" onClick={() => removerImagem(img.id)}
                  title="Remover imagem"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: '0.85rem', color: '#8a3030', marginLeft: '4px' }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
          disabled={salvando || uploadandoAlguma}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            background: 'var(--text)',
            color: 'var(--bg)',
            border: 'none',
            padding: '16px 36px',
            cursor: salvando || uploadandoAlguma ? 'not-allowed' : 'pointer',
            opacity: salvando || uploadandoAlguma ? 0.5 : 1,
          }}
        >
          {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar obra'}
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
    </>
  );
}
