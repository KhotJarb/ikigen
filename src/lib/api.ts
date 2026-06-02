/**
 * IkiGen API Client
 *
 * Handles all frontend-to-backend communication with:
 * - Configurable base URL via NEXT_PUBLIC_API_URL
 * - Request timeouts (10s default)
 * - Automatic retry on transient network errors (1 retry)
 * - Typed request/response interfaces
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Default request timeout (ms) */
const REQUEST_TIMEOUT = 10_000;

/** Max retries for transient errors */
const MAX_RETRIES = 1;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskResponse {
  task_id: string;
  status: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  result?: any;
  error?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fetch with timeout using AbortController.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Determine if an error is transient and worth retrying.
 */
function isRetryable(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof TypeError) return true; // Network error
  return false;
}

/**
 * Wrapper with retry logic for transient failures.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options);

      // Don't retry on client errors (4xx) — only on server errors (5xx)
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }

      // Server error — retry
      lastError = new Error(`Server Error: ${res.status}`);
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === retries) break;
    }

    // Wait before retry (exponential: 500ms, 1000ms)
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Submit user prompt to generate a personalized quiz.
 * Passes the current locale for AI-generated content language.
 */
export async function submitPrompt(
  prompt: string,
  locale?: string
): Promise<TaskResponse> {
  const effectiveLocale = locale || document.documentElement.lang || 'en';

  const res = await fetchWithRetry(`${API_BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, locale: effectiveLocale }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `API Error: ${res.status}`);
  }

  return res.json();
}

/**
 * Poll the task status.
 * Uses shorter timeout since this is called frequently.
 */
export async function getTaskStatus(
  taskId: string
): Promise<TaskStatusResponse> {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/api/v1/task/${taskId}`,
    {},
    8_000 // Shorter timeout for polling
  );

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

/**
 * Submit quiz answers for Ikigai analysis.
 * Passes the current locale for AI-generated content language.
 */
export async function submitAnswers(
  taskId: string,
  answers: Record<string, string>,
  locale?: string
): Promise<TaskResponse> {
  const effectiveLocale = locale || document.documentElement.lang || 'en';

  const res = await fetchWithRetry(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_id: taskId,
      answers,
      locale: effectiveLocale,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `API Error: ${res.status}`);
  }

  return res.json();
}
