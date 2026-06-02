'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface LoadingScreenProps {
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  onRetry?: () => void;
}

const DOT_COLORS = ['#f9a8b8', '#f47a98', '#ea4c7a'];

export default function LoadingScreen({ status, onRetry }: LoadingScreenProps) {
  const t = useTranslations('landing');

  const isLoading = status === 'PENDING' || status === 'STARTED';
  const isFailed = status === 'FAILURE';

  // Don't render for SUCCESS — parent handles navigation
  if (status === 'SUCCESS') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center glass-light"
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 animate-float"
          >
            {/* Pulsing dots */}
            <div className="flex items-center gap-4">
              {DOT_COLORS.map((color, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="h-5 w-5 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
                    willChange: 'transform, opacity',
                  }}
                />
              ))}
            </div>

            {/* Loading text with shimmer */}
            <div className="relative overflow-hidden">
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="text-lg font-medium text-white/90 glow-text"
              >
                {t('loading')}
              </motion.p>
              {/* Shimmer overlay */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 1 }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]"
                style={{ willChange: 'transform' }}
              />
            </div>

            {/* Timing hint — i18n'd */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-xs text-white/30"
            >
              {t('loadingHint')}
            </motion.p>
          </motion.div>
        )}

        {isFailed && (
          <motion.div
            key="failure"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 text-center px-6"
          >
            {/* Error icon */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                className="text-sakura-400"
              >
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  strokeOpacity="0.6"
                />
                <path
                  d="M28 18v12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="28" cy="36" r="1.5" fill="currentColor" />
              </svg>
            </motion.div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-white/90">
                {t('errorTitle')}
              </p>
              <p className="text-sm text-white/40 max-w-xs">
                {t('errorMessage')}
              </p>
            </div>

            {onRetry && (
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="
                  rounded-xl px-8 py-3 text-sm font-semibold text-white
                  bg-gradient-to-r from-sakura-500 via-sakura-400 to-rose-400
                  animate-pulse-glow transition-all duration-300
                "
              >
                {t('retry')}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
