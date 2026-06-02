'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

/** Locale display metadata */
const LOCALE_META: Record<string, { label: string; flag: string; native: string }> = {
  en: { label: 'English', flag: '🇬🇧', native: 'English' },
  ja: { label: '日本語', flag: '🇯🇵', native: '日本語' },
  th: { label: 'ไทย', flag: '🇹🇭', native: 'ไทย' },
};

const LOCALES = ['en', 'ja', 'th'] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale as any });
  };

  const current = LOCALE_META[locale] || LOCALE_META.en;

  return (
    <div ref={dropdownRef} className="relative z-50">
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white/5 border border-white/10
          text-sm text-white/70
          hover:bg-white/10 hover:text-white/90 hover:border-white/15
          transition-all duration-200
          backdrop-blur-md
        "
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline font-medium">{current.native}</span>
        {/* Chevron */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-white/40"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="
              absolute right-0 mt-2 w-44
              rounded-xl overflow-hidden
              bg-slate-900/95 backdrop-blur-xl
              border border-white/10
              shadow-xl shadow-black/30
            "
            role="listbox"
            aria-label="Select language"
          >
            {LOCALES.map((loc) => {
              const meta = LOCALE_META[loc];
              const isActive = loc === locale;

              return (
                <motion.button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5
                    text-sm text-left transition-colors duration-150
                    ${isActive
                      ? 'text-sakura-400 bg-white/[0.04]'
                      : 'text-white/70 hover:text-white/90'
                    }
                  `}
                  role="option"
                  aria-selected={isActive}
                >
                  <span className="text-base leading-none">{meta.flag}</span>
                  <span className="flex-1 font-medium">{meta.native}</span>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-sakura-400"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
