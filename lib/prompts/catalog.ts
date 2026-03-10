import type { PromptTemplate } from './types'

function prompt(
  id: string,
  title: string,
  description: string,
  promptText: string,
  category: PromptTemplate['category'],
  speed: PromptTemplate['speed'],
  icon: string,
  tags: string[],
  variables?: PromptTemplate['variables'],
): PromptTemplate {
  return { id, title, description, prompt: promptText, category, speed, icon, tags, variables }
}

// ── Codebase Analysis ─────────────────────────────────────────

const CODEBASE_ANALYSIS: PromptTemplate[] = [
  prompt(
    'explain-codebase',
    'Explain Codebase',
    'Understand, analyze, and document your codebase — architecture, entry points, and key patterns.',
    'Analyze this codebase thoroughly. Identify the main entry points, core architecture patterns, key dependencies, and how data flows through the system. Provide a structured overview that a new developer could use to get productive quickly.',
    'codebase-analysis',
    'step-by-step',
    'lucide:book-open',
    ['architecture', 'overview', 'onboarding'],
  ),
  prompt(
    'explain-react-architecture',
    'Explain React Component Architecture',
    'Get a clear breakdown of how a React component works, including props flow, state management, and dependencies.',
    'Analyze the React component architecture in {{file}}. Break down the props interface, state management approach, hooks usage, context dependencies, and how data flows between parent and child components. Identify any performance concerns or anti-patterns.',
    'codebase-analysis',
    'instant',
    'lucide:component',
    ['react', 'components', 'props', 'state'],
    [{ name: 'file', label: 'Component file', placeholder: 'e.g. components/Dashboard.tsx' }],
  ),
  prompt(
    'analyze-error-handling',
    'Analyze Error Handling Strategy',
    'Understand and document the error handling and logging approaches used in your project.',
    'Analyze the error handling strategy across this codebase. Document how errors are caught, propagated, logged, and reported. Identify gaps — uncaught promise rejections, missing try/catch blocks, silent failures, and inconsistent error formats. Suggest improvements.',
    'codebase-analysis',
    'instant',
    'lucide:alert-triangle',
    ['errors', 'logging', 'resilience'],
  ),
  prompt(
    'visualize-project-architecture',
    'Visualize Project Architecture',
    "Create visual diagrams showing your system's components, dependencies, and data flow patterns.",
    'Analyze the project architecture and generate a Mermaid diagram showing the key components, their relationships, data flow paths, and external dependencies. Include both the high-level system view and the internal module structure.',
    'codebase-analysis',
    'instant',
    'lucide:network',
    ['diagram', 'mermaid', 'visualization'],
  ),
  prompt(
    'document-dependencies',
    'Document Dependencies and Tools',
    'Get a comprehensive overview of all tools and libraries used in your project.',
    "Analyze package.json (or equivalent dependency manifest) and document every dependency. For each one, explain what it does, why it's included, whether it's still actively used, and if there are newer/better alternatives. Flag any security advisories or deprecated packages.",
    'codebase-analysis',
    'instant',
    'lucide:package',
    ['dependencies', 'packages', 'audit'],
  ),
  prompt(
    'find-todo-comments',
    'Find All TODO Comments',
    'Locate and report all TODO, FIXME, HACK, and XXX items across your entire codebase.',
    "Search the entire codebase for TODO, FIXME, HACK, XXX, and WARN comments. Group them by file and priority. For each one, assess whether it's still relevant, suggest a resolution, and estimate effort. Present as a prioritized action list.",
    'codebase-analysis',
    'instant',
    'lucide:list-checks',
    ['todo', 'fixme', 'technical-debt'],
  ),
  prompt(
    'visualize-microservices',
    'Visualize Microservices Communication',
    'Create visual diagrams showing how your microservices interact, data flows, and potential bottlenecks.',
    'Map out the microservices architecture in this codebase. Generate a Mermaid sequence diagram showing inter-service communication, API calls, message queues, shared databases, and event flows. Identify potential bottlenecks, single points of failure, and circular dependencies.',
    'codebase-analysis',
    'step-by-step',
    'lucide:workflow',
    ['microservices', 'distributed', 'communication'],
  ),
  prompt(
    'generate-architecture-diagram',
    'Generate Architecture Diagram',
    'Automatically generate Mermaid diagrams from your codebase structure and component relationships.',
    'Examine the project structure, imports, and module boundaries. Generate a comprehensive Mermaid architecture diagram showing: 1) Module/package hierarchy, 2) Import dependency graph, 3) Data flow between layers, 4) External service integrations. Use appropriate Mermaid diagram types (flowchart, C4, etc.).',
    'codebase-analysis',
    'instant',
    'lucide:git-fork',
    ['mermaid', 'diagram', 'modules'],
  ),
]

// ── Documentation ─────────────────────────────────────────────

