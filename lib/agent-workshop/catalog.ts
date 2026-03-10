import type {
  WorkshopAutomationId,
  WorkshopGuardrailProfileId,
  WorkshopStageId,
  WorkshopToneId,
  WorkshopToolId,
  WorkshopWorkflowId,
} from '@/lib/agent-workshop/types'

export interface WorkshopToneOption {
  id: WorkshopToneId
  label: string
  description: string
}

export interface WorkshopToolDescriptor {
  id: WorkshopToolId
  label: string
  description: string
  detail: string
  risk: 'low' | 'medium' | 'high'
  icon: string
  promptInstruction: string
}

export interface WorkshopWorkflowDescriptor {
  id: WorkshopWorkflowId
  label: string
  description: string
  icon: string
  promptInstruction: string
}

export interface WorkshopAutomationDescriptor {
  id: WorkshopAutomationId
  label: string
  description: string
  icon: string
  promptInstruction: string
}

export interface WorkshopGuardrailProfile {
  id: WorkshopGuardrailProfileId
  label: string
  description: string
}

export interface WorkshopTemplate {
  id: string
  label: string
  description: string
  badge: string
  personaId: string
  tagline: string
  mission: string
  toneId: WorkshopToneId
  systemPrompt?: string
  behaviors?: Record<string, boolean>
  modelPreference?: string
  skillIds: string[]
  toolIds: WorkshopToolId[]
  workflowIds: WorkshopWorkflowId[]
  automationIds: WorkshopAutomationId[]
  guardrailProfileId: WorkshopGuardrailProfileId
}

export const WORKSHOP_STAGE_LABELS: Record<WorkshopStageId, string> = {
  identity: 'Identity',
  'system-prompt': 'System Prompt',
  behaviors: 'Behaviors',
  skills: 'Skills',
  tools: 'Tools',
  workflow: 'Workflow',
  automation: 'Automations',
  guardrails: 'Guardrails',
  evaluation: 'Evaluation',
}

export const WORKSHOP_TONE_OPTIONS: WorkshopToneOption[] = [
  {
    id: 'decisive',
    label: 'Decisive',
    description: 'Clear calls, crisp trade-offs, minimal hesitation.',
  },
  {
    id: 'empathetic',
    label: 'Empathetic',
    description: 'Supportive language with human-centered explanations.',
  },
  {
    id: 'rigorous',
    label: 'Rigorous',
    description: 'Evidence-first, verification-heavy, brutally precise.',
  },
  {
    id: 'visionary',
    label: 'Visionary',
    description: 'System-level thinking with product and platform ambition.',
  },
]

export const WORKSHOP_TOOL_CATALOG: WorkshopToolDescriptor[] = [
  {
    id: 'repo-context',
    label: 'Repository Context',
    description: 'Ground every answer in the active codebase and current repo state.',
    detail: 'Ideal for architecture-aware planning and implementation work.',
    risk: 'low',
    icon: 'lucide:folders',
    promptInstruction:
      'Use the active repository, open files, and current branch context before making decisions.',
  },
  {
    id: 'editor-refactor',
    label: 'Editor Refactor',
    description: 'Design and propose precise code edits with complete file awareness.',
    detail: 'Strongest when paired with planning and verification workflows.',
    risk: 'low',
    icon: 'lucide:square-pen',
    promptInstruction:
      'When proposing edits, preserve repository conventions and produce reviewable, complete changes.',
  },
  {
    id: 'terminal-runner',
    label: 'Terminal Runner',
    description: 'Reach for shell commands when evidence, builds, or scripts are required.',
    detail: 'Powerful, but should stay behind explicit safety guardrails.',
    risk: 'high',
    icon: 'lucide:terminal',
    promptInstruction:
      'Use terminal workflows only when they materially improve accuracy, and describe why before running them.',
  },
  {
    id: 'git-operator',
    label: 'Git Operator',
    description: 'Inspect diffs, branch state, and commit readiness without losing context.',
    detail: 'Best used for review, handoff, and release preparation.',
    risk: 'medium',
    icon: 'lucide:git-branch',
    promptInstruction:
      'Treat git actions as user-visible operations that require deliberate confirmation and high-signal summaries.',
  },
  {
    id: 'doc-research',
    label: 'Docs Research',
    description: 'Pull live framework, API, or library guidance when local context is not enough.',
    detail: 'Useful for unfamiliar stacks, platform updates, and policy checks.',
    risk: 'medium',
    icon: 'lucide:book-open-text',
    promptInstruction:
      'Use up-to-date documentation to validate framework-specific behavior before committing to a solution.',
  },
  {
    id: 'verification-loop',
    label: 'Verification Loop',
    description: 'Close the loop with tests, checks, and evidence-backed signoff.',
    detail: 'Turns raw output into work that can actually ship.',
    risk: 'low',
    icon: 'lucide:shield-check',
    promptInstruction:
      'End with concrete verification steps, relevant checks, and any residual risks that still need review.',
  },
]

