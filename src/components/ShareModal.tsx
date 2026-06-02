'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The personalized share text */
  shareText: string;
}

export default function ShareModal({ isOpen, onClose, shareText }: ShareModalProps) {
  const t = useTranslations('results');
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(siteUrl);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${siteUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${siteUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText, siteUrl]);

  const shareOptions = [
    {
      id: 'copy',
      label: copied ? t('shareModal.copied') : t('shareModal.copyLink'),
      icon: copied ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4 4 8-8" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="6" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4 14V5a1 1 0 011-1h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      onClick: handleCopyLink,
      className: copied
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
    },
    {
      id: 'twitter',
      label: t('shareModal.twitter'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11.47 8.68L17.15 2h-1.34l-4.93 5.8L6.78 2H2l5.96 8.78L2 18h1.34l5.21-6.13L13.22 18H18l-6.53-9.32zm-1.84 2.17l-.6-.87L3.88 3.17h2.07l3.87 5.6.6.87 5.04 7.3h-2.07l-4.11-5.96-.05-.03z"/>
        </svg>
      ),
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank'),
      className: 'border-white/10 bg-white/5 text-white/80 hover:bg-sky-500/10 hover:text-sky-300 hover:border-sky-500/20',
    },
    {
      id: 'facebook',
      label: t('shareModal.facebook'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M18 10a8 8 0 10-9.25 7.9v-5.59H6.74V10h2.01V8.23c0-1.98 1.18-3.08 2.99-3.08.87 0 1.77.15 1.77.15v1.94h-1c-.98 0-1.29.61-1.29 1.24V10h2.2l-.35 2.31h-1.85v5.59A8 8 0 0018 10z"/>
        </svg>
      ),
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank'),
      className: 'border-white/10 bg-white/5 text-white/80 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/20',
    },
    {
      id: 'line',
      label: t('shareModal.line'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M18 8.36c0-3.52-3.58-6.36-8-6.36S2 4.84 2 8.36c0 3.14 2.83 5.78 6.65 6.28.26.05.61.17.7.39.08.2.05.5.03.7l-.11.68c-.04.2-.16.79.7.43.85-.36 4.6-2.68 6.28-4.6C17.5 11 18 9.76 18 8.36z"/>
        </svg>
      ),
      onClick: () => window.open(`https://line.me/R/msg/text/?${encodedText}%0A${encodedUrl}`, '_blank'),
      className: 'border-white/10 bg-white/5 text-white/80 hover:bg-green-500/10 hover:text-green-300 hover:border-green-500/20',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="
                w-full max-w-sm
                bg-slate-900/80 backdrop-blur-xl
                border border-white/10
                rounded-2xl
                shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-white">
                  {t('shareModal.title')}
                </h3>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                  aria-label={t('shareModal.close')}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Share options */}
              <div className="px-6 pb-6 space-y-2.5">
                {shareOptions.map((option, i) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                    onClick={option.onClick}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      border text-sm font-medium
                      transition-all duration-200
                      ${option.className}
                    `}
                  >
                    <span className="flex-shrink-0">{option.icon}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {/* Footer hint */}
              <div className="px-6 pb-5">
                <p className="text-[11px] text-white/20 text-center">
                  {t('shareModal.hint')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
