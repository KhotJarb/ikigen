'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SummaryCard } from '@/lib/types';

interface ResultSlidesProps {
  cards: SummaryCard[];
}

export default function ResultSlides({ cards }: ResultSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % cards.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (!cards.length) return null;

  const card = cards[currentSlide];

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card display */}
      <div className="relative min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40, rotateY: 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40, rotateY: -8 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
            style={{
              background: card.gradient,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 blur-xl" />

            {/* Content */}
            <div className="relative z-10">
              {/* Emoji */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="text-4xl sm:text-5xl block mb-4"
              >
                {card.emoji}
              </motion.span>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                {card.title}
              </h3>

              {/* Content */}
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                {card.content}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls — hidden in image export */}
      <div className="flex items-center justify-center gap-4 mt-6" data-export-hide="true">
        {/* Prev button */}
        <motion.button
          onClick={prevSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                rounded-full transition-all duration-300
                ${
                  index === currentSlide
                    ? 'w-6 h-2 bg-white/80'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }
              `}
            />
          ))}
        </div>

        {/* Next button */}
        <motion.button
          onClick={nextSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
