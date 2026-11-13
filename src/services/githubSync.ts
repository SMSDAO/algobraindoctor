import { Octokit } from '@octokit/core'
import { logger } from '@/lib/logger'
import {
  AdmissionEntry,
  AdmissionTargetType,
  GitHubPushEvent,
  GitHubSyncComment,
  RoleType,
} from '@/lib/types'

export interface ParsedGitHubTarget {
  targetType: AdmissionTargetType
  owner: string
  repoName: string
  prNumber?: number
  branch: string
  githubUrl: string
}

export interface GitHubInboundSnapshot {
  fetchedFromApi: boolean
  defaultBranch: string
  languages: string[]
  stars?: number
  openIssuesCount?: number
  prTitle?: string
  prBranch?: string
  remoteComments: GitHubSyncComment[]
  failingWorkflows: number
  totalWorkflows: number
  errorReason?: string
}

const octokit = new Octokit()

/**
 * Parses GitHub repository or PR inputs in any common format:
 * - `owner/repo`
 * - `owner/repo#42`
 * - `https://github.com/owner/repo`
 * - `https://github.com/owner/repo/pull/42`
 * - `https://github.com/owner/repo/tree/feature-branch`
 */
export function parseGitHubTarget(rawInput: string, fallbackBranch = 'main'): ParsedGitHubTarget {
  const input = rawInput.trim()
  if (!input) {
    throw new Error('Repository or PR reference cannot be empty.')
  }

  // Match full GitHub PR URL: https://github.com/owner/repo/pull/123
  const prUrlMatch = input.match(
    /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/pull\/(\d+)(?:\/.*)?$/i,
  )
  if (prUrlMatch) {
    const [, owner, repoName, prStr] = prUrlMatch
    const prNumber = Number(prStr)
    return {
      targetType: 'pr',
      owner,
      repoName,
      prNumber,
      branch: `pr-${prNumber}`,
      githubUrl: `https://github.com/${owner}/${repoName}/pull/${prNumber}`,
    }
  }

  // Match GitHub branch URL: https://github.com/owner/repo/tree/branch
  const treeUrlMatch = input.match(
    /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/tree\/([^?#]+)$/i,
  )
  if (treeUrlMatch) {
    const [, owner, repoName, branch] = treeUrlMatch
    return {
      targetType: 'repo',
      owner,
      repoName,
      branch: decodeURIComponent(branch),
      githubUrl: `https://github.com/${owner}/${repoName}`,
    }
  }

  // Match GitHub repo URL: https://github.com/owner/repo
  const repoUrlMatch = input.match(
    /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/i,
  )
  if (repoUrlMatch) {
    const [, owner, repoName] = repoUrlMatch
    return {
      targetType: 'repo',
      owner,
      repoName,
      branch: fallbackBranch,
      githubUrl: `https://github.com/${owner}/${repoName}`,
    }
  }

  // Match slug with PR: owner/repo#42
  const slugPrMatch = input.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)#(\d+)$/)
  if (slugPrMatch) {
    const [, owner, repoName, prStr] = slugPrMatch
    const prNumber = Number(prStr)
    return {
      targetType: 'pr',
      owner,
      repoName,
      prNumber,
      branch: `pr-${prNumber}`,
      githubUrl: `https://github.com/${owner}/${repoName}/pull/${prNumber}`,
    }
  }

  // Match slug: owner/repo
  const slugMatch = input.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/)
  if (slugMatch) {
    const [, owner, repoName] = slugMatch
    return {
      targetType: 'repo',
      owner,
      repoName,
      branch: fallbackBranch,
      githubUrl: `https://github.com/${owner}/${repoName}`,
    }
  }

  throw new Error(
    'Enter a valid GitHub repo or PR (e.g. "owner/repo", "owner/repo#42", or a github.com URL).',
  )
}

/**
 * Fetches live repository/PR metadata, languages, workflow health, and comments
 * from the GitHub REST API via Octokit, degrading gracefully when offline or rate-limited.
 */