const DOCUMENTATION: PromptTemplate[] = [
  prompt(
    'create-project-docs',
    'Create Project Documentation',
    'Build structured knowledge repositories that capture the "why" behind your code — specs, architecture decisions, and technical rationale.',
    'Create comprehensive project documentation for this codebase. Include: 1) Project overview and purpose, 2) Architecture Decision Records (ADRs) for key design choices, 3) Setup and installation guide, 4) Development workflow, 5) API overview, 6) Deployment process. Write for a developer joining the team tomorrow.',
    'documentation',
    'step-by-step',
    'lucide:file-text',
    ['docs', 'architecture', 'adr'],
  ),
  prompt(
    'document-api-endpoints',
    'Document API Endpoints',
    'Transform your API endpoints into comprehensive documentation with all parameters, responses, and examples.',
    'Find all API endpoints in this codebase and document each one with: HTTP method, path, description, request parameters/body schema, response schema, authentication requirements, error codes, and a curl example. Format as a structured API reference.',
    'documentation',
    'instant',
    'lucide:route',
    ['api', 'endpoints', 'reference'],
  ),
  prompt(
    'document-rest-api',
    'Document REST API Endpoints',
    'Extract and document all REST API endpoints with parameters, responses, and usage examples.',
    'Scan the codebase for REST API route handlers. For each endpoint, document: method, path, middleware chain, request validation, response shape, status codes, and authentication requirements. Generate OpenAPI-compatible documentation.',
    'documentation',
    'instant',
    'lucide:globe',
    ['rest', 'openapi', 'swagger'],
  ),
  prompt(
    'document-graphql-schema',
    'Document GraphQL Schema',
    'Analyze and document GraphQL endpoints, queries, mutations, and schema definitions.',
    'Analyze the GraphQL schema in this project. Document all types, queries, mutations, and subscriptions. For each resolver, explain the data source, arguments, return type, and any authorization checks. Generate a schema reference with examples.',
    'documentation',
    'instant',
    'lucide:braces',
    ['graphql', 'schema', 'resolvers'],
  ),
  prompt(
    'document-system-architecture',
    'Document System Architecture',
    "Get a comprehensive overview of your system's architecture and design patterns.",
    'Document the system architecture of this project. Cover: 1) High-level system diagram, 2) Component responsibilities and boundaries, 3) Design patterns in use (MVC, CQRS, event-driven, etc.), 4) Data flow and state management, 5) Error handling strategy, 6) Performance considerations. Include Mermaid diagrams where helpful.',
    'documentation',
    'step-by-step',
    'lucide:layout-dashboard',
    ['architecture', 'design-patterns', 'system'],
  ),
  prompt(
    'create-onboarding-guide',
    'Generate Dev Onboarding Guide',
    'Create step-by-step documentation for new developers joining your project.',
    'Create a developer onboarding guide for this project. Include: 1) Prerequisites and system requirements, 2) Repository setup (clone, install, env vars), 3) Local development workflow, 4) How to run tests, 5) Code style and conventions, 6) PR review process, 7) Common gotchas and FAQs, 8) Key contacts and resources.',
    'documentation',
    'step-by-step',
    'lucide:graduation-cap',
    ['onboarding', 'setup', 'getting-started'],
  ),
  prompt(
    'create-team-onboarding',
    'Create Team Onboarding Documentation',
    'Generate comprehensive onboarding guide for new developers including setup, architecture overview, and contribution guidelines.',
    'Create a comprehensive team onboarding document. Beyond technical setup, include: 1) Team structure and roles, 2) Communication channels and norms, 3) Sprint/iteration workflow, 4) Architecture overview with diagrams, 5) Contribution guidelines (branching, commits, PRs), 6) Testing expectations, 7) Deployment process, 8) On-call and incident response.',
    'documentation',
    'step-by-step',
    'lucide:users',
    ['team', 'onboarding', 'culture'],
  ),
  prompt(
    'explain-docker-config',
    'Explain Docker Configuration',
    'Analyze and document Docker setup, containers, networks, and deployment configurations.',
    'Analyze the Docker configuration in this project (Dockerfile, docker-compose.yml, .dockerignore). Document: base images and their purpose, build stages, exposed ports, volume mounts, environment variables, networking, health checks, and deployment considerations. Suggest optimizations for image size and build speed.',
    'documentation',
    'instant',
    'lucide:container',
    ['docker', 'containers', 'deployment'],
  ),
]

// ── DevOps & Infrastructure ───────────────────────────────────

