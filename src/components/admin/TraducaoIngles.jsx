import { useState } from 'react';
import { traduzirPtEn, CotaEsgotadaError } from '@/lib/traducao';

const labelStyle = {
  fontFamily: 'var(--sans)',
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--mid)',
  display: 'block',
  marginBottom: '8px',
};

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

/**
 * Bloco "Inglês" dos formulários do painel.
 *
 * campos: [{ campo: 'descricao', label: 'Descrição', multiline: true, auto?: boolean }]
 *   auto: false → campo só manual (ex.: nomes de lugares, que tradução automática estraga)
 * form / onChange(chave, valor): estado do formulário pai
 * editadosEn: Set (mutável) com as chaves EN que a pessoa editou à mão
 */
export default function TraducaoIngles({ campos, form, onChange, editadosEn, email, marginTop = '32px' }) {
  const [traduzindo, setTraduzindo] = useState(false);
  const [aviso, setAviso] = useState('');

  async function traduzirAgora() {
    const comTexto = campos.filter(c => c.auto !== false && (form[c.campo] ?? '').trim());
    if (comTexto.length === 0) {
      setAviso('Preencha os textos em português primeiro.');
      return;
    }
    const jaPreenchidos = comTexto.filter(c => (form[`${c.campo}En`] ?? '').trim());
    if (jaPreenchidos.length > 0 && !window.confirm('Substituir o texto em inglês que já está preenchido pela tradução automática?')) {
      return;
    }
    setTraduzindo(true);
    setAviso('');
    try {
      for (const c of comTexto) {
        const en = await traduzirPtEn(form[c.campo], { email });
        onChange(`${c.campo}En`, en);
        editadosEn.delete(`${c.campo}En`);
      }
      setAviso('Tradução feita. Revise e ajuste se quiser antes de salvar.');
    } catch (e) {
      setAviso(
        e instanceof CotaEsgotadaError
          ? 'Limite diário de tradução gratuita atingido. Tente amanhã ou escreva em inglês à mão.'
          : 'Não foi possível traduzir agora. Verifique a conexão ou escreva em inglês à mão.'
      );
    } finally {
      setTraduzindo(false);
    }
  }

  return (
    <details style={{ marginTop, border: '1px solid rgba(197,192,186,0.5)', background: 'rgba(197,192,186,0.06)' }}>
      <summary style={{ padding: '14px 18px', fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mid)', cursor: 'pointer', userSelect: 'none' }}>
        Versão em inglês (tradução automática)
      </summary>
      <div style={{ padding: '0 18px 22px' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: 'var(--mid)', lineHeight: 1.6, margin: '12px 0 16px' }}>
          Ao salvar, o que estiver vazio ou desatualizado é traduzido automaticamente.
          Se você escrever ou corrigir o inglês aqui, o seu texto é mantido.
          Nomes de obras e coleções não são traduzidos.
        </div>

        <button
          type="button"
          onClick={traduzirAgora}
          disabled={traduzindo}
          style={{ fontFamily: 'var(--sans)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(26,26,26,0.3)', padding: '10px 18px', cursor: traduzindo ? 'not-allowed' : 'pointer', color: 'var(--text)', opacity: traduzindo ? 0.5 : 1, marginBottom: '20px' }}
        >
          {traduzindo ? 'Traduzindo...' : 'Traduzir agora para revisar'}
        </button>

        {aviso && (
          <div role="status" style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: 'var(--mid)', marginBottom: '20px', lineHeight: 1.6 }}>
            {aviso}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {campos.map(c => {
            const chave = `${c.campo}En`;
            const props = {
              id: chave,
              value: form[chave] || '',
              onChange: e => {
                editadosEn.add(chave);
                onChange(chave, e.target.value);
              },
              placeholder: !(form[c.campo] ?? '').trim()
                ? ''
                : c.auto === false
                  ? 'Opcional: vazio mostra o português'
                  : 'Vazio: será traduzido ao salvar',
            };
            return (
              <div key={chave}>
                <label style={labelStyle} htmlFor={chave}>{c.label} (EN)</label>
                {c.multiline
                  ? <textarea rows={c.rows ?? 5} {...props} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                  : <input type="text" {...props} style={inputStyle} />}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
