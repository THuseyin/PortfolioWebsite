import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlagDe } from '@sankyu/react-circle-flags/flags/de'
import { FlagGb } from '@sankyu/react-circle-flags/flags/gb'
import { FlagTr } from '@sankyu/react-circle-flags/flags/tr'

import { supportedLanguages, type SupportedLanguage } from '../../i18n'
import './language-switcher.css'

const languageLabels: Record<SupportedLanguage, string> = {
  en: 'language.english',
  tr: 'language.turkish',
  de: 'language.german',
}

export function LanguageSwitcher({ inverted = false }: { inverted?: boolean }) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLanguage = (i18n.resolvedLanguage?.split('-')[0] ?? 'en') as SupportedLanguage

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const selectLanguage = async (language: SupportedLanguage) => {
    await i18n.changeLanguage(language)
    setOpen(false)
  }

  return (
    <div className={`language-switcher${inverted ? ' language-switcher--inverted' : ''}`} ref={containerRef}>
      <button
        className="language-switcher__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('language.label')}
        onClick={() => setOpen((current) => !current)}
      >
        <LanguageMark language={activeLanguage} />
        <span>{activeLanguage.toUpperCase()}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="language-switcher__menu"
            role="listbox"
            aria-label={t('language.label')}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {supportedLanguages.map((language) => (
              <button
                className="language-switcher__option"
                type="button"
                role="option"
                aria-selected={language === activeLanguage}
                key={language}
                onClick={() => void selectLanguage(language)}
              >
                <LanguageMark language={language} />
                <span>{language.toUpperCase()}</span>
                <strong>{t(languageLabels[language])}</strong>
                {language === activeLanguage && <motion.i layoutId="active-language" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LanguageMark({ language }: { language: SupportedLanguage }) {
  if (language === 'tr') return <FlagTr className="language-mark" aria-hidden="true" />
  if (language === 'de') return <FlagDe className="language-mark" aria-hidden="true" />
  return <FlagGb className="language-mark" aria-hidden="true" />
}
