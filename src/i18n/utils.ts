import { ui, defaultLang } from './ui';
import translations from '../../assets/data/translations.json';

export function getLangFromUrl(url: URL) {
  const segments = url.pathname.split('/').filter(Boolean);
  // If the first segment is the base path, skip it
  const langIndex = segments[0] === 'retardo_cne' ? 1 : 0;
  const lang = segments[langIndex];
  
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: string) {
    // Check our ui object first for small overrides/core UI strings
    if (ui[lang] && (ui[lang] as any)[key]) {
        return (ui[lang] as any)[key];
    }
    
    // Fallback and use the main translations.json for the rest
    const langTrans = (translations as any)[lang];
    if (langTrans && langTrans[key]) {
        return langTrans[key];
    }

    // Deep check for objects (like mission_text)
    if (langTrans) {
        const parts = key.split('.');
        let current = langTrans;
        for (const part of parts) {
            if (current[part] === undefined) {
                current = undefined;
                break;
            }
            current = current[part];
        }
        if (current !== undefined) return current;
    }

    return (translations as any)[defaultLang][key] || key;
  }
}