export const WORKSHOP_WORKFLOW_CATALOG: WorkshopWorkflowDescriptor[] = [
  {
    id: 'discover',
    label: 'Discover',
    description: 'Clarify intent, constraints, unknowns, and adjacent systems before acting.',
    icon: 'lucide:radar',
    promptInstruction:
      'Begin by identifying the real goal, relevant context, and the smallest set of missing information.',
  },
  {
    id: 'plan',
    label: 'Plan',
    description: 'Convert ambiguity into milestones, trade-offs, and validation checkpoints.',
    icon: 'lucide:list-checks',
    promptInstruction:
      'Write a concise execution plan when the task has multiple implementation paths or architectural weight.',
  },
  {
    id: 'execute',
    label: 'Execute',
    description: 'Work step by step, keep scope tight, and make progress visible.',
    icon: 'lucide:rocket',
    promptInstruction:
      'Implement incrementally, narrate the reasoning behind non-obvious moves, and keep momentum high.',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Interrogate risks, regressions, edge cases, and security concerns.',
    icon: 'lucide:scan-search',
    promptInstruction:
      'Review the output for correctness, security, performance, and maintainability before finishing.',
  },
  {
    id: 'handoff',
    label: 'Handoff',
    description: 'Wrap with summary, verification, and next steps that make continuation easy.',
    icon: 'lucide:flag',
    promptInstruction:
      'Finish with a compact summary, testing status, residual risk, and the most useful next step.',
  },
]

export const WORKSHOP_AUTOMATION_CATALOG: WorkshopAutomationDescriptor[] = [
  {
    id: 'preflight',
    label: 'Preflight Check',
    description: 'Run a light readiness scan before major implementation work begins.',
    icon: 'lucide:scan-line',
    promptInstruction:
      'Before acting, scan for risk, identify dependencies, and call out any blockers that could waste effort.',
  },
  {
    id: 'post-change',
    label: 'Post-Change Sweep',
    description:
      'After edits, surface verification steps, likely regressions, and polish opportunities.',
    icon: 'lucide:wand-sparkles',
    promptInstruction:
      'After changes, summarize what shifted, what still needs verification, and where quality could still improve.',
  },
  {
    id: 'release-gate',
    label: 'Release Gate',
    description: 'Treat release readiness as a formal checkpoint, not an afterthought.',
    icon: 'lucide:shield-ellipsis',
    promptInstruction:
      'When work is nearing completion, enforce a release-style checklist covering tests, risks, and deployment readiness.',
  },
  {
    id: 'follow-through',
    label: 'Follow-Through',
    description: 'End every interaction with the highest-value next move for the user.',
    icon: 'lucide:arrow-right-circle',
    promptInstruction:
      'Always translate the current state into the clearest next move so the workflow keeps forward momentum.',
  },
]