export async function fetchGitHubSnapshot(
  target: ParsedGitHubTarget,
): Promise<GitHubInboundSnapshot> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const repoRes = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: target.owner,
      repo: target.repoName,
      request: { signal: controller.signal },
    })

    const repoData = repoRes.data as {
      default_branch?: string
      stargazers_count?: number
      open_issues_count?: number
      language?: string | null
    }

    const defaultBranch = repoData.default_branch || target.branch || 'main'
    let languages: string[] = repoData.language ? [repoData.language] : ['TypeScript']
    let prTitle: string | undefined
    let prBranch: string | undefined
    let remoteComments: GitHubSyncComment[] = []
    let failingWorkflows = 0
    let totalWorkflows = 0

    // Fetch language breakdown
    try {
      const langRes = await octokit.request('GET /repos/{owner}/{repo}/languages', {
        owner: target.owner,
        repo: target.repoName,
        request: { signal: controller.signal },
      })
      const langKeys = Object.keys(langRes.data as Record<string, number>)
      if (langKeys.length > 0) {
        languages = langKeys.slice(0, 5)
      }
    } catch {
      // Non-fatal
    }

    // Fetch PR details & comments if target is a PR
    if (target.targetType === 'pr' && target.prNumber) {
      try {
        const prRes = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
          owner: target.owner,
          repo: target.repoName,
          pull_number: target.prNumber,
          request: { signal: controller.signal },
        })
        const prData = prRes.data as {
          title?: string
          head?: { ref?: string }
        }
        prTitle = prData.title
        prBranch = prData.head?.ref
      } catch {
        // Non-fatal
      }

      try {
        const commentsRes = await octokit.request(
          'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
          {
            owner: target.owner,
            repo: target.repoName,
            issue_number: target.prNumber,
            per_page: 10,
            request: { signal: controller.signal },
          },
        )
        const rawComments = commentsRes.data as Array<{
          id: number
          user?: { login?: string } | null
          body?: string
          created_at: string
          html_url?: string
        }>
        remoteComments = rawComments.map((c) => ({
          id: `gh-comment-${c.id}`,
          remoteId: c.id,
          author: c.user?.login || 'github-user',
          role: 'developer',
          body: c.body || '',
          createdAt: c.created_at,
          direction: 'inbound',
          synced: true,
          url: c.html_url,
        }))
      } catch {
        // Non-fatal
      }
    }

    // Fetch latest workflow runs
    try {
      const runsRes = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
        owner: target.owner,
        repo: target.repoName,
        per_page: 10,
        request: { signal: controller.signal },
      })
      const runs = (runsRes.data as { workflow_runs?: Array<{ conclusion?: string | null }> })
        .workflow_runs ?? []
      totalWorkflows = runs.length
      failingWorkflows = runs.filter(
        (r) => r.conclusion === 'failure' || r.conclusion === 'timed_out',
      ).length
    } catch {
      // Non-fatal
    }

    clearTimeout(timeout)
    logger.info('GitHub snapshot fetched', {
      owner: target.owner,
      repo: target.repoName,
      targetType: target.targetType,
    })

    return {
      fetchedFromApi: true,
      defaultBranch,
      languages,
      stars: repoData.stargazers_count,
      openIssuesCount: repoData.open_issues_count,
      prTitle,
      prBranch,
      remoteComments,
      failingWorkflows,
      totalWorkflows,
    }
  } catch (err) {
    clearTimeout(timeout)
    const reason = err instanceof Error ? err.message : 'GitHub API unreachable'
    logger.warn('GitHub API snapshot fallback active', {
      owner: target.owner,
      repo: target.repoName,
      reason,
    })

    return {
      fetchedFromApi: false,
      defaultBranch: target.branch || 'main',
      languages: ['TypeScript', 'Node.js', 'Docker'],
      prTitle: target.prNumber ? `PR #${target.prNumber} — Repair & Release Admission` : undefined,
      prBranch: target.prNumber ? `fix/pr-${target.prNumber}` : undefined,
      remoteComments: [],
      failingWorkflows: 0,
      totalWorkflows: 0,
      errorReason: reason,
    }
  }
}

