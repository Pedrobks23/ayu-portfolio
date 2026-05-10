import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ObrasContext = createContext(null);

export function ObrasProvider({ children }) {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'obras'), snap => {
      const data = snap.docs.map(d => ({ ...d.data(), slug: d.id }));
      setObras(data.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
      setLoading(false);
    });
    return unsub;
  }, []);

  function getObra(slug) {
    return obras.find(o => o.slug === slug) ?? null;
  }

  async function criarObra(slug, dados) {
    await setDoc(doc(db, 'obras', slug), {
      ...dados,
      criadoEm:    serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  }

  async function atualizarObra(slug, dados) {
    await setDoc(
      doc(db, 'obras', slug),
      { ...dados, atualizadoEm: serverTimestamp() },
      { merge: true }
    );
  }

  async function deletarObra(slug) {
    await deleteDoc(doc(db, 'obras', slug));
  }

  return (
    <ObrasContext.Provider value={{ obras, loading, getObra, criarObra, atualizarObra, deletarObra }}>
      {children}
    </ObrasContext.Provider>
  );
}

export function useObras() {
  return useContext(ObrasContext);
}
