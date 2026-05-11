import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useParticipacoes() {
  const [participacoes, setParticipacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'participacoes'), orderBy('ordem', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const visiveis = docs.filter(p => p.visivel !== false);
      visiveis.sort((a, b) => {
        const da = a.dataInicio?.toMillis?.() ?? 0;
        const db_ = b.dataInicio?.toMillis?.() ?? 0;
        if (da !== db_) return db_ - da;
        return (a.ordem ?? 0) - (b.ordem ?? 0);
      });
      setParticipacoes(visiveis);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  return { participacoes, loading };
}