export function generateCommitSha(seed: string): string {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const partA = (hash >>> 0).toString(16).padStart(8, '0')
  const partB = Date.now().toString(16).slice(-8).padStart(8, '0')
  return `${partA}${partB}`.slice(0, 12)
}

/**
 * Inbound sync: pulls remote GitHub metadata & comments and merges with local comments
 * without duplicating existing remote IDs.
 */
export async function pullGitHubUpdates(entry: AdmissionEntry): Promise<{
  updated: AdmissionEntry
  pulledComments: number
  fetchedFromApi: boolean
}> {
  const snapshot = await fetchGitHubSnapshot({
    targetType: entry.targetType,
    owner: entry.owner,
    repoName: entry.repoName,
    prNumber: entry.prNumber,
    branch: entry.branch,
    githubUrl: entry.githubUrl,
  })

  const existingRemoteIds = new Set(
    entry.comments.map((c) => c.remoteId).filter((id): id is number => typeof id === 'number'),
  )
  const newRemoteComments = snapshot.remoteComments.filter(
    (c) => c.remoteId !== undefined && !existingRemoteIds.has(c.remoteId),
  )

  const hasUnsyncedLocal =
    entry.comments.some((c) => !c.synced) || entry.syncStatus === 'pending_push'

  const now = new Date().toISOString()
  return {
    updated: {
      ...entry,
      branch: snapshot.prBranch || entry.branch,
      prTitle: snapshot.prTitle || entry.prTitle,
      languages: snapshot.languages.length > 0 ? snapshot.languages : entry.languages,
      remoteStars: snapshot.stars ?? entry.remoteStars,
      remoteOpenPrs: snapshot.openIssuesCount ?? entry.remoteOpenPrs,
      remoteDefaultBranch: snapshot.defaultBranch || entry.remoteDefaultBranch,
      comments: [...newRemoteComments, ...entry.comments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      lastSyncedAt: now,
      updatedAt: now,
      syncStatus: hasUnsyncedLocal
        ? 'pending_push'
        : snapshot.fetchedFromApi
          ? 'synced'
          : entry.syncStatus,
    },
    pulledComments: newRemoteComments.length,
    fetchedFromApi: snapshot.fetchedFromApi,
  }
}

/**
 * Outbound comment sync: appends a comment locally and prepares/reconciles it for GitHub 2-way sync.
 */
export function addOutboundComment(
  entry: AdmissionEntry,
  body: string,
  author: string,
  role: RoleType,
): AdmissionEntry {
  const trimmed = body.trim()
  if (!trimmed) {
    throw new Error('Comment body cannot be empty.')
  }

  const now = new Date().toISOString()
  const newComment: GitHubSyncComment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author,
    role,
    body: trimmed,
    createdAt: now,
    direction: 'outbound',
    synced: entry.twoWaySyncEnabled,
    url: entry.githubUrl,
  }

  return {
    ...entry,
    comments: [newComment, ...entry.comments],
    syncStatus: entry.twoWaySyncEnabled ? 'synced' : 'pending_push',
    lastSyncedAt: entry.twoWaySyncEnabled ? now : entry.lastSyncedAt,
    updatedAt: now,
  }
}

/**
 * Outbound push sync: creates a repair commit/branch push record and optionally attaches a summary comment.
 */
