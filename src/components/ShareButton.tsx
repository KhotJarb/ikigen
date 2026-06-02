'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toPng } from 'html-to-image';
import ShareModal from './ShareModal';

interface ShareButtonProps {
  /** Ref to the DOM element to capture as an image */
  captureRef: React.RefObject<HTMLElement | null>;
  /** The user's top pillar label (e.g. "What You Love") for personalized share text */
  topPillar?: string;
}

export default function ShareButton({ captureRef, topPillar }: ShareButtonProps) {
  const t = useTranslations('results');
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setShowToast(message);
    toastTimer.current = setTimeout(() => setShowToast(null), 2500);
  };

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0f0f23',
        filter: (node: HTMLElement) => {
          // Exclude elements marked with data-export-hide
          return !node.dataset?.exportHide;
        },
      });

      const link = document.createElement('a');
      link.download = `ikigen-result-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      showNotification(t('downloadSuccess'));
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [captureRef, isDownloading, t]);

  // Build personalized share text
  const shareText = topPillar
    ? t('shareTextWithPillar', { pillar: topPillar })
    : t('shareText');

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* Download button */}
        <motion.button
          onClick={handleDownload}
          disabled={isDownloading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="
            flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-white/5 border border-white/10
            text-sm font-medium text-white/80
            hover:bg-white/10 hover:text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {isDownloading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 10v2a2 2 0 002 2h8a2 2 0 002-2v-2M8 2v8m0 0l3-3m-3 3L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {t('download')}
        </motion.button>

        {/* Share button — opens custom ShareModal */}
        <motion.button
          onClick={() => setIsShareModalOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="
            flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500
            text-sm font-semibold text-white
            transition-all duration-200
            hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]
          "
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5.7 6.9l4.6-2.8M5.7 9.1l4.6 2.8" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          {t('share')}
        </motion.button>
      </div>

      {/* ShareModal — replaces navigator.share */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareText={shareText}
      />

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="
              absolute -top-12 left-1/2 -translate-x-1/2
              px-4 py-2 rounded-lg
              bg-white/10 backdrop-blur-md border border-white/10
              text-xs text-white/90 whitespace-nowrap
              shadow-lg
            "
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
