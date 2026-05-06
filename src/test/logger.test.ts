import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createLogger, logger } from '../lib/logger'

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('root logger', () => {
    it('should export a logger instance', () => {
      expect(logger).toBeDefined()
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.debug).toBe('function')
    })

    it('should call console.info for info level', () => {
      logger.info('test message')
      expect(console.info).toHaveBeenCalledTimes(1)
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.level).toBe('info')
      expect(parsed.message).toBe('test message')
      expect(parsed.timestamp).toBeDefined()
    })

    it('should call console.warn for warn level', () => {
      logger.warn('warning message')
      expect(console.warn).toHaveBeenCalledTimes(1)
      const call = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.level).toBe('warn')
    })

    it('should call console.error for error level', () => {
      logger.error('error message')
      expect(console.error).toHaveBeenCalledTimes(1)
      const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.level).toBe('error')
    })

    it('should include context in log entry', () => {
      logger.info('with context', { userId: 'user-1', action: 'test' })
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.context).toMatchObject({ userId: 'user-1', action: 'test' })
    })

    it('should include error message when Error is passed', () => {
      const err = new Error('Something went wrong')
      logger.error('caught error', err)
      const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.error).toBe('Something went wrong')
      expect(parsed.stack).toContain('Error: Something went wrong')
    })

    it('should include error as string when non-Error is passed', () => {
      logger.error('caught string error', 'plain string error')
      const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.error).toBe('plain string error')
    })

    it('should produce valid ISO timestamps', () => {
      logger.info('timestamp test')
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(() => new Date(parsed.timestamp)).not.toThrow()
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp)
    })
  })

  describe('createLogger (namespaced)', () => {
    it('should include namespace in context', () => {
      const ns = createLogger('my-service')
      ns.info('namespaced message')
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.context?.ns).toBe('my-service')
    })

    it('should merge namespace with provided context', () => {
      const ns = createLogger('auth')
      ns.info('login event', { userId: 'u1' })
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(call)
      expect(parsed.context?.ns).toBe('auth')
      expect(parsed.context?.userId).toBe('u1')
    })
  })
})
