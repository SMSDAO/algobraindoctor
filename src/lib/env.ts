/**
 * Runtime environment variable validation using Zod.
 * Validates all required/optional env vars at startup and provides
 * a typed, safe accessor throughout the application.
 */

import { z } from 'zod'

const envSchema = z.object({
  /** OpenAI API key for the prompt optimizer engine. */
  VITE_OPENAI_API_KEY: z.string().min(1).optional(),
  /**
   * URL of a server-side AI proxy (recommended for public deployments).
   * When set, AI requests are routed here without exposing the API key
   * in the browser bundle. The proxy is responsible for adding auth headers.
   */
  VITE_OPENAI_PROXY_URL: z.string().url().optional(),
  /** OpenAI model name, defaults to gpt-4o-mini for cost efficiency. */
  VITE_OPENAI_MODEL: z
    .string()
    .transform((v) => (v.trim() === '' ? undefined : v))
    .pipe(z.string().min(1).default('gpt-4o-mini')),
  /** OpenAI API base URL – override to use compatible proxies. */
  VITE_OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  /** Max tokens returned per prompt optimization request. */
  VITE_OPENAI_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  /** Log level for the structured logger. */
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  /** Application version injected at build time. */
  VITE_APP_VERSION: z.string().default('0.0.0'),
  /** Sentry DSN for error tracking (optional). */
  VITE_SENTRY_DSN: z.string().url().optional(),
  /** WalletConnect project ID for Web3 wallet integration (optional). */
  VITE_WALLETCONNECT_PROJECT_ID: z.string().optional(),
  /** Firebase config JSON string (optional, for future DB layer). */
  VITE_FIREBASE_CONFIG: z.string().optional(),
  /** Disable rate limiting in development mode. */
  VITE_DISABLE_RATE_LIMIT: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
})

export type Env = z.infer<typeof envSchema>

function parseEnv(): Env {
  const raw: Record<string, unknown> =
    typeof import.meta !== 'undefined' && import.meta.env
      ? { ...(import.meta.env as Record<string, unknown>) }
      : {}

  const result = envSchema.safeParse(raw)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    console.error(`[env] Environment validation warnings:\n${issues}`)

    // Preserve all valid fields; only drop the keys that failed validation so
    // that unrelated correct settings (e.g. VITE_OPENAI_BASE_URL) are not
    // silently reset to defaults.
    const failedKeys = new Set(
      result.error.issues
        .map((i) => i.path[0])
        .filter((p): p is string => typeof p === 'string'),
    )
    const sanitizedRaw: Record<string, unknown> = Object.fromEntries(
      Object.entries(raw).filter(([key]) => !failedKeys.has(key)),
    )
    return envSchema.parse(sanitizedRaw)
  }

  return result.data
}

/** Validated, typed environment configuration. */
export const env: Env = parseEnv()
