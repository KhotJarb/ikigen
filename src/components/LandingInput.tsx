'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface LandingInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const MAX_CHARS = 2000;
const MIN_CHARS = 10;

export default function LandingInput({ onSubmit, isLoading }: LandingInputProps) {
  const t = useTranslations('landing');
  const [prompt, setPrompt] = useState('');

  const canSubmit = prompt.trim().length >= MIN_CHARS && !isLoading;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="
        w-full max-w-[640px] rounded-2xl p-6 sm:p-8
        bg-white/[0.04] backdrop-blur-xl
        border border-white/[0.08]
        shadow-[0_8px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          rows={4}
          disabled={isLoading}
          className="
            w-full resize-y rounded-xl
            border border-white/[0.06] bg-white/[0.03]
            px-4 py-3.5 text-sm text-white placeholder:text-white/40
            outline-none transition-all duration-300
            focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/15
            focus:bg-white/[0.06]
            disabled:cursor-not-allowed disabled:opacity-50
            min-h-[120px] max-h-[300px]
          "
        />

        {/* Character counter */}
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-[11px] text-white/25">
            {t('submitHint')}
          </span>
          <span
            className={`text-xs tabular-nums transition-colors ${
              prompt.length >= MAX_CHARS
                ? 'text-red-400'
                : prompt.length >= MIN_CHARS
                  ? 'text-white/40'
                  : 'text-white/20'
            }`}
          >
            {prompt.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Submit button — vibrant gradient CTA */}
      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit}
        whileHover={canSubmit ? { scale: 1.02 } : undefined}
        whileTap={canSubmit ? { scale: 0.97 } : undefined}
        className={`
          mt-5 w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white
          bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500
          bg-[length:200%_auto]
          transition-all duration-300
          disabled:opacity-30 disabled:cursor-not-allowed
          ${!isLoading && canSubmit
            ? 'hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:bg-right'
            : ''
          }
        `}
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isLoading ? t('loading') : t('submit')}
        </span>
      </motion.button>
    </motion.div>
  );
}
