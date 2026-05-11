import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [lang, setLangState] = useState(
    () => localStorage.getItem('ayume:lang') || 'pt'
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(newLang) {
    setLangState(newLang);
    localStorage.setItem('ayume:lang', newLang);
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    const title = newLang === 'en'
      ? 'Ayume Andrade — Portfolio'
      : 'Ayume Andrade — Portfólio';
    document.title = title;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