const DEVOPS_INFRA: PromptTemplate[] = [
  prompt(
    'generate-docker-config',
    'Generate Docker Configuration',
    'Create optimized Docker setup with Dockerfile, docker-compose, and environment configurations for your project.',
    'Generate a production-ready Docker configuration for this project. Include: 1) Multi-stage Dockerfile with security best practices, 2) docker-compose.yml for local development, 3) .dockerignore, 4) Health check endpoints, 5) Environment variable management, 6) Volume configuration for persistent data. Optimize for small image size and fast builds.',
    'devops-infra',
    'instant',
    'lucide:container',
    ['docker', 'containers', 'devops'],
  ),
  prompt(
    'optimize-docker-setup',
    'Optimize Docker Setup',
    "Generate production-ready Docker configuration tailored to your application's specific requirements and dependencies.",
    'Review the existing Docker setup and optimize it. Check for: 1) Unnecessary layers and large base images, 2) Missing .dockerignore entries, 3) Security vulnerabilities in base images, 4) Missing health checks, 5) Improper secret handling, 6) Build cache inefficiencies, 7) Missing non-root user configuration. Propose optimized versions.',
    'devops-infra',
    'step-by-step',
    'lucide:gauge',
    ['docker', 'optimization', 'security'],
  ),
  prompt(
    'explain-cicd-pipeline',
    'Explain CI/CD Pipeline',
    'Document GitHub Actions workflows, triggers, and deployment processes with optimization suggestions.',
    'Analyze the CI/CD pipeline configuration (.github/workflows/, Jenkinsfile, etc.). Document: trigger conditions, job dependencies, caching strategy, test stages, deployment targets, secret management, and failure handling. Suggest optimizations for faster builds and more reliable deployments.',
    'devops-infra',
    'instant',
    'lucide:git-pull-request-arrow',
    ['cicd', 'github-actions', 'deployment'],
  ),
  prompt(
    'setup-github-actions',
    'Set Up GitHub Actions CI/CD',
    'Create automated testing pipeline that runs tests on every push with proper workflow configuration.',
    'Create a GitHub Actions CI/CD workflow for this project. Include: 1) Lint and type-check on every PR, 2) Unit and integration tests, 3) Build verification, 4) Automated deployment to staging on merge to main, 5) Production deployment on release tags, 6) Caching for dependencies, 7) Status badges for README.',
    'devops-infra',
    'instant',
    'lucide:play-circle',
    ['github-actions', 'ci', 'automation'],
  ),
  prompt(
    'setup-cloud-infra',
    'Set Up Cloud Infrastructure',
    'Deploy production-ready cloud infrastructure from scratch using natural language.',
    'Design and document the cloud infrastructure needed for this project. Cover: 1) Compute (serverless vs containers vs VMs), 2) Database hosting and backups, 3) CDN and edge caching, 4) DNS and SSL/TLS, 5) Monitoring and alerting, 6) Cost estimation, 7) Scaling strategy, 8) Disaster recovery. Provide Terraform/IaC snippets where applicable.',
    'devops-infra',
    'step-by-step',
    'lucide:cloud',
    ['cloud', 'infrastructure', 'terraform'],
  ),
  prompt(
    'setup-local-dev-env',
    'Set Up Local Development Environment',
    'Configure complete local development environment with dependencies, databases, and development tools.',
    'Create a comprehensive local development setup guide for this project. Include: 1) Required tools and versions (Node, Python, Docker, etc.), 2) Database setup (local or containerized), 3) Environment variable configuration, 4) IDE settings and recommended extensions, 5) Pre-commit hooks, 6) Common development commands, 7) Troubleshooting common setup issues.',
    'devops-infra',
    'instant',
    'lucide:laptop',
    ['local', 'dev-env', 'setup'],
  ),
  prompt(
    'setup-postgresql',
    'Set Up PostgreSQL Database',
    'Install and configure PostgreSQL server with performance tuning and security best practices.',
    'Set up PostgreSQL for this project with: 1) Installation and initial configuration, 2) User and database creation, 3) Connection pooling (PgBouncer), 4) Performance tuning (shared_buffers, work_mem, effective_cache_size), 5) Backup strategy (pg_dump, WAL archiving), 6) Monitoring queries, 7) Security hardening (pg_hba.conf, SSL).',
    'devops-infra',
    'instant',
    'lucide:database',
    ['postgresql', 'database', 'setup'],
  ),
  prompt(
    'setup-redis',
    'Set Up Redis Server',
    'Install and configure Redis server for caching, sessions, and high-performance data storage.',
    'Set up Redis for this project with: 1) Installation and configuration, 2) Memory management and eviction policies, 3) Persistence (RDB + AOF), 4) Security (AUTH, TLS, network binding), 5) Caching patterns (cache-aside, write-through), 6) Session management setup, 7) Monitoring with Redis CLI and INFO command.',
    'devops-infra',
    'instant',
    'lucide:zap',
    ['redis', 'caching', 'sessions'],
  ),
  prompt(
    'visualize-terraform',
    'Visualize Terraform Architecture',
    'Create diagrams showing Terraform infrastructure resources, dependencies, and deployment topology.',
    'Analyze the Terraform configuration in this project. Generate a Mermaid diagram showing: 1) All managed resources and their relationships, 2) Module dependencies, 3) Network topology (VPCs, subnets, security groups), 4) Data flows between services, 5) State management approach. Identify potential improvements.',
    'devops-infra',
    'instant',
    'lucide:network',
    ['terraform', 'iac', 'diagram'],
  ),
  prompt(
    'setup-monitoring',
    'Set Up Application Monitoring',
    'Configure observability with logging, metrics, tracing, and alerting for production workloads.',
    'Design an observability setup for this project. Include: 1) Structured logging strategy, 2) Application metrics (request latency, error rates, throughput), 3) Distributed tracing, 4) Health check endpoints, 5) Alerting rules and thresholds, 6) Dashboard design, 7) Error tracking integration (Sentry, etc.). Provide implementation code.',
    'devops-infra',
    'step-by-step',
    'lucide:activity',
    ['monitoring', 'observability', 'alerting'],
  ),
]

// ── Testing & Quality ─────────────────────────────────────────

