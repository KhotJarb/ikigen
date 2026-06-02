'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SakuraBackground from '@/components/SakuraBackground';
import IkigaiRadarChart from '@/components/RadarChart';
import ResultSlides from '@/components/ResultSlides';
import ShareButton from '@/components/ShareButton';
import type { IkigaiResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Scroll-triggered reveal animation */
const reveal = (index: number) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay: 0.1 * index, duration: 0.7, ease: 'easeOut' as const },
});

/** Section card gradient presets for Spotify Wrapped feel */
const SECTION_GRADIENTS = {
  archetype: 'from-pink-600/10 via-rose-500/5 to-transparent',
  radar: 'from-indigo-600/10 via-purple-500/5 to-transparent',
  strengths: 'from-emerald-600/10 via-teal-500/5 to-transparent',
  growth: 'from-amber-600/10 via-orange-500/5 to-transparent',
  guidance: 'from-rose-600/10 via-pink-500/5 to-transparent',
  actions: 'from-cyan-600/10 via-teal-500/5 to-transparent',
};

export default function ResultsPage() {
  const t = useTranslations('results');
  const router = useRouter();
  const captureRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<IkigaiResult | null>(null);
  const [hasData, setHasData] = useState<boolean | null>(null);

  // Load result from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ikigen_result');
      if (!raw) {
        setHasData(false);
        return;
      }
      const parsed: IkigaiResult = JSON.parse(raw);
      setResult(parsed);
      setHasData(true);
    } catch {
      setHasData(false);
    }
  }, []);

  // Translated pillar labels for radar chart
  const pillarLabels = useMemo(() => ({
    love: t('pillars.love'),
    good: t('pillars.good'),
    need: t('pillars.need'),
    paid: t('pillars.paid'),
  }), [t]);

  // Determine top pillar for share functionality
  const topPillar = useMemo(() => {
    if (!result?.pillar_scores?.length) return undefined;
    const sorted = [...result.pillar_scores].sort((a, b) => b.score - a.score);
    return pillarLabels[sorted[0].pillar as keyof typeof pillarLabels] || sorted[0].label;
  }, [result, pillarLabels]);

  const handleRestart = () => {
    sessionStorage.removeItem('ikigen_quiz');
    sessionStorage.removeItem('ikigen_task_id');
    sessionStorage.removeItem('ikigen_result');
    router.push('/');
  };

  // Loading state
  if (hasData === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="loading-dot w-3 h-3 rounded-full bg-sakura-400" />
      </main>
    );
  }

  // No data state
  if (hasData === false || !result) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <SakuraBackground variant="results" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 text-center max-w-md"
        >
          <p className="text-lg text-white/80 mb-4">{t('noResultData')}</p>
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white text-sm font-semibold"
          >
            {t('goBack')}
          </motion.button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <SakuraBackground variant="results" />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-5">
        <div className="absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-pink-600/[0.04] blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Capturable area for download */}
        <div ref={captureRef} className="space-y-10 sm:space-y-16">

          {/* ═══ HERO HEADER ═══ */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center pt-4"
          >
            {/* Watermark kanji */}
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.05, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-7xl sm:text-8xl md:text-9xl font-light text-pink-100 select-none mb-2 leading-normal"
            >
              生き甲斐
            </motion.p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent pb-2 leading-relaxed">
              {t('title')}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-slate-300 font-medium mt-2"
            >
              {t('subtitle')}
            </motion.p>
          </motion.div>

          {/* ═══ ARCHETYPE CARD — Spotify "Your top artist" feel ═══ */}
          <motion.section {...reveal(0)}>
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${SECTION_GRADIENTS.archetype} border border-white/[0.06] p-8 sm:p-12 text-center`}>
              {/* Decorative corner glow */}
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-pink-500/10 blur-[60px]" />

              <p className="text-xs uppercase tracking-[0.25em] text-pink-400/70 mb-4 font-semibold">
                {t('archetype')}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {result.archetype}
              </h2>
              <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
                {result.archetype_description}
              </p>
            </div>
          </motion.section>

          {/* ═══ RADAR CHART — Wrapped "balance" visual ═══ */}
          <motion.section {...reveal(1)}>
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${SECTION_GRADIENTS.radar} border border-white/[0.06] p-6 sm:p-10`}>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-[50px]" />

              <h3 className="text-center text-sm font-semibold text-indigo-400/80 uppercase tracking-[0.2em] mb-6">
                {t('radarTitle')}
              </h3>
              <IkigaiRadarChart scores={result.pillar_scores} pillarLabels={pillarLabels} />
            </div>
          </motion.section>

          {/* ═══ STRENGTHS & GROWTH — Side-by-side Wrapped cards ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Strengths */}
            <motion.section {...reveal(2)}>
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${SECTION_GRADIENTS.strengths} border border-white/[0.06] p-6 sm:p-8 h-full`}>
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-[40px]" />
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-[0.15em] mb-5">
                  {t('strengths')}
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      className="flex items-start gap-3 text-sm text-white/75 leading-relaxed"
                    >
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* Growth Areas */}
            <motion.section {...reveal(3)}>
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${SECTION_GRADIENTS.growth} border border-white/[0.06] p-6 sm:p-8 h-full`}>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-amber-500/10 blur-[40px]" />
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-[0.15em] mb-5">
                  {t('growthAreas')}
                </h3>
                <ul className="space-y-3">
                  {result.growth_areas.map((g, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      className="flex items-start gap-3 text-sm text-white/75 leading-relaxed"
                    >
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      {g}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.section>
          </div>

          {/* ═══ GUIDANCE — Full-bleed gradient card ═══ */}
          <motion.section {...reveal(4)}>
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${SECTION_GRADIENTS.guidance} border border-white/[0.06] p-6 sm:p-10`}>
              <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-rose-500/10 blur-[50px]" />
              <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-[0.15em] mb-5">
                {t('guidance')}
              </h3>
              <p className="text-base sm:text-lg text-white/75 leading-relaxed whitespace-pre-line">
                {result.guidance}
              </p>
            </div>
          </motion.section>

          {/* ═══ ACTION STEPS — Numbered Wrapped-style list ═══ */}
          <motion.section {...reveal(5)}>
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${SECTION_GRADIENTS.actions} border border-white/[0.06] p-6 sm:p-10`}>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/10 blur-[50px]" />
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-[0.15em] mb-6">
                {t('actionSteps')}
              </h3>
              <div className="space-y-4">
                {result.action_steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.12 * i, duration: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-white/10 flex items-center justify-center text-xs font-bold text-cyan-300">
                      {i + 1}
                    </span>
                    <p className="text-sm sm:text-base text-white/75 leading-relaxed pt-1">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ═══ SPOTIFY WRAPPED-STYLE INSIGHT CARDS ═══ */}
          {result.summary_cards && result.summary_cards.length > 0 && (
            <motion.section {...reveal(6)}>
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-[0.2em] text-center mb-8">
                {t('insightCards')}
              </h3>
              <ResultSlides cards={result.summary_cards} />
            </motion.section>
          )}
        </div>

        {/* Action bar (outside capture area) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16"
        >
          <ShareButton captureRef={captureRef} topPillar={topPillar} />
        </motion.div>

        {/* Restart button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button
            onClick={handleRestart}
            className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-4"
          >
            {t('restart')}
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 text-[10px] text-white/20 tracking-widest uppercase"
        >
          {t('footer')}
        </motion.p>
      </div>
    </main>
  );
}
