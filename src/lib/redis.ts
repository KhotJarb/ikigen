/**
 * Redis Client — Upstash REST-based Redis
 *
 * Uses @upstash/redis which works in serverless environments
 * (no TCP connections, uses HTTP REST API).
 *
 * Task data is stored with a 1-hour TTL to avoid stale data buildup.
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables.'
      );
    }

    redis = new Redis({ url, token });
  }

  return redis;
}

// ---------------------------------------------------------------------------
// Task State Management
// ---------------------------------------------------------------------------

export type TaskStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';

export interface TaskState {
  task_id: string;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  created_at: number;
}

/** TTL for task data in seconds (1 hour) */
const TASK_TTL = 3600;

function taskKey(taskId: string): string {
  return `ikigen:task:${taskId}`;
}

export async function createTask(taskId: string): Promise<void> {
  const state: TaskState = {
    task_id: taskId,
    status: 'PENDING',
    created_at: Date.now(),
  };
  await getRedis().set(taskKey(taskId), JSON.stringify(state), { ex: TASK_TTL });
}

export async function updateTask(
  taskId: string,
  update: Partial<Pick<TaskState, 'status' | 'result' | 'error'>>
): Promise<void> {
  const raw = await getRedis().get<string>(taskKey(taskId));
  if (!raw) {
    throw new Error(`Task ${taskId} not found in Redis.`);
  }

  const state: TaskState = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const updated: TaskState = { ...state, ...update };

  await getRedis().set(taskKey(taskId), JSON.stringify(updated), { ex: TASK_TTL });
}

export async function getTask(taskId: string): Promise<TaskState | null> {
  const raw = await getRedis().get<string>(taskKey(taskId));
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}