const TESTING_QUALITY: PromptTemplate[] = [
  prompt(
    'generate-missing-tests',
    'Generate Tests for Missing Coverage',
    'Create test files for modules that lack proper testing.',
    "Analyze the codebase and identify modules, functions, and components without adequate test coverage. For each gap, generate well-structured tests covering: happy path, edge cases, error handling, and boundary conditions. Use the project's existing test framework and conventions.",
    'testing-quality',
    'step-by-step',
    'lucide:test-tube',
    ['tests', 'coverage', 'quality'],
  ),
  prompt(
    'analyze-test-coverage',
    'Analyze Test Coverage Gaps',
    'Review existing tests and identify missing coverage areas with specific recommendations for improvement.',
    'Review the existing test suite. Identify: 1) Untested modules and functions, 2) Missing edge case coverage, 3) Integration test gaps, 4) Tests that are too tightly coupled to implementation, 5) Flaky test patterns, 6) Missing error scenario tests. Prioritize gaps by risk and suggest specific tests to write.',
    'testing-quality',
    'instant',
    'lucide:pie-chart',
    ['coverage', 'gaps', 'analysis'],
  ),
  prompt(
    'clean-unused-code',
    'Clean Up Unused Code',
    'Scan your codebase to find unused imports, dead functions, and redundant code that can be safely removed.',
    "Scan the codebase for dead code: 1) Unused imports, 2) Unreachable functions and methods, 3) Commented-out code blocks, 4) Unused variables and parameters, 5) Deprecated API usage, 6) Orphaned files not imported anywhere, 7) Redundant type assertions. For each finding, confirm it's safe to remove and propose the cleanup.",
    'testing-quality',
    'step-by-step',
    'lucide:trash-2',
    ['cleanup', 'dead-code', 'refactor'],
  ),
  prompt(
    'compare-config-baseline',
    'Compare Config Files to Baseline',
    'Detect configuration drift by comparing current configs to standards.',
    "Compare the project's configuration files (tsconfig, eslint, prettier, package.json scripts, CI/CD config) against current best practices and community standards. Identify drift, deprecated options, missing recommended settings, and inconsistencies between config files. Suggest a unified, modernized configuration.",
    'testing-quality',
    'instant',
    'lucide:diff',
    ['config', 'drift', 'standards'],
  ),
  prompt(
    'tdd-workflow',
    'Test-Driven Development Workflow',
    'Drive feature development with failing tests first, then implement the minimum fix.',
    "Guide me through a TDD workflow for {{feature}}. Start by: 1) Writing failing test cases that define the expected behavior, 2) Running the tests to confirm they fail, 3) Implementing the minimum code to make tests pass, 4) Refactoring while keeping tests green, 5) Adding edge case tests. Use the project's existing test framework.",
    'testing-quality',
    'step-by-step',
    'lucide:repeat',
    ['tdd', 'testing', 'workflow'],
    [
      {
        name: 'feature',
        label: 'Feature to build',
        placeholder: 'e.g. user authentication middleware',
      },
    ],
  ),
]

// ── Database ──────────────────────────────────────────────────

const DATABASE: PromptTemplate[] = [
  prompt(
    'create-schema-diagram',
    'Create Database Schema Diagram',
    'Generate Mermaid ER diagrams from your database structure and foreign key relationships.',
    'Analyze the database schema (migrations, ORM models, or SQL files) and generate a Mermaid ER diagram. Show all tables, columns with types, primary keys, foreign key relationships, indexes, and constraints. Highlight any normalization issues or missing indexes.',
    'database',
    'instant',
    'lucide:table-2',
    ['schema', 'er-diagram', 'mermaid'],
  ),
  prompt(
    'visualize-db-schema',
    'Visualize Database Schema',
    'Generate visual database schema diagrams showing tables, relationships, and constraints.',
    'Create a comprehensive visual representation of the database schema. Include: 1) All tables with columns and types, 2) Primary and foreign key relationships, 3) Junction/pivot tables, 4) Indexes and unique constraints, 5) Enum types, 6) Views and materialized views. Use Mermaid erDiagram syntax.',
    'database',
    'instant',
    'lucide:share-2',
    ['visualization', 'tables', 'relationships'],
  ),
  prompt(
    'optimize-db-schema',
    'Optimize Database Schema',
    'Analyze database design for performance issues, indexing opportunities, and structural improvements.',
    'Review the database schema for performance issues. Analyze: 1) Missing indexes on frequently queried columns, 2) N+1 query patterns in the ORM layer, 3) Over-normalization or under-normalization, 4) Large text/blob columns that should be externalized, 5) Missing cascading deletes, 6) Inefficient join paths, 7) Query plan analysis for slow queries. Suggest concrete optimizations.',
    'database',
    'instant',
    'lucide:gauge',
    ['optimization', 'indexing', 'performance'],
  ),
  prompt(
    'setup-mongodb',
    'Set Up MongoDB Database',
    'Install and configure MongoDB server with replica sets, sharding, and security configurations.',
    'Set up MongoDB for this project with: 1) Installation and replica set configuration, 2) Schema design patterns (embedding vs referencing), 3) Index strategy (compound, text, TTL), 4) Aggregation pipeline examples, 5) Connection pooling, 6) Backup and restore (mongodump, oplog), 7) Security (authentication, network encryption, field-level encryption).',
    'database',
    'instant',
    'lucide:database',
    ['mongodb', 'nosql', 'setup'],
  ),
  prompt(
    'setup-mysql',
    'Set Up MySQL Database',
    'Install and configure MySQL server with optimized settings and security configurations.',
    'Set up MySQL for this project with: 1) Installation and initial secure configuration, 2) User and privilege management, 3) InnoDB tuning (buffer pool, log file size, flush method), 4) Replication setup (primary/replica), 5) Backup strategy (mysqldump, binary log), 6) Query optimization and EXPLAIN analysis, 7) SSL/TLS configuration.',
    'database',
    'instant',
    'lucide:database',
    ['mysql', 'relational', 'setup'],
  ),
]