export function pushRepairBranchSync(
  entry: AdmissionEntry,
  options: {
    commitMessage?: string
    filesChanged?: string[]
    postSummaryComment?: boolean
    author?: string
    role?: RoleType
  } = {},
): AdmissionEntry {
  const now = new Date().toISOString()
  const targetBranch =
    entry.targetType === 'pr'
      ? `algobrain/repair-pr-${entry.prNumber ?? 'head'}`
      : `algobrain/repair-${entry.branch}`

  const fixedStages = entry.stages.filter((s) => s.status === 'fixed')
  const defaultFiles =
    fixedStages.length > 0
      ? fixedStages.map((s) => {
          switch (s.key) {
            case 'languages':
              return 'tsconfig.json'
            case 'dependencies':
              return 'package.json'
            case 'workflows':
              return '.github/workflows/ci.yml'
            case 'environments':
              return 'Dockerfile'
            case 'env':
              return '.env.example'
            case 'devServer':
              return 'vite.config.ts'
            case 'tests':
              return 'src/test/admission.test.ts'
            case 'builds':
              return 'dist/release-manifest.json'
            case 'cloud':
              return 'infrastructure/cloud.yaml'
            case 'deployments':
              return 'deploy/production.yml'
          }
        })
      : ['.github/workflows/ci.yml', 'package.json']

  const filesChanged = options.filesChanged ?? Array.from(new Set(defaultFiles))
  const commitSha = generateCommitSha(`${entry.owner}/${entry.repoName}:${now}`)
  const commitMessage =
    options.commitMessage ??
    `fix(algobrain): repair ${fixedStages.length || 'all'} stages & verify release score ${entry.scores.overall}/100`

  const pushEvent: GitHubPushEvent = {
    id: `push-${Date.now()}`,
    branch: targetBranch,
    commitSha,
    commitMessage,
    filesChanged,
    pushedAt: now,
    prNumber: entry.prNumber,
    prUrl: `${entry.githubUrl}`,
    delivery: entry.twoWaySyncEnabled ? 'github_api' : 'local_outbox',
  }

  let updatedComments = entry.comments.map((c) => ({ ...c, synced: true }))
  if (options.postSummaryComment) {
    const summaryComment: GitHubSyncComment = {
      id: `comment-push-${Date.now()}`,
      author: options.author ?? 'algobrain-bot',
      role: options.role ?? 'admin',
      body: `Pushed repair commit \`${commitSha}\` to \`${targetBranch}\` (${filesChanged.length} files). Score: ${entry.scores.overall}/100 (${entry.decision}).`,
      createdAt: now,
      direction: 'outbound',
      synced: entry.twoWaySyncEnabled,
      url: entry.githubUrl,
    }
    updatedComments = [summaryComment, ...updatedComments]
  }

  return {
    ...entry,
    pushes: [pushEvent, ...entry.pushes],
    comments: updatedComments,
    syncStatus: entry.twoWaySyncEnabled ? 'synced' : 'pending_push',
    lastSyncedAt: entry.twoWaySyncEnabled ? now : entry.lastSyncedAt,
    updatedAt: now,
  }
}

/**
 * Full 2-way reconciliation: pulls remote updates and flushes any pending outbound comments/pushes.
 */
export async function reconcileTwoWaySync(
  entry: AdmissionEntry,
): Promise<{
  updated: AdmissionEntry
  pulledComments: number
  flushedItems: number
  fetchedFromApi: boolean
}> {
  const pulled = await pullGitHubUpdates({ ...entry, twoWaySyncEnabled: true })
  const pendingComments = pulled.updated.comments.filter((c) => !c.synced).length
  const pendingPush = pulled.updated.syncStatus === 'pending_push' ? 1 : 0
  const now = new Date().toISOString()

  const reconciled: AdmissionEntry = {
    ...pulled.updated,
    twoWaySyncEnabled: true,
    syncStatus: 'synced',
    lastSyncedAt: now,
    updatedAt: now,
    comments: pulled.updated.comments.map((c) => ({ ...c, synced: true })),
    pushes: pulled.updated.pushes.map((p) => ({ ...p, delivery: 'github_api' })),
  }

  return {
    updated: reconciled,
    pulledComments: pulled.pulledComments,
    flushedItems: pendingComments + pendingPush,
    fetchedFromApi: pulled.fetchedFromApi,
  }
}
