import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loggedIn, login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (loggedIn) navigate('/painel-ayume/dashboard', { replace: true });
  }, [loggedIn, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    const ok = login(email, senha);
    if (ok) {
      navigate('/painel-ayume/dashboard', { replace: true });
    } else {
      setErro('E-mail ou senha incorretos.');
    }
  }

  const inputStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid rgba(26,26,26,0.2)',
    background: 'transparent',
    padding: '12px 0',
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
    marginBottom: '10px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '1.3rem',
            letterSpacing: '0.06em',
            marginBottom: '8px',
            color: 'var(--text)',
          }}
        >
          Ayume Andrade
        </div>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            marginBottom: '48px',
          }}
        >
          Área administrativa
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <label style={labelStyle} htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              style={inputStyle}
            />
          </div>

          {erro && (
            <div
              role="alert"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.72rem',
                color: '#8a3030',
                letterSpacing: '0.03em',
              }}
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: '8px',
              background: 'var(--text)',
              color: 'var(--bg)',
              fontFamily: 'var(--sans)',
              fontSize: '0.62rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              border: 'none',
              padding: '18px 40px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