// ── Security ──────────────────────────────────────────────────

const SECURITY: PromptTemplate[] = [
  prompt(
    'audit-authentication',
    'Audit Authentication Security',
    'Comprehensive security review of authentication systems with vulnerability assessment and recommendations.',
    'Perform a security audit of the authentication system. Review: 1) Session management (token storage, expiry, rotation), 2) Password handling (hashing algorithm, salting, complexity), 3) OAuth/OIDC implementation, 4) CSRF protection, 5) Rate limiting on auth endpoints, 6) Account lockout policy, 7) MFA implementation, 8) JWT validation (algorithm, expiry, audience). Flag vulnerabilities with severity ratings.',
    'security',
    'instant',
    'lucide:lock',
    ['authentication', 'audit', 'vulnerabilities'],
  ),
  prompt(
    'assess-project-security',
    "Assess Project's Security",
    'Identify and document all security measures implemented in your codebase.',
    'Conduct a comprehensive security assessment. Review: 1) Input validation and sanitization, 2) SQL injection prevention, 3) XSS protection, 4) CSRF tokens, 5) Security headers (CSP, HSTS, X-Frame-Options), 6) Dependency vulnerabilities, 7) Secret management, 8) File upload handling, 9) API authentication and authorization, 10) Logging of security events. Rate each area and provide remediation steps.',
    'security',
    'step-by-step',
    'lucide:shield',
    ['security', 'assessment', 'owasp'],
  ),
  prompt(
    'assess-technical-debt',
    'Assess Technical Debt',
    'Get a comprehensive analysis of technical debt with prioritized remediation plan and effort estimates.',
    'Analyze the codebase for technical debt. Assess: 1) Code complexity (cyclomatic, cognitive), 2) Code duplication, 3) Outdated dependencies, 4) Missing or outdated tests, 5) Inconsistent patterns and conventions, 6) Documentation gaps, 7) Performance anti-patterns, 8) Accessibility issues, 9) Deprecated API usage. Prioritize by impact and effort, provide a remediation roadmap.',
    'security',
    'step-by-step',
    'lucide:alert-octagon',
    ['technical-debt', 'quality', 'remediation'],
  ),
]

// ── Build Features ────────────────────────────────────────────

const BUILD_FEATURES: PromptTemplate[] = [
  prompt(
    'build-feature',
    'Build a Feature from Scratch',
    'Build a new feature for your app based on your existing codebase.',
    'Build {{feature}} for this project. Follow these steps: 1) Analyze the existing codebase patterns, conventions, and architecture, 2) Design the feature with types and interfaces first, 3) Implement the core logic, 4) Add UI components if applicable, 5) Write tests, 6) Update documentation. Match the existing code style exactly.',
    'build-features',
    'step-by-step',
    'lucide:hammer',
    ['feature', 'implementation', 'full-stack'],
    [
      {
        name: 'feature',
        label: 'Feature description',
        placeholder: 'e.g. user notifications system with email and in-app alerts',
      },
    ],
  ),
  prompt(
    'build-landing-page',
    'Build and Deploy Landing Page',
    'Create a professional landing page with modern design.',
    'Build a professional landing page for {{product}}. Include: 1) Hero section with clear value proposition, 2) Feature highlights with icons, 3) Social proof / testimonials section, 4) Pricing or CTA section, 5) FAQ accordion, 6) Footer with links. Use modern design patterns, responsive layout, smooth animations, and accessible markup.',
    'build-features',
    'step-by-step',
    'lucide:layout-template',
    ['landing-page', 'marketing', 'design'],
    [
      {
        name: 'product',
        label: 'Product/project name',
        placeholder: 'e.g. TaskFlow — AI-powered project management',
      },
    ],
  ),
  prompt(
    'build-dashboard',
    'Build GitHub Issues Dashboard',
    'Create a real-time dashboard for tracking and displaying GitHub issues.',
    "Build a GitHub Issues dashboard that: 1) Fetches issues from a specified repository via the GitHub API, 2) Displays them in a filterable, sortable table, 3) Shows issue statistics (open/closed, labels, assignees), 4) Supports search and filtering, 5) Auto-refreshes on an interval, 6) Handles pagination. Use the project's existing UI patterns.",
    'build-features',
    'step-by-step',
    'lucide:kanban',
    ['dashboard', 'github', 'issues'],
  ),
  prompt(
    'implement-github-issue',
    'Implement GitHub Issue',
    'Create a working implementation for a specific GitHub issue or feature request.',
    "Implement GitHub issue: {{issue}}. Steps: 1) Read and understand the issue requirements, 2) Identify affected files and components, 3) Plan the implementation approach, 4) Write the code following project conventions, 5) Add or update tests, 6) Document any API changes, 7) List potential edge cases and how they're handled.",
    'build-features',
    'step-by-step',
    'lucide:circle-dot',
    ['github', 'issue', 'implementation'],
    [
      {
        name: 'issue',
        label: 'Issue description or URL',
        placeholder: 'e.g. #42 — Add dark mode toggle to settings',
      },
    ],
  ),
  prompt(
    'setup-project-structure',
    'Set Up New Project Structure',
    'Create complete project setup with standard structure and configs.',
    'Scaffold a new {{framework}} project with production-ready structure: 1) Directory layout following framework conventions, 2) TypeScript configuration (strict), 3) Linting and formatting (ESLint, Prettier), 4) Git hooks (Husky, lint-staged), 5) Testing setup (Vitest/Jest), 6) CI/CD pipeline, 7) Environment variable management, 8) README with setup instructions.',
    'build-features',
    'step-by-step',
    'lucide:folder-plus',
    ['scaffold', 'project', 'setup'],
    [
      {
        name: 'framework',
        label: 'Framework/stack',
        placeholder: 'e.g. Next.js 15 with TypeScript and Tailwind',
      },
    ],
  ),
]

