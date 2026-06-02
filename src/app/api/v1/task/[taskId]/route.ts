/**
 * GET /api/v1/task/[taskId]
 *
 * Poll the status of an asynchronous task (quiz generation or analysis).
 * Returns the task state from Upstash Redis.
 *
 * Response: {
 *   task_id: string,
 *   status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE',
 *   result?: any,      // Present when status === 'SUCCESS'
 *   error?: string      // Present when status === 'FAILURE'
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTask } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // Validate task ID
    if (!taskId || taskId.length > 100 || !taskId.trim()) {
      return NextResponse.json(
        { message: 'Invalid task ID format.' },
        { status: 400 }
      );
    }

    // Fetch task state from Redis
    const task = await getTask(taskId);

    if (!task) {
      // Task not found — could be expired or never existed.
      // Return PENDING to allow the frontend polling to gracefully timeout
      // rather than hard-crashing on a 404.
      return NextResponse.json({
        task_id: taskId,
        status: 'PENDING' as const,
      });
    }

    // Build response matching TaskStatusResponse interface
    const response: {
      task_id: string;
      status: string;
      result?: unknown;
      error?: string;
    } = {
      task_id: task.task_id,
      status: task.status,
    };

    if (task.status === 'SUCCESS' && task.result) {
      response.result = task.result;
    }

    if (task.status === 'FAILURE' && task.error) {
      response.error = task.error;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[/api/v1/task] Unexpected error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
