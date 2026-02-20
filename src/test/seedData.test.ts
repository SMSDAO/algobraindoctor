import { describe, it, expect } from 'vitest'
import { generateSeedData } from '../lib/seedData'

describe('Seed Data Generation', () => {
  describe('generateSeedData', () => {
    it('should generate complete seed data object', () => {
      const seedData = generateSeedData()
      
      expect(seedData).toHaveProperty('repositories')
      expect(seedData).toHaveProperty('workers')
      expect(seedData).toHaveProperty('healdecLogs')
      expect(seedData).toHaveProperty('logs')
    })

    it('should generate 5 sample repositories', () => {
      const { repositories } = generateSeedData()
      expect(repositories).toHaveLength(5)
    })

    it('should generate repositories with required properties', () => {
      const { repositories } = generateSeedData()
      const repo = repositories[0]

      expect(repo).toHaveProperty('id')
      expect(repo).toHaveProperty('owner')
      expect(repo).toHaveProperty('name')
      expect(repo).toHaveProperty('healthScore')
      expect(repo).toHaveProperty('activityScore')
      expect(repo).toHaveProperty('governanceScore')
    })

    it('should generate valid health scores between 0 and 100', () => {
      const { repositories } = generateSeedData()

      repositories.forEach((repo) => {
        expect(repo.healthScore).toBeGreaterThanOrEqual(0)
        expect(repo.healthScore).toBeLessThanOrEqual(100)
        expect(repo.activityScore).toBeGreaterThanOrEqual(0)
        expect(repo.activityScore).toBeLessThanOrEqual(100)
        expect(repo.governanceScore).toBeGreaterThanOrEqual(0)
        expect(repo.governanceScore).toBeLessThanOrEqual(100)
      })
    })

    it('should generate repositories with frameworks', () => {
      const { repositories } = generateSeedData()

      repositories.forEach((repo) => {
        expect(Array.isArray(repo.frameworks)).toBe(true)
        expect(repo.frameworks.length).toBeGreaterThan(0)
      })
    })

    it('should generate 12 workers', () => {
      const { workers } = generateSeedData()
      expect(workers).toHaveLength(12)
    })

    it('should generate workers with required properties', () => {
      const { workers } = generateSeedData()
      const worker = workers[0]

      expect(worker).toHaveProperty('id')
      expect(worker).toHaveProperty('type')
      expect(worker).toHaveProperty('status')
      expect(worker).toHaveProperty('jobsCompleted')
      expect(worker).toHaveProperty('jobsFailed')
      expect(worker).toHaveProperty('avgDuration')
      expect(worker).toHaveProperty('queueSize')
    })

    it('should generate workers with valid types', () => {
      const { workers } = generateSeedData()
      const validTypes = [
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

      workers.forEach((worker) => {
        expect(validTypes).toContain(worker.type)
      })
    })

    it('should generate workers with valid statuses', () => {
      const { workers } = generateSeedData()
      const validStatuses = ['healthy', 'degraded', 'failed']

      workers.forEach((worker) => {
        expect(validStatuses).toContain(worker.status)
      })
    })

    it('should generate workers with positive job counts', () => {
      const { workers } = generateSeedData()

      workers.forEach((worker) => {
        expect(worker.jobsCompleted).toBeGreaterThanOrEqual(0)
        expect(worker.jobsFailed).toBeGreaterThanOrEqual(0)
        expect(worker.avgDuration).toBeGreaterThan(0)
        expect(worker.queueSize).toBeGreaterThanOrEqual(0)
      })
    })

    it('should generate at least one healdec log', () => {
      const { healdecLogs } = generateSeedData()
      expect(healdecLogs.length).toBeGreaterThan(0)
    })

    it('should generate healdec logs with required properties', () => {
      const { healdecLogs } = generateSeedData()
      const log = healdecLogs[0]

      expect(log).toHaveProperty('id')
      expect(log).toHaveProperty('timestamp')
      expect(log).toHaveProperty('action')
      expect(log).toHaveProperty('reason')
    })

    it('should generate healdec logs with valid actions', () => {
      const { healdecLogs } = generateSeedData()
      const validActions = [
        'retry',
        'reroute',
        'quarantine',
        'repair_triggered',
        'escalate',
      ]

      healdecLogs.forEach((log) => {
        expect(validActions).toContain(log.action)
      })
    })

    it('should generate at least one system log', () => {
      const { logs } = generateSeedData()
      expect(logs.length).toBeGreaterThan(0)
    })

    it('should generate system logs with required properties', () => {
      const { logs } = generateSeedData()
      const log = logs[0]

      expect(log).toHaveProperty('id')
      expect(log).toHaveProperty('timestamp')
      expect(log).toHaveProperty('workerType')
      expect(log).toHaveProperty('level')
      expect(log).toHaveProperty('message')
    })

    it('should generate system logs with valid levels', () => {
      const { logs } = generateSeedData()
      const validLevels = ['info', 'warn', 'error', 'success']

      logs.forEach((log) => {
        expect(validLevels).toContain(log.level)
      })
    })

    it('should generate system logs with valid timestamps', () => {
      const { logs } = generateSeedData()

      logs.forEach((log) => {
        const timestamp = new Date(log.timestamp)
        expect(timestamp instanceof Date).toBe(true)
        expect(isNaN(timestamp.getTime())).toBe(false)
      })
    })
  })
})
