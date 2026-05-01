import { createContext, useContext, useState } from 'react';
import { storage } from '@/lib/storage';

const AuthContext = createContext(null);

const CREDS = { email: 'ayu@portfolio.local', senha: 'ayu2026' };

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(() => storage.getAuth());

  function login(email, senha) {
    if (email === CREDS.email && senha === CREDS.senha) {
      storage.setAuth(true);
      setLoggedIn(true);
      return true;
    }
    return false;
  }

  function logout() {
    storage.setAuth(false);
    setLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
