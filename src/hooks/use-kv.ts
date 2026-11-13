import { useState, useCallback, useEffect } from 'react'

const STORAGE_PREFIX = 'algobraindoctor:kv:'

function readFromStorage<T>(key: string, fallback: T | undefined): T | undefined {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (raw === null) {
      if (fallback !== undefined) {
        window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(fallback))
      }
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  } catch {
    // Ignore storage errors
  }
}

export function useKV<T = string>(
  key: string,
  initialValue?: T,
): readonly [T | undefined, (newValue: T | ((oldValue?: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T | undefined>(() => readFromStorage(key, initialValue))

  useEffect(() => {
    setValue(readFromStorage(key, initialValue))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    const storageKey = `${STORAGE_PREFIX}${key}`
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      if (event.newValue === null) {
        setValue(undefined)
      } else {
        try {
          setValue(JSON.parse(event.newValue) as T)
        } catch {
          // Ignore malformed external updates
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const userSetValue = useCallback(
    (newValue: T | ((oldValue?: T) => T)) => {
      setValue((currentValue) => {
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (oldValue?: T) => T)(currentValue)
            : newValue
        writeToStorage(key, nextValue)
        return nextValue
      })
    },
    [key],
  )

  const deleteValue = useCallback(() => {
    removeFromStorage(key)
    setValue(undefined)
  }, [key])

  return [value, userSetValue, deleteValue] as const
}