// ── Debugging ─────────────────────────────────────────────────

const DEBUGGING: PromptTemplate[] = [
  prompt(
    'debug-server-errors',
    'Debug Remote Server Errors',
    'Investigate and resolve server errors by analyzing logs, configurations, and system status.',
    'Debug the following server error: {{error}}. Follow a systematic approach: 1) Reproduce the error scenario, 2) Check server logs for stack traces, 3) Analyze the request/response cycle, 4) Check environment variables and configuration, 5) Review recent code changes, 6) Isolate the root cause, 7) Propose and implement the fix, 8) Add regression tests.',
    'debugging',
    'instant',
    'lucide:server-crash',
    ['server', 'errors', 'debugging'],
    [
      {
        name: 'error',
        label: 'Error message or behavior',
        placeholder: 'e.g. 500 Internal Server Error on POST /api/users',
      },
    ],
  ),
  prompt(
    'find-error-patterns',
    'Find Error Patterns in Logs',
    'Analyze log files to identify and summarize system issues.',
    'Analyze the application logs for error patterns. Look for: 1) Recurring exceptions and their frequency, 2) Error correlation with specific endpoints or user actions, 3) Timing patterns (peak hours, deployment correlation), 4) Cascading failures, 5) Resource exhaustion signals (memory, connections, file descriptors), 6) Slow query patterns. Summarize findings with a prioritized remediation plan.',
    'debugging',
    'step-by-step',
    'lucide:file-warning',
    ['logs', 'errors', 'patterns'],
  ),
  prompt(
    'systematic-debugging',
    'Systematic Debugging Workflow',
    'Apply an evidence-first debugging methodology to isolate and fix the root cause.',
    'Apply systematic debugging to this issue: {{issue}}. Steps: 1) Define the expected vs actual behavior precisely, 2) Reproduce reliably with minimal steps, 3) Form hypotheses about the root cause, 4) Add targeted instrumentation (console logs, breakpoints, assertions), 5) Narrow down with binary search (bisect), 6) Identify the root cause, 7) Implement the fix, 8) Verify the fix and add a regression test.',
    'debugging',
    'step-by-step',
    'lucide:microscope',
    ['debugging', 'root-cause', 'systematic'],
    [
      {
        name: 'issue',
        label: 'Bug description',
        placeholder: 'e.g. Form submission hangs after clicking submit',
      },
    ],
  ),
]

// ── Architecture ──────────────────────────────────────────────

const ARCHITECTURE: PromptTemplate[] = [
  prompt(
    'plan-migration',
    'Plan Migration Strategy',
    'Create a comprehensive plan for migrating your codebase to newer technologies.',
    'Create a migration strategy from {{from}} to {{to}}. Include: 1) Compatibility assessment and breaking changes, 2) Dependency audit and updates needed, 3) Step-by-step migration plan with rollback points, 4) Code transformation patterns (codemods if available), 5) Testing strategy during migration, 6) Feature flag approach for gradual rollout, 7) Timeline and effort estimation, 8) Risk assessment.',
    'architecture',
    'step-by-step',
    'lucide:arrow-right-left',
    ['migration', 'upgrade', 'planning'],
    [
      { name: 'from', label: 'Current technology', placeholder: 'e.g. React Class Components' },
      {
        name: 'to',
        label: 'Target technology',
        placeholder: 'e.g. React Hooks + Server Components',
      },
    ],
  ),
  prompt(
    'assess-scalability',
    'Assess Scalability Challenges',
    'Identify potential scaling and debugging bottlenecks in your system.',
    'Analyze this codebase for scalability challenges. Evaluate: 1) Database query performance under load, 2) API response time bottlenecks, 3) Memory usage patterns, 4) Connection pool sizing, 5) Caching opportunities, 6) Background job processing, 7) File storage and CDN strategy, 8) Rate limiting and throttling, 9) Horizontal vs vertical scaling options. Provide a scalability roadmap.',
    'architecture',
    'step-by-step',
    'lucide:trending-up',
    ['scalability', 'performance', 'bottlenecks'],
  ),
  prompt(
    'create-er-diagram',
    'Create Mermaid ER Diagrams',
    'Generate Mermaid ER diagrams from your database structure and foreign key relationships.',
    'Generate detailed Mermaid ER diagrams for the database. Include: all entities with attributes, data types, primary keys (PK), foreign keys (FK), cardinality relationships (one-to-one, one-to-many, many-to-many), and junction tables. Group related entities into logical domains.',
    'architecture',
    'instant',
    'lucide:share-2',
    ['er-diagram', 'mermaid', 'database'],
  ),
  prompt(
    'design-api-architecture',
    'Design API Architecture',
    'Plan API structure with versioning, authentication, rate limiting, and documentation strategy.',
    'Design the API architecture for {{scope}}. Cover: 1) Resource naming and URL structure, 2) HTTP methods and status codes, 3) Request/response schemas, 4) Authentication and authorization (API keys, OAuth, JWT), 5) Rate limiting strategy, 6) Pagination approach, 7) Error response format, 8) Versioning strategy, 9) Caching headers, 10) OpenAPI/Swagger documentation.',
    'architecture',
    'step-by-step',
    'lucide:git-fork',
    ['api', 'design', 'rest'],
    [
      {
        name: 'scope',
        label: 'API scope',
        placeholder: 'e.g. user management and billing endpoints',
      },
    ],
  ),
  prompt(
    'design-event-driven',
    'Design Event-Driven Architecture',
    'Plan an event-driven system with message queues, pub/sub, and event sourcing patterns.',
    'Design an event-driven architecture for {{scope}}. Include: 1) Event catalog (event types, schemas, versioning), 2) Message broker selection and configuration, 3) Publisher/subscriber patterns, 4) Event ordering and idempotency, 5) Dead letter queue handling, 6) Saga/choreography patterns for multi-step workflows, 7) Event replay and debugging, 8) Monitoring and observability.',
    'architecture',
    'step-by-step',
    'lucide:radio-tower',
    ['events', 'messaging', 'async'],
    [
      {
        name: 'scope',
        label: 'System scope',
        placeholder: 'e.g. order processing and inventory management',
      },
    ],
  ),
]

