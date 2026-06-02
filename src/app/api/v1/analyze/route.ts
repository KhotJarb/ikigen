/**
 * POST /api/v1/analyze
 *
 * Accepts a task_id (from the generate step) and the user's quiz answers.
 * Retrieves the original quiz from Redis, calls Gemini for Ikigai analysis,
 * stores the result in Redis under a NEW task_id, and returns it for polling.
 *
 * Request:  { task_id: string, answers: Record<string, string>, locale?: string }
 * Response: { task_id: string, status: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeIkigai } from '@/lib/ai';
import { getTask, createTask, updateTask } from '@/lib/redis';
import type { GeneratedQuizData } from '@/lib/ai';

export const maxDuration = 60; // Vercel serverless timeout (seconds)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id: originalTaskId, answers, locale = 'en' } = body;

    // Validate input
    if (!originalTaskId || typeof originalTaskId !== 'string') {
      return NextResponse.json(
        { message: 'A valid task_id is required.' },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { message: 'Answers are required.' },
        { status: 400 }
      );
    }

    // Fetch the original quiz generation task from Redis
    const originalTask = await getTask(originalTaskId);

    if (!originalTask) {
      return NextResponse.json(
        { message: 'Original quiz task not found. It may have expired.' },
        { status: 404 }
      );
    }

    if (originalTask.status !== 'SUCCESS') {
      return NextResponse.json(
        {
          message: `Original quiz task has not completed successfully. Current state: ${originalTask.status}.`,
        },
        { status: 400 }
      );
    }

    // Extract quiz data from the original task result
    const quizResult = originalTask.result as {
      session_id: string;
      questions: GeneratedQuizData['questions'];
      total_questions: number;
    };

    if (!quizResult?.questions) {
      return NextResponse.json(
        { message: 'Quiz data not found in the original task. It may have expired.' },
        { status: 404 }
      );
    }

    const quizData: GeneratedQuizData = {
      questions: quizResult.questions,
    };

    // Create a NEW task for the analysis
    const analysisTaskId = crypto.randomUUID();
    await createTask(analysisTaskId);
    await updateTask(analysisTaskId, { status: 'STARTED' });

    try {
      // Call Gemini for Ikigai analysis
      const analysisResult = await analyzeIkigai(quizData, answers, locale);

      // Store SUCCESS result in Redis
      await updateTask(analysisTaskId, {
        status: 'SUCCESS',
        result: analysisResult,
      });

      return NextResponse.json(
        { task_id: analysisTaskId, status: 'PENDING' },
        { status: 202 }
      );
    } catch (aiError) {
      // AI analysis failed — store FAILURE
      const errorMessage =
        aiError instanceof Error ? aiError.message : 'Ikigai analysis failed.';

      await updateTask(analysisTaskId, {
        status: 'FAILURE',
        error: errorMessage,
      });

      return NextResponse.json(
        { task_id: analysisTaskId, status: 'PENDING' },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error('[/api/v1/analyze] Unexpected error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
