import { describe, it, expect } from 'vitest'
import {
  parseGitHubTarget,
  addOutboundComment,
  pushRepairBranchSync,
} from '@/services/githubSync'
import {
  ALL_REPAIR_STAGE_META,
  buildAdmissionEntry,
  evaluateAndProcessAdmission,
  computeReleaseReadiness,
} from '@/services/admissionEngine'

describe('GitHub target parsing', () => {
  it('parses owner/repo slug', () => {
    const parsed = parseGitHubTarget('SMSDAO/algobraindoctor')
    expect(parsed.targetType).toBe('repo')
    expect(parsed.owner).toBe('SMSDAO')
    expect(parsed.repoName).toBe('algobraindoctor')
    expect(parsed.prNumber).toBeUndefined()
  })

  it('parses owner/repo#prNumber slug', () => {
    const parsed = parseGitHubTarget('SMSDAO/algobraindoctor#42')
    expect(parsed.targetType).toBe('pr')
    expect(parsed.owner).toBe('SMSDAO')
    expect(parsed.repoName).toBe('algobraindoctor')
    expect(parsed.prNumber).toBe(42)
  })

  it('parses full GitHub PR URL', () => {
    const parsed = parseGitHubTarget('https://github.com/algorand/go-algorand/pull/512')
    expect(parsed.targetType).toBe('pr')
    expect(parsed.owner).toBe('algorand')
    expect(parsed.repoName).toBe('go-algorand')
    expect(parsed.prNumber).toBe(512)
  })

  it('throws on invalid target', () => {
    expect(() => parseGitHubTarget('not-a-valid-repo')).toThrow()
  })
})

describe('Admission scoring gate & 10-domain repair pipeline', () => {
  const baseSnapshot = {
    fetchedFromApi: false,
    defaultBranch: 'main',
    languages: ['TypeScript', 'Docker'],
    remoteComments: [],
    failingWorkflows: 1,
    totalWorkflows: 2,
  }

  it('creates all 10 required repair domains', () => {
    const target = parseGitHubTarget('SMSDAO/algobraindoctor#18')
    const entry = buildAdmissionEntry({
      target,
      snapshot: baseSnapshot,
      submittedByRole: 'user',
      scoreThreshold: 85,
      repairOnlyIfNeeded: true,
      presetOverallScore: 65,
    })

    expect(entry.stages).toHaveLength(10)
    const keys = entry.stages.map((s) => s.key)
    expect(keys).toEqual(ALL_REPAIR_STAGE_META.map((m) => m.key))
  })

  it('skips repair when score meets threshold and repairOnlyIfNeeded is enabled', () => {
    const target = parseGitHubTarget('algorand/go-algorand')
    const entry = buildAdmissionEntry({
      target,
      snapshot: baseSnapshot,
      submittedByRole: 'analyst',
      scoreThreshold: 85,
      repairOnlyIfNeeded: true,
      presetOverallScore: 92,
    })

    const result = evaluateAndProcessAdmission(entry)
    expect(result.didRepair).toBe(false)
    expect(result.updated.decision).toBe('skip_healthy')
    expect(result.updated.stages.every((s) => s.status === 'skipped')).toBe(true)
  })

  it('executes full repair and upgrades scores when below threshold', () => {
    const target = parseGitHubTarget('SMSDAO/algobraindoctor#18')
    const entry = buildAdmissionEntry({
      target,
      snapshot: baseSnapshot,
      submittedByRole: 'user',
      scoreThreshold: 85,
      repairOnlyIfNeeded: true,
      presetOverallScore: 62,
    })

    const result = evaluateAndProcessAdmission(entry)
    expect(result.didRepair).toBe(true)
    expect(result.updated.decision).toBe('verified_ready')
    expect(result.updated.scores.overall).toBeGreaterThanOrEqual(85)
    expect(result.healdecLog).toBeDefined()
  })

  it('supports forceRepair even when score is above threshold', () => {
    const target = parseGitHubTarget('algorand/go-algorand')
    const entry = buildAdmissionEntry({
      target,
      snapshot: baseSnapshot,
      submittedByRole: 'developer',
      scoreThreshold: 85,
      repairOnlyIfNeeded: true,
      presetOverallScore: 92,
    })

    const result = evaluateAndProcessAdmission(entry, { forceRepair: true })
    expect(result.didRepair).toBe(true)
    expect(result.updated.decision).toBe('verified_ready')
  })
})

describe('GitHub 2-way sync & release readiness', () => {
  it('appends outbound comments and branch pushes cleanly', () => {
    const target = parseGitHubTarget('SMSDAO/algobraindoctor#99')
    const entry = buildAdmissionEntry({
      target,
      snapshot: {
        fetchedFromApi: false,
        defaultBranch: 'main',
        languages: ['TypeScript'],
        remoteComments: [],
        failingWorkflows: 0,
        totalWorkflows: 1,
      },
      submittedByRole: 'developer',
      presetOverallScore: 70,
    })

    const repaired = evaluateAndProcessAdmission(entry).updated
    const pushed = pushRepairBranchSync(repaired, { postSummaryComment: true })
    expect(pushed.pushes).toHaveLength(1)
    expect(pushed.pushes[0].branch).toBe('algobrain/repair-pr-99')
    expect(pushed.comments.length).toBeGreaterThanOrEqual(1)

    const commented = addOutboundComment(pushed, 'Ready for merge', 'spark-user', 'validator')
    expect(commented.comments[0].body).toBe('Ready for merge')
    expect(commented.syncStatus).toBe('synced')

    const readiness = computeReleaseReadiness([commented], [], {
      version: 'v1.0.0',
      status: 'preparing',
    })
    expect(readiness.readyToRelease).toBe(true)
    expect(readiness.passedCount).toBe(readiness.totalCount)
  })
})
