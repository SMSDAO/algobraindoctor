/**
 * Input sanitization utilities for AI prompt inputs.
 * Prevents prompt injection, unsafe amplification, and PII leakage.
 */

/** Maximum allowed prompt length in characters. */
export const MAX_PROMPT_LENGTH = 4000

/** Patterns that indicate potential prompt injection attempts. */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /you\s+are\s+now\s+(a\s+)?(?:different|new|another|evil|jailbroken)/i,
  /act\s+as\s+(if\s+you\s+are\s+|a\s+)?(?:dan|evil|unrestricted|jailbroken)/i,
  /\bdo\s+anything\s+now\b/i,
  /\bjailbreak\b/i,
  /system\s*prompt\s*[:=]/i,
  /<\s*\/?(?:system|assistant|user|prompt|instruction)\s*>/i,
  /\[INST\]|\[\/INST\]/,
  /###\s*(?:instruction|system|human|assistant)/i,
]

/** Patterns for common PII that should be flagged or removed. */
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[EMAIL]' },
  { pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[PHONE]' },
  {
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g,
    replacement: '[CARD]',
  },
  {
    pattern: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
    replacement: '[UUID]',
  },
]

export interface SanitizeResult {
  sanitized: string
  injectionDetected: boolean
  piiDetected: boolean
  truncated: boolean
  original: string
}

/**
 * Sanitize a raw user prompt before sending it to an AI model.
 * - Detects and rejects prompt injection attempts
 * - Optionally strips PII patterns
 * - Enforces maximum length
 * - Normalises whitespace
 */
export function sanitizePrompt(
  input: string,
  options: { stripPii?: boolean; maxLength?: number } = {},
): SanitizeResult {
  const { stripPii = false, maxLength = MAX_PROMPT_LENGTH } = options

  const original = input
  let sanitized = input.trim()
  let injectionDetected = false
  let piiDetected = false
  let truncated = false

  // Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      injectionDetected = true
      break
    }
  }

  // Strip PII if requested
  // Note: global regexes are stateful — reset lastIndex before each use.
  if (stripPii) {
    for (const { pattern, replacement } of PII_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(sanitized)) {
        piiDetected = true
        pattern.lastIndex = 0
        sanitized = sanitized.replace(pattern, replacement)
      }
    }
  } else {
    // Only detect, don't strip
    for (const { pattern } of PII_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(sanitized)) {
        piiDetected = true
        break
      }
    }
  }

  // Collapse runs of 3+ consecutive newlines to two (blank line), but leave
  // spaces and tabs untouched so that code snippets and indented content are
  // preserved exactly.
  sanitized = sanitized.replace(/(\r?\n){3,}/g, '\n\n').trim()

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength).trimEnd()
    truncated = true
  }

  return { sanitized, injectionDetected, piiDetected, truncated, original }
}

/**
 * Validate that a prompt is safe to send to an AI model.
 * Throws if injection is detected; returns sanitized result otherwise.
 */
export function validateAndSanitizePrompt(
  input: string,
  options: { stripPii?: boolean; maxLength?: number } = {},
): SanitizeResult {
  if (!input || typeof input !== 'string') {
    throw new Error('Prompt must be a non-empty string')
  }

  const result = sanitizePrompt(input, options)

  if (result.injectionDetected) {
    throw new Error('Prompt injection attempt detected. Please rephrase your request.')
  }

  // Reject whitespace-only inputs that sanitize down to an empty string.
  if (result.sanitized.length === 0) {
    throw new Error('Prompt must be a non-empty string')
  }

  return result
}
