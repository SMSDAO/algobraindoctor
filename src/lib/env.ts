/**
 * Runtime environment variable validation using Zod.
 * Validates all required/optional env vars at startup and provides
 * a typed, safe accessor throughout the application.
 */

import { z } from 'zod'

const envSchema = z.object({
  /** OpenAI API key for the prompt optimizer engine. */
  VITE_OPENAI_API_KEY: z.string().min(1).optional(),
  /** OpenAI model name, defaults to gpt-4o-mini for cost efficiency. */
  VITE_OPENAI_MODEL: z.string().default('gpt-4o-mini'),
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
  const raw =
    typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

  const result = envSchema.safeParse(raw)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    // Log to stderr; app can still start if all errors are on optional fields
    console.error(`[env] Environment validation warnings:\n${issues}`)
    // Return with defaults for optional fields
    return envSchema.parse({})
  }

  return result.data
}

/** Validated, typed environment configuration. */
export const env: Env = parseEnv()
