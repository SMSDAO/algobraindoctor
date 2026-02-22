import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const condition = false
    expect(cn('foo', condition && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge tailwind classes without duplicates', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should merge complex tailwind classes', () => {
    const result = cn(
      'rounded-lg border border-violet-500/30',
      'bg-gray-900/50 p-6',
      'shadow-lg shadow-violet-500/20'
    )
    expect(result).toContain('rounded-lg')
    expect(result).toContain('border')
    expect(result).toContain('bg-gray-900/50')
  })
})
