import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationKeys } from '../types/i18n';

// Import translation files
import { enTranslations } from '../locales/en';
import { hiTranslations } from '../locales/hi';
import { mrTranslations } from '../locales/mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  availableLanguages: { code: Language; name: string; nativeName: string }[];
}

const translations: Record<Language, TranslationKeys> = {
  en: enTranslations as TranslationKeys,
  hi: hiTranslations as TranslationKeys,
  mr: mrTranslations as TranslationKeys,
};

const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && ['en', 'hi', 'mr'].includes(savedLanguage) ? savedLanguage : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update document language attribute
    document.documentElement.lang = lang;
    
    // Update document direction for RTL languages if needed
    document.documentElement.dir = 'ltr'; // All our languages are LTR
  };

  useEffect(() => {
    // Set initial document language
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
