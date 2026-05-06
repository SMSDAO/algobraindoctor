/**
 * Structured logger utility compatible with browser environments.
 * Outputs JSON-structured log entries suitable for log aggregation pipelines.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: string
  stack?: string
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, error?: unknown, context?: Record<string, unknown>): void
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function getMinLevel(): LogLevel {
  const level =
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_LOG_LEVEL as LogLevel | undefined)
      : undefined
  return level && level in LOG_LEVELS ? level : 'info'
}

function serialize(entry: LogEntry): string {
  return JSON.stringify(entry)
}

function buildEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: unknown,
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }
  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }
  if (error instanceof Error) {
    entry.error = error.message
    if (error.stack) {
      entry.stack = error.stack
    }
  } else if (error !== undefined && error !== null) {
    entry.error = String(error)
  }
  return entry
}

function emit(entry: LogEntry): void {
  const minLevel = getMinLevel()
  if (LOG_LEVELS[entry.level] < LOG_LEVELS[minLevel]) return

  const serialized = serialize(entry)

  switch (entry.level) {
    case 'debug':
      console.debug(serialized)
      break
    case 'info':
      console.info(serialized)
      break
    case 'warn':
      console.warn(serialized)
      break
    case 'error':
      console.error(serialized)
      break
  }
}

function createLogger(namespace?: string): Logger {
  const ns = namespace ? { ns: namespace } : {}

  return {
    debug(message, context) {
      emit(buildEntry('debug', message, { ...ns, ...context }))
    },
    info(message, context) {
      emit(buildEntry('info', message, { ...ns, ...context }))
    },
    warn(message, context) {
      emit(buildEntry('warn', message, { ...ns, ...context }))
    },
    error(message, error, context) {
      emit(buildEntry('error', message, { ...ns, ...context }, error))
    },
  }
}

/** Root application logger. */
export const logger = createLogger('app')

/** Create a namespaced child logger. */
export { createLogger }
