'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { IkigaiPillar } from '@/lib/types';

interface ProgressBarProps {
  current: number;
  total: number;
  currentPillar?: IkigaiPillar;
}

/** Gradient colors for each pillar */
const PILLAR_GRADIENTS: Record<IkigaiPillar, string> = {
  love: 'from-pink-500 via-rose-400 to-pink-400',
  good: 'from-indigo-500 via-purple-400 to-indigo-400',
  need: 'from-emerald-500 via-teal-400 to-emerald-400',
  paid: 'from-amber-500 via-yellow-400 to-amber-400',
};

/** Pillar glow colors for the progress bar */
const PILLAR_GLOW: Record<IkigaiPillar, string> = {
  love: 'rgba(244, 114, 182, 0.4)',
  good: 'rgba(129, 140, 248, 0.4)',
  need: 'rgba(52, 211, 153, 0.4)',
  paid: 'rgba(251, 191, 36, 0.4)',
};

export default function ProgressBar({
  current,
  total,
  currentPillar = 'love',
}: ProgressBarProps) {
  const t = useTranslations('quiz');
  const progress = ((current + 1) / total) * 100;
  const gradient = PILLAR_GRADIENTS[currentPillar];
  const glow = PILLAR_GLOW[currentPillar];

  return (
    <div className="w-full max-w-2xl">
      {/* Progress text */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-white/50 font-medium">
          {t('progress', { current: current + 1, total })}
        </p>
        <p className="text-xs text-white/30 tabular-nums">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Progress bar track */}
      <div className="relative h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        {/* Animated fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            boxShadow: `0 0 12px ${glow}, 0 0 4px ${glow}`,
          }}
        />
      </div>

      {/* Pillar dots indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {(['love', 'good', 'need', 'paid'] as IkigaiPillar[]).map((pillar) => (
          <div
            key={pillar}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${
                pillar === currentPillar
                  ? 'scale-125 opacity-100'
                  : 'scale-100 opacity-30'
              }
            `}
            style={{
              backgroundColor:
                pillar === 'love'
                  ? '#f472b6'
                  : pillar === 'good'
                    ? '#818cf8'
                    : pillar === 'need'
                      ? '#34d399'
                      : '#fbbf24',
              boxShadow:
                pillar === currentPillar
                  ? `0 0 8px ${PILLAR_GLOW[pillar]}`
                  : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
