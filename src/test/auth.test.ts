import { describe, it, expect, beforeEach } from 'vitest'
import {
  createSession,
  getSession,
  destroySession,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  requirePermission,
  ROLE_PERMISSIONS,
  ROLES,
  PERMISSIONS,
  type Role,
  type Permission,
} from '../services/auth'

describe('auth service', () => {
  beforeEach(() => {
    destroySession()
  })

  describe('createSession', () => {
    it('should create a valid session', () => {
      const session = createSession('user-1', 'Alice', 'admin')
      expect(session.userId).toBe('user-1')
      expect(session.displayName).toBe('Alice')
      expect(session.role).toBe('admin')
      expect(session.createdAt).toBeDefined()
      expect(session.expiresAt).toBeDefined()
    })

    it('should set expiry 8 hours in the future', () => {
      const before = Date.now()
      const session = createSession('user-1', 'Alice', 'user')
      const after = Date.now()
      const expiresAt = new Date(session.expiresAt).getTime()
      const eightHoursMs = 8 * 60 * 60 * 1000
      expect(expiresAt).toBeGreaterThanOrEqual(before + eightHoursMs - 100)
      expect(expiresAt).toBeLessThanOrEqual(after + eightHoursMs + 100)
    })

    it('should support wallet address', () => {
      const addr = '0x1234567890123456789012345678901234567890'
      const session = createSession('user-1', 'Alice', 'user', addr)
      expect(session.walletAddress).toBe(addr)
    })

    it('should reject invalid wallet address', () => {
      expect(() => createSession('user-1', 'Alice', 'user', 'not-an-address')).toThrow()
    })
  })

  describe('getSession', () => {
    it('should return null when no session exists', () => {
      expect(getSession()).toBeNull()
    })

    it('should return the active session', () => {
      createSession('user-1', 'Alice', 'developer')
      const session = getSession()
      expect(session).not.toBeNull()
      expect(session?.role).toBe('developer')
    })
  })

  describe('destroySession', () => {
    it('should clear the session', () => {
      createSession('user-1', 'Alice', 'admin')
      destroySession()
      expect(getSession()).toBeNull()
    })
  })

  describe('ROLE_PERMISSIONS', () => {
    it('should define permissions for all roles', () => {
      for (const role of ROLES) {
        expect(ROLE_PERMISSIONS[role], `Missing permissions for role: ${role}`).toBeDefined()
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true)
      }
    })

    it('should grant admin all permissions', () => {
      for (const permission of PERMISSIONS) {
        expect(ROLE_PERMISSIONS.admin).toContain(permission)
      }
    })

    it('should grant user fewer permissions than developer', () => {
      expect(ROLE_PERMISSIONS.user.length).toBeLessThan(ROLE_PERMISSIONS.developer.length)
    })

    it('should include at minimum repos:read for all roles', () => {
      for (const role of ROLES) {
        expect(ROLE_PERMISSIONS[role]).toContain('repos:read')
      }
    })
  })

  describe('hasPermission', () => {
    it('should return false when no session exists', () => {
      expect(hasPermission('repos:read')).toBe(false)
    })

    it('should return true for permission granted to role', () => {
      createSession('u1', 'Alice', 'admin')
      expect(hasPermission('repos:write')).toBe(true)
    })

    it('should return false for permission not granted to role', () => {
      createSession('u1', 'Alice', 'user')
      expect(hasPermission('repos:write')).toBe(false)
    })

    it('should respect analyst role permissions', () => {
      createSession('u1', 'Alice', 'analyst')
      expect(hasPermission('analytics:read')).toBe(true)
      expect(hasPermission('repos:write')).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('should return true when all permissions are granted', () => {
      createSession('u1', 'Alice', 'admin')
      expect(hasAllPermissions(['repos:read', 'repos:write', 'logs:read'])).toBe(true)
    })

    it('should return false when any permission is missing', () => {
      createSession('u1', 'Alice', 'user')
      expect(hasAllPermissions(['repos:read', 'repos:write'])).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('should return true when at least one permission is granted', () => {
      createSession('u1', 'Alice', 'user')
      expect(hasAnyPermission(['repos:read', 'repos:write'])).toBe(true)
    })

    it('should return false when none of the permissions are granted', () => {
      createSession('u1', 'Alice', 'user')
      expect(hasAnyPermission(['repos:write', 'workers:manage'])).toBe(false)
    })
  })

  describe('requirePermission', () => {
    it('should not throw when permission is granted', () => {
      createSession('u1', 'Alice', 'admin')
      expect(() => requirePermission('repos:write')).not.toThrow()
    })

    it('should throw when permission is denied', () => {
      createSession('u1', 'Alice', 'user')
      expect(() => requirePermission('repos:write')).toThrow('Access denied')
    })

    it('should throw when no session exists', () => {
      expect(() => requirePermission('repos:read')).toThrow('Access denied')
    })

    it('should include the role name in the error message', () => {
      createSession('u1', 'Alice', 'user')
      expect(() => requirePermission('workers:manage')).toThrow("role 'user'")
    })
  })

  describe('type coverage', () => {
    it('should have all ROLES defined', () => {
      const expectedRoles: Role[] = ['user', 'admin', 'developer', 'validator', 'analyst']
      expect(ROLES).toEqual(expectedRoles)
    })

    it('should have PERMISSIONS array with expected entries', () => {
      const expectedPerms: Permission[] = [
        'repos:read', 'repos:write', 'workers:read', 'workers:write', 'workers:manage',
        'claims:read', 'claims:write', 'claims:admin', 'logs:read', 'settings:read',
        'settings:write', 'analytics:read',
      ]
      for (const perm of expectedPerms) {
        expect(PERMISSIONS).toContain(perm)
      }
    })
  })
})
