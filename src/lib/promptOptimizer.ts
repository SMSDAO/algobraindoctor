/**
 * AI Prompt Optimizer Engine
 *
 * Transforms raw, unstructured prompts into optimised, structured prompts
 * using a template system with versioning metadata and deterministic formatting.
 */

import { validateAndSanitizePrompt } from './sanitize'
import { logger } from './logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PromptDomain =
  | 'code-review'
  | 'documentation'
  | 'debugging'
  | 'architecture'
  | 'security'
  | 'performance'
  | 'general'

export type PromptStyle = 'concise' | 'detailed' | 'step-by-step' | 'analytical'

export interface PromptOptimizerOptions {
  domain?: PromptDomain
  style?: PromptStyle
  maxOutputLength?: number
  includeExamples?: boolean
  language?: string
}

export interface OptimizedPrompt {
  /** Version of the optimizer that produced this output. */
  version: string
  /** ISO timestamp of when the optimization was performed. */
  optimizedAt: string
  /** Original sanitized input. */
  original: string
  /** The fully optimized, structured prompt. */
  optimized: string
  /** Domain classification used. */
  domain: PromptDomain
  /** Style applied. */
  style: PromptStyle
  /** Template key that was applied. */
  templateKey: string
  /** Estimated token count for the optimized prompt. */
  estimatedTokens: number
  /** Any warnings generated during optimization. */
  warnings: string[]
}

// ---------------------------------------------------------------------------
// Optimizer version
// ---------------------------------------------------------------------------

export const OPTIMIZER_VERSION = '1.0.0'

// ---------------------------------------------------------------------------
// Template system
// ---------------------------------------------------------------------------

interface PromptTemplate {
  key: string
  domain: PromptDomain
  style: PromptStyle
  systemContext: string
  structureGuide: string
  outputFormat: string
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    key: 'code-review-detailed',
    domain: 'code-review',
    style: 'detailed',
    systemContext:
      'You are an expert software engineer performing a thorough code review. Focus on correctness, security, performance, maintainability, and adherence to best practices.',
    structureGuide:
      'Structure your review with: 1) Summary of what the code does, 2) Critical issues (bugs, security), 3) Significant improvements, 4) Minor suggestions, 5) Positive observations.',
    outputFormat:
      'Use markdown with clear section headers. Rate severity as CRITICAL/HIGH/MED/LOW. Include specific line references where applicable.',
  },
  {
    key: 'code-review-concise',
    domain: 'code-review',
    style: 'concise',
    systemContext: 'You are a senior developer doing a quick code review pass.',
    structureGuide: 'Identify: blocking issues, key improvements, and one positive observation.',
    outputFormat: 'Bullet points only. Max 10 items. Mark blockers with ❌, improvements with ⚠️, positives with ✅.',
  },
  {
    key: 'debugging-step-by-step',
    domain: 'debugging',
    style: 'step-by-step',
    systemContext:
      'You are a systematic debugger. Diagnose and resolve issues methodically using root cause analysis.',
    structureGuide:
      'Follow: 1) Reproduce the issue, 2) Isolate the root cause, 3) Propose fixes ranked by likelihood, 4) Verify solution, 5) Prevent recurrence.',
    outputFormat:
      'Number each step clearly. Include code snippets for each fix. Explain the root cause before proposing solutions.',
  },
  {
    key: 'architecture-analytical',
    domain: 'architecture',
    style: 'analytical',
    systemContext:
      'You are a principal engineer evaluating system architecture for scalability, reliability, and maintainability.',
    structureGuide:
      'Analyse: 1) Current state assessment, 2) Scalability vectors, 3) Single points of failure, 4) Data flow analysis, 5) Recommended architectural changes with trade-offs.',
    outputFormat:
      'Use architecture decision record (ADR) format. Include diagrams in ASCII or mermaid where helpful. Quantify trade-offs where possible.',
  },
  {
    key: 'security-detailed',
    domain: 'security',
    style: 'detailed',
    systemContext:
      'You are a security engineer performing a threat model and vulnerability assessment.',
    structureGuide:
      'Cover: 1) Attack surface analysis, 2) OWASP Top 10 applicability, 3) Authentication/authorization gaps, 4) Data exposure risks, 5) Recommended mitigations with priority.',
    outputFormat:
      'Use CVSS-like severity ratings. Include CVE references where relevant. Prioritise by exploitability and impact.',
  },
  {
    key: 'performance-analytical',
    domain: 'performance',
    style: 'analytical',
    systemContext:
      'You are a performance engineer identifying bottlenecks and optimisation opportunities.',
    structureGuide:
      'Analyse: 1) Current performance characteristics, 2) Identified bottlenecks, 3) Profiling approach, 4) Optimisation strategies, 5) Expected impact of each change.',
    outputFormat:
      'Include Big-O complexity where relevant. Provide before/after estimates. Use tables for comparing optimisation options.',
  },
  {
    key: 'documentation-detailed',
    domain: 'documentation',
    style: 'detailed',
    systemContext: 'You are a technical writer creating clear, comprehensive documentation.',
    structureGuide:
      'Structure: 1) Overview and purpose, 2) Prerequisites, 3) Core concepts, 4) Step-by-step guide, 5) API/parameter reference, 6) Examples, 7) Troubleshooting.',
    outputFormat:
      'Use markdown. Include code examples in fenced blocks with language tags. Add a quick-start section at the top.',
  },
  {
    key: 'general-concise',
    domain: 'general',
    style: 'concise',
    systemContext: 'You are a knowledgeable assistant providing clear, direct responses.',
    structureGuide: 'Answer directly, provide context, then give actionable next steps.',
    outputFormat: 'Use plain language. Avoid jargon unless necessary. Keep response focused.',
  },
  {
    key: 'general-detailed',
    domain: 'general',
    style: 'detailed',
    systemContext: 'You are a knowledgeable expert providing thorough, well-structured responses.',
    structureGuide: 'Cover: background context, detailed explanation, examples, and next steps.',
    outputFormat: 'Use markdown with headers. Include examples and edge cases.',
  },
]

