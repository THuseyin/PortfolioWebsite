import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { de } from './locales/de'
import { en } from './locales/en'
import { es } from './locales/es'
import { hi } from './locales/hi'
import { tr } from './locales/tr'
import { zh } from './locales/zh'

export const supportedLanguages = ['en', 'tr', 'de', 'zh', 'es', 'hi'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const storageKey = 'portfolio-language'

function detectLanguage(): SupportedLanguage {
  const storedLanguage = localStorage.getItem(storageKey)?.toLowerCase().split('-')[0]
  if (supportedLanguages.includes(storedLanguage as SupportedLanguage)) {
    return storedLanguage as SupportedLanguage
  }

  for (const locale of navigator.languages) {
    const language = locale.toLowerCase().split('-')[0]
    if (supportedLanguages.includes(language as SupportedLanguage)) return language as SupportedLanguage
  }

  return 'en'
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en }, tr: { translation: tr }, de: { translation: de },
    zh: { translation: zh }, es: { translation: es }, hi: { translation: hi },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.resolvedLanguage ?? 'en'
i18n.on('languageChanged', (language) => {
  const normalizedLanguage = language.split('-')[0] as SupportedLanguage
  localStorage.setItem(storageKey, normalizedLanguage)
  document.documentElement.lang = normalizedLanguage
})

export default i18n