// ── Git Workflow ──────────────────────────────────────────────

const GIT_WORKFLOW: PromptTemplate[] = [
  prompt(
    'create-git-history',
    'Create Git History Presentation',
    "Generate visual presentations of your team's recent development activity.",
    'Analyze the git history and create a presentation-ready summary. Include: 1) Commit frequency and patterns, 2) Key features and changes by contributor, 3) Branch activity and merge patterns, 4) Release timeline, 5) Hot files (most frequently changed), 6) Code churn metrics. Format as a structured markdown report with highlights.',
    'git-workflow',
    'instant',
    'lucide:git-commit-horizontal',
    ['git', 'history', 'report'],
  ),
  prompt(
    'pr-review-prep',
    'Prepare PR for Review',
    'Prepare code and context so review feedback is high-signal.',
    'Prepare the current branch for code review. Create: 1) PR title and description summarizing the change, 2) List of files changed with brief explanation of each, 3) Testing notes (what was tested, how to verify), 4) Risks and considerations for reviewers, 5) Screenshots/recordings if UI changes, 6) Related issues and dependencies. Highlight anything reviewers should focus on.',
    'git-workflow',
    'step-by-step',
    'lucide:git-pull-request',
    ['pr', 'review', 'preparation'],
  ),
  prompt(
    'branch-cleanup',
    'Finish Development Branch',
    'Wrap up a branch with verification, cleanup, and review-ready output.',
    "Finalize this development branch for merge. Check: 1) All changes compile and pass type-checking, 2) Tests pass (existing + new), 3) No unintended file changes or debug code, 4) Commits are clean and well-messaged, 5) Documentation is updated, 6) Breaking changes are documented, 7) Migration steps (if any) are clear. Summarize what's ready and what needs attention.",
    'git-workflow',
    'step-by-step',
    'lucide:flag',
    ['branch', 'cleanup', 'merge'],
  ),
  prompt(
    'git-conflict-resolution',
    'Resolve Git Conflicts',
    'Systematically resolve merge conflicts with context-aware decisions.',
    "Help resolve the current git merge conflicts. For each conflict: 1) Show both sides of the conflict, 2) Explain what each side intended, 3) Recommend the correct resolution based on the broader context, 4) Verify the resolution doesn't break functionality. After resolving all conflicts, run type-checking and tests to confirm everything works.",
    'git-workflow',
    'step-by-step',
    'lucide:git-merge',
    ['git', 'conflicts', 'merge'],
  ),
]

// ── Data Processing ───────────────────────────────────────────

