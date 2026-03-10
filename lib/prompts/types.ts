export type PromptCategory =
  | 'codebase-analysis'
  | 'documentation'
  | 'devops-infra'
  | 'testing-quality'
  | 'database'
  | 'security'
  | 'file-management'
  | 'build-features'
  | 'debugging'
  | 'architecture'
  | 'data-processing'
  | 'git-workflow'

export type PromptSpeed = 'instant' | 'step-by-step'

export interface PromptVariable {
  name: string
  label: string
  placeholder: string
}

export interface PromptTemplate {
  id: string
  title: string
  description: string
  prompt: string
  category: PromptCategory
  speed: PromptSpeed
  icon: string
  tags: string[]
  variables?: PromptVariable[]
}

export const PROMPT_CATEGORY_LABELS: Record<PromptCategory, string> = {
  'codebase-analysis': 'Codebase Analysis',
  documentation: 'Documentation',
  'devops-infra': 'DevOps & Infra',
  'testing-quality': 'Testing & Quality',
  database: 'Database',
  security: 'Security',
  'file-management': 'File Management',
  'build-features': 'Build Features',
  debugging: 'Debugging',
  architecture: 'Architecture',
  'data-processing': 'Data Processing',
  'git-workflow': 'Git Workflow',
}

export const PROMPT_CATEGORY_ICONS: Record<PromptCategory, string> = {
  'codebase-analysis': 'lucide:search-code',
  documentation: 'lucide:file-text',
  'devops-infra': 'lucide:server',
  'testing-quality': 'lucide:test-tube',
  database: 'lucide:database',
  security: 'lucide:shield-check',
  'file-management': 'lucide:folder-tree',
  'build-features': 'lucide:hammer',
  debugging: 'lucide:bug',
  architecture: 'lucide:network',
  'data-processing': 'lucide:bar-chart-3',
  'git-workflow': 'lucide:git-branch',
}
