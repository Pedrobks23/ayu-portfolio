import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import obrasIniciais from '@/data/obrasIniciais';

const ObrasContext = createContext(null);

export function ObrasProvider({ children }) {
  const [obras, setObras] = useState(() => storage.getObras() || obrasIniciais);

  useEffect(() => {
    storage.setObras(obras);
  }, [obras]);

  function getObra(slug) {
    return obras.find(o => o.slug === slug) || null;
  }

  function criarObra(obra) {
    setObras(prev => [...prev, obra]);
  }

  function atualizarObra(slug, dados) {
    setObras(prev => prev.map(o => o.slug === slug ? { ...o, ...dados } : o));
  }

  function deletarObra(slug) {
    setObras(prev => prev.filter(o => o.slug !== slug));
  }

  return (
    <ObrasContext.Provider value={{ obras, getObra, criarObra, atualizarObra, deletarObra }}>
      {children}
    </ObrasContext.Provider>
  );
}

export function useObras() {
  return useContext(ObrasContext);
}
