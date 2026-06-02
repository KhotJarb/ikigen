'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SakuraBackground from '@/components/SakuraBackground';
import LandingInput from '@/components/LandingInput';
import LoadingScreen from '@/components/LoadingScreen';
import { submitPrompt, getTaskStatus } from '@/lib/api';
import type { GeneratedQuiz } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Polling interval in milliseconds */
const POLL_INTERVAL = 5000;
/** Maximum polling duration before timeout (ms) */
const POLL_TIMEOUT = 120_000;

type PageState = 'input' | 'loading' | 'error';
type TaskStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';

export default function LandingPage() {
  const t = useTranslations('landing');
  const router = useRouter();
  const locale = useLocale();

  const [pageState, setPageState] = useState<PageState>('input');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('PENDING');
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for polling cleanup
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup polling on unmount
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

  const startPolling = useCallback(
    (taskId: string) => {
      setPageState('loading');
      setTaskStatus('PENDING');

      // Set timeout for max polling duration
      timeoutRef.current = setTimeout(() => {
        stopPolling();
        setTaskStatus('FAILURE');
        setErrorMessage('The request timed out. Please try again.');
        setPageState('error');
      }, POLL_TIMEOUT);

      // Start polling
      pollingRef.current = setInterval(async () => {
        try {
          const status = await getTaskStatus(taskId);
          setTaskStatus(status.status);

          if (status.status === 'SUCCESS') {
            stopPolling();
            // Store quiz data in sessionStorage for the quiz page
            sessionStorage.setItem('ikigen_quiz', JSON.stringify(status.result));
            sessionStorage.setItem('ikigen_task_id', taskId);
            // Navigate to quiz page
            const currentLocale = document.documentElement.lang || 'en';
            window.location.href = `/${currentLocale}/quiz`;
          } else if (status.status === 'FAILURE') {
            stopPolling();
            setErrorMessage(status.error || 'An error occurred. Please try again.');
            setPageState('error');
          }
        } catch (err) {
          console.error('Polling error:', err);
          // Don't stop on individual poll failures — retry next interval
        }
      }, POLL_INTERVAL);
    },
    [router, stopPolling]
  );

  const handleSubmit = useCallback(
    async (prompt: string) => {
      try {
        setPageState('loading');
        setTaskStatus('PENDING');
        setErrorMessage('');

        const response = await submitPrompt(prompt);
        startPolling(response.task_id);
      } catch (err) {
        console.error('Submit error:', err);
        setErrorMessage('Failed to connect to the server. Please try again.');
        setPageState('error');
        setTaskStatus('FAILURE');
      }
    },
    [startPolling]
  );

  const handleRetry = useCallback(() => {
    stopPolling();
    setPageState('input');
    setTaskStatus('PENDING');
    setErrorMessage('');
  }, [stopPolling]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Sakura particle background with Twilight in Kyoto gradient */}
      <SakuraBackground variant="landing" />

      {/* Refined ambient glow — positioned away from text for readability */}
      <div className="pointer-events-none fixed inset-0 -z-5">
        {/* Top-left subtle warm glow */}
        <div className="absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-pink-600/[0.04] blur-[120px]" />
        {/* Bottom-right cool glow */}
        <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* Input State */}
        {pageState === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center px-4 w-full"
          >
            {/* Logo / Title Section */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center mb-8"
            >
              {/* Decorative kanji — subtle watermark */}
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.05, scale: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="text-7xl md:text-9xl font-light tracking-widest text-pink-100 select-none mb-4 leading-normal"
              >
                生き甲斐
              </motion.p>

              {/* Main title — vibrant gradient with strong contrast */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent mb-4 pb-2 leading-relaxed drop-shadow-sm"
              >
                {t('title')}
              </motion.h1>

              {/* Subtitle — high contrast on dark background */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="text-lg md:text-xl text-slate-100 font-medium tracking-wide"
              >
                {t('subtitle')}
              </motion.p>

              {/* Description — readable slate-300 with proper line height */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="text-sm md:text-base text-slate-300 max-w-lg mx-auto mt-3 leading-relaxed"
              >
                {t('description')}
              </motion.p>
            </motion.div>

            {/* Input Component */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              className="w-full max-w-2xl"
            >
              <LandingInput onSubmit={handleSubmit} isLoading={false} />
            </motion.div>

            {/* Footer attribution */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              className="mt-12 text-xs text-slate-400 tracking-wider"
            >
              {t('poweredBy')}
            </motion.p>
          </motion.div>
        )}

        {/* Loading State */}
        {pageState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <LoadingScreen status={taskStatus} />
          </motion.div>
        )}

        {/* Error State */}
        {pageState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <LoadingScreen status="FAILURE" onRetry={handleRetry} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
