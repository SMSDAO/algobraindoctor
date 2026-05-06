/**
 * AI service client with retry, timeout, fallback handling,
 * and token usage logging hooks.
 *
 * ⚠️  SECURITY NOTE — client-side API keys
 * ─────────────────────────────────────────
 * This module runs in the browser. `VITE_*` variables are embedded into
 * the production bundle at build time and are visible to every end-user.
 * Do NOT put a real OpenAI API key in `VITE_OPENAI_API_KEY` unless the
 * application is deployed in a controlled environment where only trusted
 * users can access the bundle (e.g. an internal tool behind auth).
 *
 * Recommended approach for public deployments:
 * 1. Set `VITE_OPENAI_PROXY_URL` to a URL you control (e.g. /api/ai).
 * 2. Have that server-side route add the real API key from a secure
 *    secret store and forward the request to OpenAI.
 * 3. Leave `VITE_OPENAI_API_KEY` empty — the client will route through
 *    the proxy without ever touching the raw key.
 */

import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CompletionRequest {
  messages: ChatMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
  /** Abort signal for cancellation. */
  signal?: AbortSignal
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface CompletionResponse {
  content: string
  usage: TokenUsage
  model: string
  durationMs: number
}

// ---------------------------------------------------------------------------
// Retry configuration
// ---------------------------------------------------------------------------

const DEFAULT_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 1000
const REQUEST_TIMEOUT_MS = 30_000

/** HTTP status codes that are worth retrying. */
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function exponentialBackoff(attempt: number, base = INITIAL_RETRY_DELAY_MS): number {
  // Exponential with jitter: base * 2^attempt + random(0..base)
  return base * Math.pow(2, attempt) + Math.random() * base
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

interface OpenAIErrorBody {
  error?: { message?: string; code?: string }
}

// Warn only once per module load (not on every request) to avoid console spam.
let _directKeyWarned = false

async function fetchCompletion(
  request: CompletionRequest,
  attempt: number,
): Promise<CompletionResponse> {
  const proxyUrl = env.VITE_OPENAI_PROXY_URL
  const apiKey = env.VITE_OPENAI_API_KEY

  if (!proxyUrl && !apiKey) {
    throw new Error(
      'AI is not configured. Set VITE_OPENAI_PROXY_URL (recommended) or VITE_OPENAI_API_KEY.',
    )
  }

  if (!proxyUrl && apiKey && !_directKeyWarned) {
    _directKeyWarned = true
    console.warn(
      '[ai] VITE_OPENAI_API_KEY is set in the browser bundle. ' +
        'This key is visible to end-users. Use VITE_OPENAI_PROXY_URL for public deployments.',
    )
  }

  const model = request.model ?? env.VITE_OPENAI_MODEL
  const maxTokens = request.maxTokens ?? env.VITE_OPENAI_MAX_TOKENS
  const url = proxyUrl ?? `${env.VITE_OPENAI_BASE_URL}/chat/completions`

  // Single AbortController handles both the 30 s timeout and any caller-provided signal.
  // We track whether the timeout fired so we can emit a distinct error message from
  // a caller-initiated cancellation.
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  if (request.signal) {
    request.signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  const startedAt = Date.now()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  // Only add Authorization when going directly to OpenAI (not via proxy)
  if (!proxyUrl && apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: request.messages,
        max_tokens: maxTokens,
        temperature: request.temperature ?? 0.7,
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as OpenAIErrorBody
      const message = body.error?.message ?? `HTTP ${response.status}`

      if (RETRYABLE_STATUS_CODES.has(response.status)) {
        const err = new RetryableError(message, response.status)
        logger.warn('AI request failed, will retry', { attempt, status: response.status, message })
        throw err
      }

      throw new Error(`AI API error: ${message} (status ${response.status})`)
    }

    interface OpenAIResponse {
      model: string
      choices: Array<{ message: { content: string } }>
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
    }

    const data = (await response.json()) as OpenAIResponse
    const content = data.choices?.[0]?.message?.content ?? ''
    const usage: TokenUsage = {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    }

    const durationMs = Date.now() - startedAt

    logger.info('AI request completed', {
      model: data.model,
      durationMs,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
    })

    return { content, usage, model: data.model, durationMs }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof RetryableError) throw err

    if (err instanceof Error && err.name === 'AbortError') {
      if (timedOut) {
        throw new Error(`AI request timed out after ${REQUEST_TIMEOUT_MS}ms`)
      }
      throw new Error('AI request was cancelled')
    }

    throw err
  }
}

class RetryableError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'RetryableError'
  }
}

// ---------------------------------------------------------------------------
// Public interface with retry + fallback
// ---------------------------------------------------------------------------

/**
 * Send a chat completion request with automatic retry and timeout handling.
 *
 * @param request - The completion request parameters.
 * @param retries - Maximum number of retry attempts (default: 3).
 * @returns Completion response with usage metrics.
 */
export async function createCompletion(
  request: CompletionRequest,
  retries = DEFAULT_RETRIES,
): Promise<CompletionResponse> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchCompletion(request, attempt)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (!(err instanceof RetryableError) || attempt === retries) {
        break
      }

      const delayMs = exponentialBackoff(attempt)
      logger.warn('Retrying AI request', { attempt: attempt + 1, delayMs })
      await sleep(delayMs)
    }
  }

  throw lastError ?? new Error('AI request failed after all retries')
}

/**
 * Create a completion with a fallback value if the API is unavailable.
 * Useful for graceful degradation when the AI service is down.
 */
export async function createCompletionWithFallback(
  request: CompletionRequest,
  fallback: string,
): Promise<CompletionResponse> {
  try {
    return await createCompletion(request)
  } catch (err) {
    logger.error('AI request failed, using fallback response', err)
    return {
      content: fallback,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: 'fallback',
      durationMs: 0,
    }
  }
}

/**
 * Check whether the AI service is configured and accessible.
 * Returns true if VITE_OPENAI_PROXY_URL or VITE_OPENAI_API_KEY is set;
 * does NOT make a network call.
 */
export function isAiConfigured(): boolean {
  return Boolean(env.VITE_OPENAI_PROXY_URL ?? env.VITE_OPENAI_API_KEY)
}
