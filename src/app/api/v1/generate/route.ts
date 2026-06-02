/**
 * POST /api/v1/generate
 *
 * Accepts a user prompt, generates a personalized Ikigai quiz via Gemini,
 * stores the result in Upstash Redis, and returns a task_id for polling.
 *
 * Request:  { prompt: string, locale?: string }
 * Response: { task_id: string, status: string }
 *
 * The quiz generation happens synchronously within this serverless function
 * (replacing the old Celery async pattern). The frontend polls /api/v1/task/[id]
 * to check completion, but we mark the task as SUCCESS before returning.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/ai';
import { createTask, updateTask } from '@/lib/redis';

export const maxDuration = 60; // Vercel serverless timeout (seconds)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, locale = 'en' } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { message: 'A prompt is required.' },
        { status: 400 }
      );
    }

    if (prompt.length < 10) {
      return NextResponse.json(
        { message: 'Prompt must be at least 10 characters.' },
        { status: 400 }
      );
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { message: 'Prompt must be under 5000 characters.' },
        { status: 400 }
      );
    }

    // Generate a unique task ID
    const taskId = crypto.randomUUID();

    // Create task in Redis as PENDING
    await createTask(taskId);

    // Update to STARTED
    await updateTask(taskId, { status: 'STARTED' });

    try {
      // Call Gemini to generate quiz
      const quizData = await generateQuiz(prompt, locale);

      // Build the full result matching the frontend's expected shape
      const result = {
        session_id: taskId,
        questions: quizData.questions,
        total_questions: quizData.questions.length,
      };

      // Store SUCCESS result in Redis
      await updateTask(taskId, { status: 'SUCCESS', result });

      return NextResponse.json(
        { task_id: taskId, status: 'PENDING' },
        { status: 202 }
      );
    } catch (aiError) {
      // AI generation failed — store FAILURE in Redis
      const errorMessage =
        aiError instanceof Error ? aiError.message : 'Quiz generation failed.';

      await updateTask(taskId, {
        status: 'FAILURE',
        error: errorMessage,
      });

      return NextResponse.json(
        { task_id: taskId, status: 'PENDING' },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error('[/api/v1/generate] Unexpected error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