const DATA_PROCESSING: PromptTemplate[] = [
  prompt(
    'analyze-data-file',
    'Analyze My Data File',
    'Make sense of a data file you have — CSV, JSON, or any structured format.',
    'Analyze the data file at {{file}}. Provide: 1) Schema/structure overview, 2) Row count and column statistics, 3) Data types and distributions, 4) Missing values and anomalies, 5) Key patterns and correlations, 6) Summary statistics (min, max, mean, median for numeric columns), 7) Suggested transformations or cleanup steps, 8) Visualization recommendations.',
    'data-processing',
    'instant',
    'lucide:table',
    ['data', 'analysis', 'csv'],
    [{ name: 'file', label: 'Data file path', placeholder: 'e.g. data/sales-2024.csv' }],
  ),
  prompt(
    'consolidate-data',
    'Consolidate Data Files into One',
    'Extract and standardize data from multiple files for unified analysis.',
    'Consolidate multiple data files into a single, normalized dataset. Steps: 1) Identify all data files and their formats, 2) Map column names across files to a unified schema, 3) Handle data type inconsistencies, 4) Merge/join on common keys, 5) Deduplicate records, 6) Handle conflicting values, 7) Export as a clean, documented dataset. Show the transformation logic.',
    'data-processing',
    'instant',
    'lucide:combine',
    ['consolidation', 'merge', 'etl'],
  ),
  prompt(
    'extract-pdf-data',
    'Extract Data from PDFs',
    'Pull key information from PDF documents into structured format.',
    'Extract structured data from the PDF at {{file}}. Identify and extract: 1) Tables and tabular data, 2) Key-value pairs (dates, amounts, names, addresses), 3) Section headings and body text, 4) Lists and enumerated items. Convert to a clean JSON or CSV format with clear field naming. Handle multi-page documents.',
    'data-processing',
    'instant',
    'lucide:file-scan',
    ['pdf', 'extraction', 'parsing'],
    [{ name: 'file', label: 'PDF file path', placeholder: 'e.g. docs/invoice-2024.pdf' }],
  ),
  prompt(
    'batch-image-processing',
    'Batch Convert and Rename Images',
    'Process multiple images with format conversion and intelligent renaming.',
    "Create a batch image processing script that: 1) Scans a directory for images, 2) Converts between formats (PNG, JPG, WebP), 3) Applies intelligent renaming based on metadata or content, 4) Resizes to specified dimensions (preserving aspect ratio), 5) Optimizes file size for web, 6) Generates a manifest of processed files. Use the project's language/runtime.",
    'data-processing',
    'instant',
    'lucide:images',
    ['images', 'batch', 'conversion'],
  ),
]

// ── File Management ───────────────────────────────────────────

const FILE_MANAGEMENT: PromptTemplate[] = [
  prompt(
    'organize-files',
    'Organize Project Files',
    'Restructure project files into a clean, conventional directory layout.',
    'Analyze the current file structure and propose a reorganization. Consider: 1) Framework-conventional directory layouts, 2) Separation of concerns (components, utils, types, tests), 3) Co-location of related files, 4) Barrel exports for clean imports, 5) Test file placement (co-located vs __tests__), 6) Shared vs feature-specific code. Provide the migration steps and updated import paths.',
    'file-management',
    'step-by-step',
    'lucide:folder-tree',
    ['organization', 'structure', 'cleanup'],
  ),
  prompt(
    'find-organize-invoices',
    'Find Invoices and Move Them to Folder',
    'Organize your invoices into one folder for accounting or tax reports.',
    'Search the filesystem for invoice files (PDF, XLSX, CSV). Identify them by: filename patterns (invoice, receipt, bill), content analysis, and date patterns. Move/copy them to a structured folder organized by year and month. Generate a summary spreadsheet listing all found invoices with dates, amounts, and vendors.',
    'file-management',
    'instant',
    'lucide:receipt',
    ['invoices', 'files', 'organization'],
  ),
  prompt(
    'organize-pdf-invoices',
    'Organize PDF Invoices by Date',
    'Automatically sort and organize PDF documents by dates extracted from their content.',
    'Organize PDF files by extracting dates from their content. Steps: 1) Scan directory for PDF files, 2) Extract dates from filename and content, 3) Create year/month folder structure, 4) Move files to appropriate folders, 5) Rename with consistent date-prefixed format, 6) Handle duplicates, 7) Generate a manifest CSV with original and new paths.',
    'file-management',
    'instant',
    'lucide:calendar-range',
    ['pdf', 'dates', 'sorting'],
  ),
  prompt(
    'remove-duplicate-contacts',
    'Remove Duplicate Contacts from Spreadsheet',
    'Clean up contact lists by automatically identifying and removing duplicate entries.',
    'Analyze the contact spreadsheet for duplicates. Match on: 1) Exact email matches, 2) Fuzzy name matching (similar first/last names), 3) Phone number normalization and matching, 4) Company + role combination, 5) Address similarity. For each duplicate group, select the most complete record and merge unique fields. Generate a clean, deduplicated output.',
    'file-management',
    'instant',
    'lucide:user-x',
    ['contacts', 'deduplication', 'spreadsheet'],
  ),
]

// ── Combine all categories ────────────────────────────────────

export const PROMPT_CATALOG: PromptTemplate[] = [
  ...CODEBASE_ANALYSIS,
  ...DOCUMENTATION,
  ...DEVOPS_INFRA,
  ...TESTING_QUALITY,
  ...DATABASE,
  ...SECURITY,
  ...BUILD_FEATURES,
  ...DEBUGGING,
  ...ARCHITECTURE,
  ...GIT_WORKFLOW,
  ...DATA_PROCESSING,
  ...FILE_MANAGEMENT,
]

export function getPromptById(id: string): PromptTemplate | undefined {
  return PROMPT_CATALOG.find((p) => p.id === id)
}

export function getPromptsByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return PROMPT_CATALOG.filter((p) => p.category === category)
}

export function searchPrompts(query: string): PromptTemplate[] {
  const q = query.toLowerCase().trim()
  if (!q) return PROMPT_CATALOG
  return PROMPT_CATALOG.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)),
  )
}
