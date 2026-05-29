import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DEFAULT_CONFIG = {
  bio: 'Ayume Andrade é artista visual contemporânea. Sua prática em cerâmica investiga a memória como eixo central, a partir da relação com a matéria. Desenvolve esculturas em cerâmica esmaltada a partir dessas reminiscências.',
  heroImagem: null,
  contato: {
    email: import.meta.env.VITE_EMAIL_CONTATO || 'ayumeandrade00@gmail.com',
    instagram: '@ayuandrade',
    instagramUrl: 'https://www.instagram.com/ayuandrade/',
    whatsapp: import.meta.env.VITE_WHATSAPP_NUMERO || '5585996195880',
  },
  portfolioVisualUrl: 'https://canva.link/ayumeandradeportfolio',
};

export function useConfiguracoes() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'configuracoes', 'site');
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function salvarConfig(dados) {
    const ref = doc(db, 'configuracoes', 'site');
    await setDoc(ref, { ...dados, atualizadoEm: serverTimestamp() }, { merge: true });
  }

  return { config, loading, salvarConfig };
}
