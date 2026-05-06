/**
 * Auth service — JWT-compatible session management with RBAC foundations.
 *
 * In the GitHub Spark environment, authentication is handled by the platform
 * (GitHub identity). This module provides a typed role/permission layer
 * that integrates with GitHub Spark's identity and can be extended with
 * a standalone JWT flow when moving to a dedicated backend.
 */

import { z } from 'zod'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Role definitions
// ---------------------------------------------------------------------------

export const ROLES = ['user', 'admin', 'developer', 'validator', 'analyst'] as const
export type Role = (typeof ROLES)[number]

export const PERMISSIONS = [
  'repos:read',
  'repos:write',
  'workers:read',
  'workers:write',
  'workers:manage',
  'claims:read',
  'claims:write',
  'claims:admin',
  'logs:read',
  'settings:read',
  'settings:write',
  'analytics:read',
] as const
export type Permission = (typeof PERMISSIONS)[number]

/** Maps each role to the permissions it grants. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: ['repos:read', 'claims:read', 'logs:read'],
  analyst: ['repos:read', 'claims:read', 'logs:read', 'analytics:read'],
  developer: [
    'repos:read',
    'repos:write',
    'workers:read',
    'claims:read',
    'claims:write',
    'logs:read',
    'analytics:read',
    'settings:read',
  ],
  validator: [
    'repos:read',
    'workers:read',
    'claims:read',
    'claims:write',
    'claims:admin',
    'logs:read',
    'analytics:read',
    'settings:read',
  ],
  admin: [...PERMISSIONS],
}

// ---------------------------------------------------------------------------
// Session schema
// ---------------------------------------------------------------------------

export const SessionSchema = z.object({
  /** User identifier. */
  userId: z.string().min(1),
  /** Display name. */
  displayName: z.string().min(1),
  /** Assigned role. */
  role: z.enum(ROLES),
  /** ISO timestamp of session creation. */
  createdAt: z.string().datetime(),
  /** ISO timestamp of session expiry. */
  expiresAt: z.string().datetime(),
  /** Optional wallet address for Web3-linked sessions. */
  walletAddress: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
})

export type Session = z.infer<typeof SessionSchema>

// ---------------------------------------------------------------------------
// In-memory session store
// ---------------------------------------------------------------------------

let _currentSession: Session | null = null

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours

/** Create a new session for the given user. */
export function createSession(
  userId: string,
  displayName: string,
  role: Role,
  walletAddress?: string,
): Session {
  const now = new Date()
  const session: Session = {
    userId,
    displayName,
    role,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
    ...(walletAddress ? { walletAddress } : {}),
  }

  const parsed = SessionSchema.safeParse(session)
  if (!parsed.success) {
    throw new Error(`Invalid session data: ${parsed.error.message}`)
  }

  _currentSession = parsed.data
  logger.info('Session created', { userId, role })
  return _currentSession
}

/** Retrieve the current active session, or null if expired/absent. */
export function getSession(): Session | null {
  if (!_currentSession) return null

  if (new Date(_currentSession.expiresAt) < new Date()) {
    logger.info('Session expired', { userId: _currentSession.userId })
    _currentSession = null
    return null
  }

  return _currentSession
}

/** Destroy the current session. */
export function destroySession(): void {
  if (_currentSession) {
    logger.info('Session destroyed', { userId: _currentSession.userId })
  }
  _currentSession = null
}

// ---------------------------------------------------------------------------
// Permission checks
// ---------------------------------------------------------------------------

/** Check if the current session has a specific permission. */
export function hasPermission(permission: Permission): boolean {
  const session = getSession()
  if (!session) return false
  return ROLE_PERMISSIONS[session.role].includes(permission)
}

/** Check if the current session has ALL of the given permissions. */
export function hasAllPermissions(permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(p))
}

/** Check if the current session has ANY of the given permissions. */
export function hasAnyPermission(permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(p))
}

/** Assert a permission, throwing an error if not granted. */
export function requirePermission(permission: Permission): void {
  if (!hasPermission(permission)) {
    const role = getSession()?.role ?? 'unauthenticated'
    throw new Error(
      `Access denied: role '${role}' does not have permission '${permission}'.`,
    )
  }
}
