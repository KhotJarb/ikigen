'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SakuraBackground from '@/components/SakuraBackground';
import QuizCard from '@/components/QuizCard';
import ProgressBar from '@/components/ProgressBar';
import LoadingScreen from '@/components/LoadingScreen';
import { submitAnswers, getTaskStatus } from '@/lib/api';
import type { QuizQuestion } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Polling interval for analysis task status */
const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 120_000;

type QuizState = 'quiz' | 'submitting' | 'error';
type TaskStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';

export default function QuizPage() {
  const t = useTranslations('quiz');
  const router = useRouter();
  const locale = useLocale();

  // Quiz data from sessionStorage
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [taskId, setTaskId] = useState<string>('');
  const [hasData, setHasData] = useState<boolean | null>(null); // null = loading

  // Quiz navigation state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Answer state: { questionId: answer }
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Submission state
  const [quizState, setQuizState] = useState<QuizState>('quiz');
  const [analysisStatus, setAnalysisStatus] = useState<TaskStatus>('PENDING');

  // Polling refs
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load quiz data from sessionStorage on mount
  useEffect(() => {
    try {
      const quizRaw = sessionStorage.getItem('ikigen_quiz');
      const storedTaskId = sessionStorage.getItem('ikigen_task_id');

      if (!quizRaw || !storedTaskId) {
        setHasData(false);
        return;
      }

      const parsed = JSON.parse(quizRaw);
      const loadedQuestions: QuizQuestion[] = parsed.questions || [];

      if (loadedQuestions.length === 0) {
        setHasData(false);
        return;
      }

      setQuestions(loadedQuestions);
      setTaskId(storedTaskId);
      setHasData(true);
    } catch {
      setHasData(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback(
    (questionId: string, answer: string, _isCustom: boolean) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    },
    []
  );

  // Navigate to next question
  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setDirection('forward');
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length]);

  // Navigate to previous question
  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Submit all answers for analysis
  const handleSubmit = useCallback(async () => {
    setQuizState('submitting');
    setAnalysisStatus('PENDING');

    try {
      const locale = document.documentElement.lang || 'en';
      const response = await submitAnswers(taskId, answers, locale);

      // Start polling for analysis result
      timeoutRef.current = setTimeout(() => {
        stopPolling();
        setAnalysisStatus('FAILURE');
        setQuizState('error');
      }, POLL_TIMEOUT);

      pollingRef.current = setInterval(async () => {
        try {
          const status = await getTaskStatus(response.task_id);
          setAnalysisStatus(status.status);

          if (status.status === 'SUCCESS') {
            stopPolling();
            sessionStorage.setItem(
              'ikigen_result',
              JSON.stringify(status.result)
            );
            // บังคับเปลี่ยนหน้าแบบทะลุยามไปเลย!
            const currentLocale = document.documentElement.lang || 'en';
            window.location.href = `/${currentLocale}/results`;
          } else if (status.status === 'FAILURE') {
            stopPolling();
            setQuizState('error');
          }
        } catch {
          // Don't stop on individual poll failures
        }
      }, POLL_INTERVAL);
    } catch {
      setQuizState('error');
      setAnalysisStatus('FAILURE');
    }
  }, [taskId, answers, router, stopPolling]);

  // Retry after error
  const handleRetry = useCallback(() => {
    stopPolling();
    setQuizState('quiz');
    setAnalysisStatus('PENDING');
  }, [stopPolling]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizState !== 'quiz') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizState, goNext, goPrevious]);

  // --- Render States ---

  // Still loading sessionStorage
  if (hasData === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="loading-dot w-3 h-3 rounded-full bg-sakura-400" />
      </main>
    );
  }

  // No quiz data found
  if (hasData === false) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <SakuraBackground variant="quiz" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 text-center max-w-md"
        >
          <p className="text-lg text-white/80 mb-4">{t('noQuizData')}</p>
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sakura-500 via-sakura-400 to-rose-400 text-white text-sm font-semibold"
          >
            {t('goBack')}
          </motion.button>
        </motion.div>
      </main>
    );
  }

  // Submitting / analyzing state
  if (quizState === 'submitting' || quizState === 'error') {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <SakuraBackground variant="quiz" />
        <LoadingScreen
          status={quizState === 'error' ? 'FAILURE' : analysisStatus}
          onRetry={quizState === 'error' ? handleRetry : undefined}
        />
      </main>
    );
  }

  // --- Main Quiz Interface ---
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id] || null;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8">
      <SakuraBackground variant="quiz" />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-5">
        <div className="absolute top-1/3 left-1/5 h-80 w-80 rounded-full bg-sakura-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/5 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent mb-6 pb-2 leading-relaxed"
      >
        {t('title')}
      </motion.h1>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl mb-8"
      >
        <ProgressBar
          current={currentIndex}
          total={questions.length}
          currentPillar={currentQuestion?.pillar}
        />
      </motion.div>

      {/* Question card with AnimatePresence for slide transitions */}
      <div className="w-full flex justify-center min-h-[400px] items-start">
        <AnimatePresence mode="wait" custom={direction}>
          {currentQuestion && (
            <QuizCard
              key={currentQuestion.id}
              question={currentQuestion}
              selectedAnswer={currentAnswer}
              onAnswer={handleAnswer}
              direction={direction}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 mt-8"
      >
        {/* Previous button */}
        <motion.button
          onClick={goPrevious}
          disabled={currentIndex === 0}
          whileHover={currentIndex > 0 ? { scale: 1.02 } : undefined}
          whileTap={currentIndex > 0 ? { scale: 0.98 } : undefined}
          className={`
            px-6 py-3 rounded-xl text-sm font-medium
            border border-white/10 transition-all duration-200
            ${currentIndex === 0
              ? 'opacity-30 cursor-not-allowed text-white/30'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
            }
          `}
        >
          {t('previous')}
        </motion.button>

        {/* Next / Submit button */}
        {isLastQuestion ? (
          <motion.button
            onClick={handleSubmit}
            disabled={!allAnswered}
            whileHover={allAnswered ? { scale: 1.02 } : undefined}
            whileTap={allAnswered ? { scale: 0.98 } : undefined}
            className={`
              px-8 py-3 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-sakura-500 via-sakura-400 to-rose-400
              transition-all duration-300
              ${allAnswered
                ? 'animate-pulse-glow'
                : 'opacity-40 cursor-not-allowed'
              }
            `}
          >
            {t('submit')}
          </motion.button>
        ) : (
          <motion.button
            onClick={goNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sakura-500 via-sakura-400 to-rose-400 transition-all duration-200"
          >
            {t('next')}
          </motion.button>
        )}
      </motion.div>

      {/* Answer completion indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xs text-white/30"
      >
        {t('answered', { count: answeredCount, total: questions.length })}
      </motion.p>
    </main>
  );
}
