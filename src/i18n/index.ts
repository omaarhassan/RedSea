import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';

const savedLang = localStorage.getItem('rsc_preferred_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      zh: { translation: zh },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const applyRtlLayout = (lang: string) => {
  if (typeof document === 'undefined') return;
  const isRtl = lang === 'ar';
  
  // Set HTML root attributes
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
  
  if (document.body) {
    document.body.dir = isRtl ? 'rtl' : 'ltr';
    document.body.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  }

  // Update root classes for Tailwind and custom CSS selectors
  if (isRtl) {
    document.documentElement.classList.add('rtl');
    document.documentElement.classList.remove('ltr');
  } else {
    document.documentElement.classList.add('ltr');
    document.documentElement.classList.remove('rtl');
  }
};

export const setAppLanguage = (lang: 'en' | 'ar' | 'zh') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('rsc_preferred_lang', lang);
  applyRtlLayout(lang);
};

export const toggleGlobalLanguage = (): 'en' | 'ar' => {
  const current = (i18n.language as 'en' | 'ar' | 'zh') || 'en';
  const target = current === 'ar' ? 'en' : 'ar';
  setAppLanguage(target);
  return target;
};

// Initial sync on load
if (typeof document !== 'undefined') {
  applyRtlLayout(savedLang);
}

export default i18n;
