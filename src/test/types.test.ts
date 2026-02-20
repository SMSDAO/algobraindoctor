import { describe, it, expect } from 'vitest'
import type {
  WorkerType,
  WorkerStatus,
  HealdecAction,
  IdentityClaimType,
  ClaimStatus,
  RoleType,
  Worker,
} from '../lib/types'

describe('Type definitions', () => {
  describe('WorkerType', () => {
    it('should accept valid worker types', () => {
      const validTypes: WorkerType[] = [
        'index',
        'identity',
        'score',
        'ingest',
        'sync',
        'gc',
        'alert',
        'export',
        'audit',
        'repair',
        'backfill',
        'maintenance',
      ]
      expect(validTypes).toHaveLength(12)
    })
  })

  describe('WorkerStatus', () => {
    it('should accept valid worker statuses', () => {
      const validStatuses: WorkerStatus[] = ['healthy', 'degraded', 'failed']
      expect(validStatuses).toHaveLength(3)
    })
  })

  describe('HealdecAction', () => {
    it('should accept valid healdec actions', () => {
      const validActions: HealdecAction[] = [
        'retry',
        'reroute',
        'quarantine',
        'repair_triggered',
        'escalate',
      ]
      expect(validActions).toHaveLength(5)
    })
  })

  describe('Worker interface', () => {
    it('should create a valid worker object', () => {
      const worker: Worker = {
        id: 'worker-1',
        type: 'index',
        status: 'healthy',
        lastRun: '2024-01-28T12:00:00Z',
        jobsCompleted: 100,
        jobsFailed: 2,
        avgDuration: 1500,
        queueSize: 5,
      }

      expect(worker.id).toBe('worker-1')
      expect(worker.type).toBe('index')
      expect(worker.status).toBe('healthy')
      expect(worker.jobsCompleted).toBeGreaterThan(0)
    })
  })

  describe('IdentityClaimType', () => {
    it('should accept valid claim types', () => {
      const validTypes: IdentityClaimType[] = [
        'owner',
        'maintainer',
        'contributor',
        'governor',
        'other',
      ]
      expect(validTypes).toHaveLength(5)
    })
  })

  describe('ClaimStatus', () => {
    it('should accept valid claim statuses', () => {
      const validStatuses: ClaimStatus[] = [
        'pending',
        'verified',
        'rejected',
        'revoked',
      ]
      expect(validStatuses).toHaveLength(4)
    })
  })

  describe('RoleType', () => {
    it('should accept valid role types', () => {
      const validRoles: RoleType[] = [
        'user',
        'admin',
        'developer',
        'validator',
        'analyst',
      ]
      expect(validRoles).toHaveLength(5)
    })
  })
})