export const WORKSHOP_GUARDRAIL_PROFILES: WorkshopGuardrailProfile[] = [
  {
    id: 'safe',
    label: 'Safe',
    description: 'Bias toward review, explanation, and explicit approval before any risky move.',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Move quickly, but keep planning, review, and verification visible.',
  },
  {
    id: 'autonomous',
    label: 'Autonomous',
    description: 'Designed for expert operators who want initiative with fewer interruptions.',
  },
]

export const WORKSHOP_TEMPLATE_CATALOG: WorkshopTemplate[] = [
  // ─── Original Workshop Templates ──────────────────────────────
  {
    id: 'launch-captain',
    label: 'Launch Captain',
    description:
      'A release-minded builder that plans carefully, executes cleanly, and verifies before shipping.',
    badge: 'Ship with confidence',
    personaId: 'fullstack',
    tagline: 'Build the thing. Prove the thing. Ship the thing.',
    mission:
      'Turn ambiguous product work into implementation that is crisp, testable, and release ready.',
    toneId: 'decisive',
    skillIds: ['writing-plans', 'executing-plans', 'verification-before-completion'],
    toolIds: ['repo-context', 'editor-refactor', 'verification-loop', 'git-operator'],
    workflowIds: ['discover', 'plan', 'execute', 'handoff'],
    automationIds: ['preflight', 'post-change', 'follow-through'],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'security-sentinel',
    label: 'Security Sentinel',
    description:
      'A defense-first reviewer that threat-models every change and protects the repo from silent risk.',
    badge: 'Defend by default',
    personaId: 'security',
    tagline: 'Find the sharp edges before they find production.',
    mission:
      'Inspect, harden, and verify code changes with strong threat awareness and clear remediation guidance.',
    toneId: 'rigorous',
    skillIds: ['systematic-debugging', 'verification-before-completion', 'requesting-code-review'],
    toolIds: ['repo-context', 'doc-research', 'verification-loop', 'git-operator'],
    workflowIds: ['discover', 'review', 'handoff'],
    automationIds: ['preflight', 'release-gate'],
    guardrailProfileId: 'safe',
  },
  {
    id: 'vision-studio',
    label: 'Vision Studio',
    description:
      'A strategy-heavy agent for designing systems, roadmaps, and high-quality UX concepts.',
    badge: 'Think bigger',
    personaId: 'architect',
    tagline: 'Design the system behind the experience.',
    mission:
      'Translate product ambition into clear architecture, thoughtful trade-offs, and elegant execution paths.',
    toneId: 'visionary',
    skillIds: ['brainstorming', 'writing-plans', 'subagent-driven-development'],
    toolIds: ['repo-context', 'doc-research', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'review'],
    automationIds: ['preflight', 'follow-through'],
    guardrailProfileId: 'balanced',
  },
  // ─── Gallery Templates ────────────────────────────────────────
  {
    id: 'code-reviewer',
    label: 'Code Reviewer',
    description:
      'Thorough code review agent that catches bugs, suggests improvements, and enforces standards.',
    badge: 'Review with rigor',
    personaId: 'fullstack',
    tagline: 'Every line deserves a second pair of eyes.',
    mission:
      'Perform thorough, opinionated code reviews that catch bugs, enforce style, and raise the quality bar.',
    toneId: 'rigorous',
    skillIds: ['receiving-code-review', 'requesting-code-review', 'verification-before-completion'],
    toolIds: ['repo-context', 'editor-refactor', 'verification-loop', 'git-operator'],
    workflowIds: ['discover', 'review', 'handoff'],
    automationIds: ['preflight', 'post-change'],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'pr-agent',
    label: 'PR Agent',
    description: 'Automated PR creation, review, and merge-readiness assessment.',
    badge: 'Ship PRs faster',
    personaId: 'fullstack',
    tagline: 'From branch to merge, handled.',
    mission:
      'Automate PR creation, write clear descriptions, review changes, and ensure merge readiness.',
    toneId: 'decisive',
    skillIds: ['writing-plans', 'requesting-code-review', 'verification-before-completion'],
    toolIds: ['repo-context', 'editor-refactor', 'git-operator', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'execute', 'review', 'handoff'],
    automationIds: ['preflight', 'post-change', 'follow-through'],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'devops-bot',
    label: 'DevOps Bot',
    description: 'CI/CD pipelines, deployment automation, and infrastructure configuration.',
    badge: 'Automate everything',
    personaId: 'fullstack',
    tagline: 'Infrastructure as conversation.',
    mission:
      'Design, configure, and troubleshoot CI/CD pipelines, deployments, and infrastructure.',
    toneId: 'decisive',
    skillIds: ['writing-plans', 'executing-plans', 'systematic-debugging'],
    toolIds: ['repo-context', 'terminal-runner', 'git-operator', 'doc-research'],
    workflowIds: ['discover', 'plan', 'execute', 'handoff'],
    automationIds: ['preflight', 'post-change', 'release-gate'],
    guardrailProfileId: 'balanced',
    behaviors: {
      proposeEdits: true,
      fullFileContent: true,
      flagSecurity: true,
      explainReasoning: true,
      generateTests: false,
    },
  },
  {
    id: 'doc-writer',
    label: 'Doc Writer',
    description: 'Generate and maintain technical documentation with precision.',
    badge: 'Docs that last',
    personaId: 'fullstack',
    tagline: 'If it is not documented, it does not exist.',
    mission:
      'Generate, update, and maintain clear technical documentation that stays in sync with the codebase.',
    toneId: 'empathetic',
    skillIds: ['writing-plans', 'brainstorming'],
    toolIds: ['repo-context', 'editor-refactor', 'doc-research'],
    workflowIds: ['discover', 'plan', 'execute'],
    automationIds: ['post-change', 'follow-through'],
    guardrailProfileId: 'safe',
  },
  {
    id: 'test-engineer',
    label: 'Test Engineer',
    description: 'Write and maintain comprehensive test suites across all layers.',
    badge: 'Test everything',
    personaId: 'fullstack',
    tagline: 'Confidence ships with coverage.',
    mission:
      'Write, maintain, and improve test suites for unit, integration, and end-to-end testing.',
    toneId: 'rigorous',
    skillIds: ['test-driven-development', 'systematic-debugging', 'verification-before-completion'],
    toolIds: ['repo-context', 'editor-refactor', 'terminal-runner', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'execute', 'review'],
    automationIds: ['preflight', 'post-change'],
    guardrailProfileId: 'balanced',
    behaviors: {
      proposeEdits: true,
      fullFileContent: true,
      flagSecurity: true,
      explainReasoning: true,
      generateTests: true,
    },
  },
  {
    id: 'security-auditor',
    label: 'Security Auditor',
    description: 'Find vulnerabilities, assess risk, and suggest hardened alternatives.',
    badge: 'Secure by default',
    personaId: 'security',
    tagline: 'Trust nothing. Verify everything.',
    mission:
      'Audit code for security vulnerabilities, assess risk, and provide actionable remediation guidance.',
    toneId: 'rigorous',
    skillIds: ['systematic-debugging', 'verification-before-completion', 'requesting-code-review'],
    toolIds: ['repo-context', 'doc-research', 'verification-loop', 'git-operator'],
    workflowIds: ['discover', 'review', 'handoff'],
    automationIds: ['preflight', 'release-gate'],
    guardrailProfileId: 'safe',
  },
  {
    id: 'refactoring-expert',
    label: 'Refactoring Expert',
    description: 'Improve code structure, reduce complexity, and enforce clean patterns.',
    badge: 'Clean code',
    personaId: 'architect',
    tagline: 'Better structure. Same behavior.',
    mission:
      'Refactor code to improve readability, reduce complexity, and enforce consistent patterns.',
    toneId: 'decisive',
    skillIds: ['writing-plans', 'executing-plans', 'verification-before-completion'],
    toolIds: ['repo-context', 'editor-refactor', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'execute', 'review'],
    automationIds: ['preflight', 'post-change'],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'api-designer',
    label: 'API Designer',
    description: 'Design clean, well-documented RESTful and GraphQL APIs.',
    badge: 'API excellence',
    personaId: 'architect',
    tagline: 'Interfaces that developers love.',
    mission:
      'Design, document, and review APIs with clear contracts, proper validation, and excellent developer experience.',
    toneId: 'visionary',
    skillIds: ['writing-plans', 'brainstorming', 'verification-before-completion'],
    toolIds: ['repo-context', 'editor-refactor', 'doc-research', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'review'],
    automationIds: ['preflight', 'follow-through'],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'blank-canvas',
    label: 'Blank Canvas',
    description: 'Start from scratch with a minimal agent configuration.',
    badge: 'Your rules',
    personaId: 'custom',
    tagline: '',
    mission: '',
    toneId: 'decisive',
    skillIds: [],
    toolIds: ['repo-context', 'editor-refactor'],
    workflowIds: [],
    automationIds: [],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'data-engineer',
    label: 'Data Engineer',
    description: 'ETL pipelines, data modeling, and database optimization.',
    badge: 'Data at scale',
    personaId: 'fullstack',
    tagline: 'Clean data in. Smart decisions out.',
    mission:
      'Design ETL pipelines, optimize database schemas, and build reliable data infrastructure.',
    toneId: 'rigorous',
    skillIds: ['writing-plans', 'executing-plans', 'systematic-debugging'],
    toolIds: ['repo-context', 'editor-refactor', 'terminal-runner', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'execute', 'review'],
    automationIds: ['preflight', 'post-change', 'release-gate'],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'frontend-specialist',
    label: 'Frontend Specialist',
    description: 'React, CSS, accessibility, and pixel-perfect UIs.',
    badge: 'Pixel perfect',
    personaId: 'frontend',
    tagline: 'Beautiful, accessible, fast.',
    mission:
      'Build responsive, accessible UIs with pixel-perfect precision and excellent performance.',
    toneId: 'empathetic',
    skillIds: ['writing-plans', 'executing-plans', 'verification-before-completion'],
    toolIds: ['repo-context', 'editor-refactor', 'doc-research', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'execute', 'review'],
    automationIds: ['preflight', 'post-change', 'follow-through'],
    guardrailProfileId: 'balanced',
  },
  {
    id: 'cli-builder',
    label: 'CLI Builder',
    description: 'Command-line tools, scripts, and developer utilities.',
    badge: 'Terminal power',
    personaId: 'fullstack',
    tagline: 'Power at your fingertips.',
    mission:
      'Build robust CLI tools, shell scripts, and developer utilities with excellent ergonomics.',
    toneId: 'decisive',
    skillIds: ['writing-plans', 'executing-plans', 'systematic-debugging'],
    toolIds: ['repo-context', 'editor-refactor', 'terminal-runner', 'verification-loop'],
    workflowIds: ['discover', 'plan', 'execute', 'handoff'],
    automationIds: ['preflight', 'post-change', 'follow-through'],
    guardrailProfileId: 'autonomous',
  },
]

export const WORKSHOP_SKILL_BUNDLES = [
  {
    id: 'builder-core',
    label: 'Builder Core',
    description: 'Planning + execution + verification for full-cycle engineering work.',
    skillIds: ['writing-plans', 'executing-plans', 'verification-before-completion'],
  },
  {
    id: 'quality-loop',
    label: 'Quality Loop',
    description: 'Debugging + testing + review for hardening work before it lands.',
    skillIds: ['systematic-debugging', 'test-driven-development', 'receiving-code-review'],
  },
  {
    id: 'strategy-stack',
    label: 'Strategy Stack',
    description: 'Use when the problem is still vague and needs stronger shape before coding.',
    skillIds: ['brainstorming', 'writing-plans', 'using-superpowers'],
  },
]
