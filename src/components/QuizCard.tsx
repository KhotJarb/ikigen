'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { QuizQuestion, IkigaiPillar } from '@/lib/types';

interface QuizCardProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string, isCustom: boolean) => void;
  direction: 'forward' | 'backward';
}

/** Pillar accent colors for visual differentiation */
const PILLAR_STYLES: Record<
  IkigaiPillar,
  { border: string; glow: string; badge: string; bg: string }
> = {
  love: {
    border: 'border-ikigai-love/30',
    glow: 'shadow-[0_0_30px_rgba(244,114,182,0.15)]',
    badge: 'bg-ikigai-love/15 text-ikigai-love',
    bg: 'from-ikigai-love/5 to-transparent',
  },
  good: {
    border: 'border-ikigai-good/30',
    glow: 'shadow-[0_0_30px_rgba(129,140,248,0.15)]',
    badge: 'bg-ikigai-good/15 text-ikigai-good',
    bg: 'from-ikigai-good/5 to-transparent',
  },
  need: {
    border: 'border-ikigai-need/30',
    glow: 'shadow-[0_0_30px_rgba(52,211,153,0.15)]',
    badge: 'bg-ikigai-need/15 text-ikigai-need',
    bg: 'from-ikigai-need/5 to-transparent',
  },
  paid: {
    border: 'border-ikigai-paid/30',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]',
    badge: 'bg-ikigai-paid/15 text-ikigai-paid',
    bg: 'from-ikigai-paid/5 to-transparent',
  },
};

/** Slide animation variants based on navigation direction */
const slideVariants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -80 : 80,
    opacity: 0,
  }),
};

export default function QuizCard({
  question,
  selectedAnswer,
  onAnswer,
  direction,
}: QuizCardProps) {
  const t = useTranslations('quiz');
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(
    selectedAnswer !== null &&
      !question.options.includes(selectedAnswer)
  );

  const style = PILLAR_STYLES[question.pillar];
  const pillarLabel = t(`pillarLabels.${question.pillar}`);

  const handleOptionClick = (option: string) => {
    setShowCustomInput(false);
    onAnswer(question.id, option, false);
  };

  const handleOtherClick = () => {
    setShowCustomInput(true);
    if (customText.trim()) {
      onAnswer(question.id, customText.trim(), true);
    }
  };

  const handleCustomChange = (value: string) => {
    setCustomText(value);
    if (value.trim()) {
      onAnswer(question.id, value.trim(), true);
    }
  };

  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={`
        w-full max-w-2xl rounded-2xl border
        bg-gradient-to-br ${style.bg}
        backdrop-blur-xl
        ${style.border} ${style.glow}
        p-6 sm:p-8
      `}
      style={{
        background: 'rgba(15, 15, 35, 0.55)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Pillar badge */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`
            inline-flex items-center px-3 py-1 rounded-full
            text-[11px] font-semibold uppercase tracking-wider
            ${style.badge}
          `}
        >
          {pillarLabel}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-lg sm:text-xl font-medium text-white/95 leading-relaxed mb-6">
        {question.question}
      </h2>

      {/* Answer options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option && !showCustomInput;
          return (
            <motion.button
              key={index}
              onClick={() => handleOptionClick(option)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full text-left px-4 py-3.5 rounded-xl
                text-sm leading-relaxed
                transition-all duration-200
                border
                ${
                  isSelected
                    ? `${style.border} bg-white/10 text-white`
                    : 'border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/10 hover:text-white/90'
                }
              `}
            >
              <span className="flex items-start gap-3">
                {/* Selection indicator */}
                <span
                  className={`
                    mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2
                    flex items-center justify-center transition-all duration-200
                    ${
                      isSelected
                        ? `${style.border} bg-white/15`
                        : 'border-white/20'
                    }
                  `}
                >
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </span>
                <span>{option}</span>
              </span>
            </motion.button>
          );
        })}

        {/* "Other" option */}
        {question.allow_other && (
          <div className="space-y-2">
            <motion.button
              onClick={handleOtherClick}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full text-left px-4 py-3.5 rounded-xl
                text-sm transition-all duration-200 border
                ${
                  showCustomInput
                    ? `${style.border} bg-white/10 text-white`
                    : 'border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/10 hover:text-white/90'
                }
              `}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`
                    mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2
                    flex items-center justify-center transition-all duration-200
                    ${
                      showCustomInput
                        ? `${style.border} bg-white/15`
                        : 'border-white/20'
                    }
                  `}
                >
                  {showCustomInput && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </span>
                <span>{t('other')}</span>
              </span>
            </motion.button>

            {/* Custom input field */}
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-8"
              >
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder={t('otherPlaceholder')}
                  autoFocus
                  className={`
                    w-full px-4 py-2.5 rounded-lg
                    bg-white/5 border ${style.border}
                    text-sm text-white/90 placeholder-white/30
                    outline-none transition-all duration-200
                    focus:bg-white/[0.07] focus:ring-1 focus:ring-white/15
                  `}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