function selectTemplate(domain: PromptDomain, style: PromptStyle): PromptTemplate {
  const match = PROMPT_TEMPLATES.find((t) => t.domain === domain && t.style === style)
  if (match) return match

  // Fall back to same domain with any style
  const domainMatch = PROMPT_TEMPLATES.find((t) => t.domain === domain)
  if (domainMatch) return domainMatch

  // Ultimate fallback
  return PROMPT_TEMPLATES.find((t) => t.key === 'general-detailed')!
}

// ---------------------------------------------------------------------------
// Token estimation (rough approximation: ~4 chars per token)
// ---------------------------------------------------------------------------

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// ---------------------------------------------------------------------------
// Domain auto-detection
// ---------------------------------------------------------------------------

const DOMAIN_KEYWORDS: Record<PromptDomain, string[]> = {
  'code-review': ['review', 'code', 'pr', 'pull request', 'function', 'class', 'method', 'diff'],
  debugging: ['bug', 'error', 'exception', 'crash', 'fix', 'debug', 'issue', 'problem', 'broken'],
  architecture: ['architecture', 'design', 'system', 'scalab', 'microservice', 'monolith', 'pattern'],
  security: ['security', 'vulnerabil', 'auth', 'injection', 'xss', 'csrf', 'owasp', 'exploit'],
  performance: ['performance', 'slow', 'latency', 'throughput', 'optimiz', 'bottleneck', 'memory'],
  documentation: ['document', 'readme', 'api doc', 'comment', 'explain', 'how to', 'guide'],
  general: [],
}

function detectDomain(text: string): PromptDomain {
  const lower = text.toLowerCase()
  const scores: Partial<Record<PromptDomain, number>> = {}

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS) as [PromptDomain, string[]][]) {
    if (domain === 'general') continue
    scores[domain] = keywords.filter((kw) => lower.includes(kw)).length
  }

  const best = Object.entries(scores).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]
  if (best && (best[1] ?? 0) > 0) return best[0] as PromptDomain
  return 'general'
}

// ---------------------------------------------------------------------------
// Core optimizer function
// ---------------------------------------------------------------------------

/**
 * Optimize a raw user prompt into a structured, context-enriched prompt.
 *
 * This function:
 * 1. Sanitizes and validates the input
 * 2. Detects the appropriate domain if not specified
 * 3. Applies the matching template
 * 4. Structures the output with system context, instructions, and format guidance
 * 5. Returns versioned metadata alongside the optimized prompt
 */
export function optimizePrompt(
  rawPrompt: string,
  options: PromptOptimizerOptions = {},
): OptimizedPrompt {
  const {
    style = 'detailed',
    maxOutputLength = 3000,
    includeExamples = false,
    language = 'English',
  } = options

  const warnings: string[] = []

  // Sanitize and validate
  const { sanitized, piiDetected, truncated } = validateAndSanitizePrompt(rawPrompt, {
    stripPii: false,
    maxLength: maxOutputLength,
  })

  if (piiDetected) {
    warnings.push('Potential PII detected in prompt. Review before submitting to external services.')
  }
  if (truncated) {
    warnings.push(`Prompt was truncated to ${maxOutputLength} characters.`)
  }

  // Detect domain
  const domain = options.domain ?? detectDomain(sanitized)

  // Select template
  const template = selectTemplate(domain, style)

  // Build optimized prompt
  const parts: string[] = [
    `## System Context`,
    template.systemContext,
    ``,
    `## Task`,
    sanitized,
    ``,
    `## Instructions`,
    template.structureGuide,
    ``,
    `## Output Format`,
    template.outputFormat,
  ]

  if (includeExamples) {
    parts.push(``, `## Note`, `Provide concrete, realistic examples where applicable.`)
  }

  if (language !== 'English') {
    parts.push(``, `## Language`, `Respond in ${language}.`)
  }

  const optimized = parts.join('\n')

  logger.info('Prompt optimized', {
    domain,
    style: template.style,
    templateKey: template.key,
    originalLength: sanitized.length,
    optimizedLength: optimized.length,
    estimatedTokens: estimateTokens(optimized),
  })

  return {
    version: OPTIMIZER_VERSION,
    optimizedAt: new Date().toISOString(),
    original: sanitized,
    optimized,
    domain,
    // Report the style from the template that was actually used. When the
    // requested style has no matching template for the domain, selectTemplate()
    // falls back to a different style — the returned value reflects reality.
    style: template.style,
    templateKey: template.key,
    estimatedTokens: estimateTokens(optimized),
    warnings,
  }
}

/**
 * Re-export templates for external tooling/testing.
 */
export { PROMPT_TEMPLATES }
export type { PromptTemplate }
