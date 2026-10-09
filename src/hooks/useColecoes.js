import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ordenarColecoes } from '@/lib/colecoes';

// Todas as coleções cadastradas (inclusive ocultas), ordenadas por `ordem`.
export function useColecoes() {
  const [colecoes, setColecoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'colecoes'),
      snap => {
        setColecoes(ordenarColecoes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { colecoes, loading };
}
