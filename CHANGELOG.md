# Changelog

## [1.11.0] — 2026-03-19

### Highlights

**The Cross-Platform Release** — comprehensive UI/UX polish, production-grade release automation for macOS, Windows, and Linux, and iOS hardening for TestFlight readiness.

### UI/UX Polish

- **Theme flash fix** — Layout default now matches theme-context default (`claude`), eliminating the brief Supreme-to-Claude flash on first paint
- **Design token consistency** — Replaced all hardcoded hex colors (`#ef4444`, `#22c55e`, `#8b5cf6`, `text-amber-400`) with semantic CSS variables (`var(--error)`, `var(--success)`, `var(--brand)`, `var(--warning)`) across chat-home, chat-header, settings-panel, and code-editor
- **Missing `--text-muted` variable** — Added `--text-muted` as an alias for `--text-tertiary` in the base theme, fixing 5 components that referenced an undefined variable
- **Real recent chats** — Replaced mock/placeholder recent chats on the home screen with actual thread history from localStorage, wired to navigate on click
- **View router completeness** — Added missing `agents` entry to the view label registry
- **Sidebar shortcut alignment** — Fixed collapsed/expanded shortcut mismatch (Kanban was `⌘7` collapsed vs `⌘8` expanded); renumbered entire nav to a consistent ⌘1-⌘9 sequence with Planner now included in expanded view
- **Cross-platform shortcuts** — Diff viewer now uses `formatShortcut()` for platform-aware shortcut display (⌘ on Mac, Ctrl on Windows/Linux)
- **Accessibility pass** — Added `aria-label` attributes to all icon-only buttons in sidebar, floating panel, chat header, and activity bar; added `focus-visible:ring` styles to interactive elements
- **Floating panel polish** — Improved dock icon semantics (`panel-left` instead of ambiguous `pin`), increased resize handle to touch-friendly 28px, added focus-visible support for keyboard users
- **Inline style cleanup** — Replaced inline `style={{ opacity }}` with Tailwind utility classes in sidebar dividers, converted `style={{ background, color }}` to CSS variable classes in mini avatar

### Release Automation

- **Release workflow hardened** — GitHub Actions workflow now checks out the exact tag/version, verifies version sync before building, generates SHA256 checksums, and publishes structured release notes with a platform download table
- **macOS signing readiness** — CI workflow includes conditional signing/notarization step that activates when Apple credentials are configured as secrets
- **Version provenance** — All three platform build jobs verify version contract before building

### iOS Hardening

- **Export compliance** — Added `ITSAppUsesNonExemptEncryption = false` to both `Info.ios.plist` and generated `app_iOS/Info.plist` (was documented in changelog but missing from actual plist files)
- **Release distribution guide** — Added TestFlight/App Store checklist, build commands, and draft App Store metadata to IOS.md

### Documentation

- **DESKTOP.md rewritten** — Updated from macOS-only to cross-platform (macOS, Windows, Linux), with accurate architecture diagram, platform matrix, prerequisite table, and current command reference
- **DESKTOP_WORKFLOW.md updated** — Added release workflow, version management, and iOS build path references
- **README refreshed** — Updated platform line to include iOS, corrected theme count from 7 to 24

### By the Numbers

- **13 files** modified
- **0 TypeScript errors**
- **Desktop + iOS versions aligned** at 1.11.0

## [1.10.0] — 2026-03-10

### ✨ Highlights

**The World-Class Polish Release** — every surface refined, every interaction considered, every pixel intentional. Kanban gets board + card templates, and every component receives micro-interaction polish for an award-worthy experience.

### 📋 Kanban Templates

- **9 Board Templates** — Create boards instantly from: Empty, Sprint Planning, Bug Triage, Security Audit, Test Coverage, Release Checklist, Feature Development, DevOps Pipeline, Research & Spike
- **8 Card Templates** — Quick-add: Bug Report, Feature Request, Test Case, Security Issue, Refactor, Documentation, Code Review, Hotfix — each with priority, labels, and subtasks
- **Smart Recommendations** — Board health score, WIP warnings, hygiene checks, productivity tips
- **Template Picker** — Glass card grid with icons, descriptions, hover effects

### 🏠 Chat Home Polish

- **Particle animation** — Subtle floating dots drifting in the background
- **Gradient hover borders** — Suggestion cards glow with gradient border on hover
- **Recent Chats** — Last 3 conversations shown below suggestions
- **Composer glow** — Clean brand-color box-shadow on focus

### 💬 Agent Panel Refinements

- **Message hover** — Micro-scale interaction on user message bubbles
- **Code copy button** — Hover overlay on code blocks with clipboard copy + checkmark feedback
- **Scroll-to-bottom FAB** — Floating button appears when scrolled up
- **Date separators** — Centered day pills between messages from different days

### 🧭 Sidebar Improvements

- **Group separators** — Subtle dividers between navigation sections
- **Active animation** — Smooth background fill on active item
- **User avatar** — Mini circle with initials at bottom of collapsed sidebar

### ⏱️ Status Bar Upgrade

- **Line/column count** — Shows current cursor position
- **Live clock** — Real-time HH:MM display, updates every minute
- **Encoding indicator** — UTF-8 badge
- **Clickable segments** — Hover feedback on all status bar items

### 🎨 Global CSS Enhancements

- **Custom scrollbars** — Thin, brand-colored, rounded
- **Selection color** — Brand accent at 25% opacity
- **Focus-visible rings** — Consistent 2px accent outline on keyboard focus
- **Reduced motion** — Respects prefers-reduced-motion
- **Print styles** — Clean content-only print output
- **Universal feedback** — All buttons scale(0.98) on active

### 🖥️ Terminal Polish

- **Connection indicator** — Green/red dot showing gateway status
- **Clear button** — One-click terminal clear in header

### 🔔 Toast Upgrades

- **Variant colors** — Success (green), Error (red), Warning (amber), Info (blue)
- **Progress bar** — Auto-dismiss countdown visualization

### 📊 Diff Viewer

- **Line hover highlights** — Each line highlights on hover
- **Tinted backgrounds** — Green for additions, red for removals at 10% opacity

### 🔌 MCP Library Polish

- **Install counts** — Mock download badges on server cards
- **Category counts** — Badge numbers on filter pills
- **Featured carousel** — Top row highlighting popular servers
- **Empty search state** — Friendly "no results" with icon

### ⚙️ Settings Panel

- **Collapsible sections** — Accordion animation for setting groups
- **Search filter** — Find settings quickly
- **Styled toggles** — Custom pill-style toggle switches

### 💻 Code Editor

- **Skeleton loading** — Shimmer animation while Monaco initializes
- **Welcome state** — Centered empty state with keyboard shortcut hints

### 🗺️ Breadcrumbs

- **File icon** — Code file icon on the active segment
- **Chevron separators** — Clean arrow separators replacing slashes
- **Bold active segment** — Last breadcrumb visually emphasized

### 📊 By the Numbers

- **14 files polished** in a single pass
- **~750 lines** of refinements
- **Every component** received attention
- **0 TypeScript errors**
- **Desktop + iOS versions aligned** at 1.10.0

## [1.9.0] — 2026-03-10

### ✨ Highlights

**Knot Code 1.9 is the biggest single-release update in the editor's history** — 21 commits, ~9,000+ lines of new code, shipping a completely redesigned home screen, VS Code-style navigation, a full Kanban board, a transformed Agent Builder Workshop, 8 new tactical themes, and dozens of UX polish improvements.

### 🏠 Redesigned Home Screen

- **Ambient gradient background** — Blue-purple radial glow on true black with animated grain texture
- **Dynamic greeting** — Time-aware greetings ("Good morning", "Night owl mode" at 3 AM)
- **Gradient tagline** — "What shall we build?" in blue→purple gradient text
- **Animated logo** — Entrance fade-in with continuous glow pulse
- **Glass suggestion cards** — 2×2 grid with staggered spring entrance animations
- **Premium composer** — Focus glow ring, cycling placeholder animation

### 🧭 VS Code-Style Navigation

- **Sidebar activity bar** — Collapsed icons with 2px brand-color active indicator
- **Expanded nav** — Labeled buttons with keyboard shortcuts on hover (⌘1-⌘9)
- **Top tab bar removed** — Zero wasted vertical space
- **View cycle toggle** — Mobile pill bar cycling Chat → Editor → Terminal
- **View transitions** — Subtle 150ms fade between views via AnimatePresence

### 📋 Kanban Board (NEW)

- **4 default columns** — Backlog, In Progress, Review, Done
- **Rich cards** — Title, description, priority (P0-P3), labels, assignee, due dates, subtasks
- **Drag & drop** — HTML5 native with visual drop indicators
- **Card detail panel** — Glass card sections, custom checkboxes, progress bars, comments, activity log
- **Multiple boards** — Create, rename, switch between boards
- **WIP limits** — Column warnings when work-in-progress exceeds threshold
- **Label system** — 5 built-in (bug, feature, docs, refactor, urgent) + custom labels
- **Persistence** — Full localStorage persistence across sessions

### 🏗️ Agent Builder Workshop (TRANSFORMED)

- **Template Gallery** — 12 beautiful agent templates (Code Reviewer, PR Agent, DevOps Bot, etc.)
- **Step-by-step Wizard** — 7-stage guided flow with progress bar and validation
- **Live Preview** — Real-time system prompt + config JSON with token count
- **Readiness Ring** — Circular SVG progress indicator with color-coded status
- **Quick Deploy** — One-click deploy agent to Chat with custom system prompt
- **Undo/Redo** — 20-state blueprint history (⌘Z / ⌘⇧Z)
- **Share & Export** — Share as link (base64 URL), export/import JSON blueprints
- **Agent Flow** — Visual pipeline with checkmarks on configured stages
- **Evaluation integration** — "Run Evaluation" button from review step

### 🎨 Themes

- **Claude theme** (NEW DEFAULT) — True black (#000), blue accent (#3b82f6), premium squircle borders
- **Field Manual collection** (8 NEW themes):
  - 🌿 Field Manual — OD green, typewriter font, earth tones
  - ⚓ Navy Ops — Deep navy, steel blue, submarine console
  - 🏜️ Desert Storm — Sand/amber, warm desert palette
  - 🔳 Blackout — True black, grayscale only, OPSEC mode
  - ❄️ Arctic White — Ice gray, frost blue, polar ops
  - 👁️ Recon (NVG) — ALL green phosphor, night vision goggles
  - 📡 SIGINT — ALL amber/gold, vintage CRT terminal
  - ✈️ Air Force HUD — Cyan heads-up display, cockpit glass
- **Lazy loading** — Manual themes loaded on-demand via dynamic import
- **Customizable editor background** — Grid, dots, gradient, or grid-logos patterns

### 🔌 MCP Library (NEW)

- **Marketplace view** — Standalone view replacing Settings-embedded MCP tab (⌘5)
- **20 servers** — PostgreSQL, Filesystem, Brave Search, GitHub, Slack, Linear, SQLite, Memory, Puppeteer, Fetch, Redis, MongoDB, Notion, Google Drive, Docker, Sentry, Supabase, Vercel, Cloudflare, Stripe
- **Custom Server** — Add your own MCP server with custom command/URL
- **Category filtering** — All, Installed, Featured, Databases, APIs, Developer, Custom
- **Gateway RPC wiring** — Real mcp.list/add/remove/start/stop/sync calls

### 💬 Chat Improvements

- **Inline pickers** — Type `/skill`, `/mcp`, or `/prompt` to see picker popup with search
- **Contextual help** — Empty picker states show setup instructions instead of "No items found"
- **Inline diff toolbar** — VS Code-style floating toolbar with per-hunk Undo/Keep (⌘Y/⌘N)
- **Message grouping** — Reduced spacing for consecutive same-sender messages
- **Link hover underlines** — Links show underline only on hover
- **Removed ugly focus glow** — Replaced rotating conic-gradient border with clean transition

### 🖥️ Editor Enhancements

- **Breadcrumbs** — File path navigation above editor with clickable segments
- **Monaco minimap** — Code overview enabled (maxColumn 80, renderCharacters false)
- **Empty state redesign** — "Open a project to start coding" with glass card action buttons
- **Grid pattern background** — Subtle 40px grid with faint KnotLogo watermark
- **Preview split panel** — Cursor-style preview + chat side-by-side with draggable divider

### 🔧 Developer Experience

- **Terminal auto-cd** — Terminal automatically changes directory when project switches
- **Dev server detection** — Green indicator when localhost:3000 is reachable
- **Toast notification system** — Provider + useToast() hook, glass cards, bottom-right stack
- **Status bar** — Git branch, gateway status, dev server pill
- **Skills hidden on mobile** — Accessible on desktop only
- **Terminal event fix** — Added runId/idemKey fallbacks for gateway event matching

### 🐛 Bug Fixes

- Fixed 12 unused imports/variables in agent-panel.tsx
- Fixed React hook dependency warnings
- Fixed YouTube status bar missing TrackInfo fields
- Fixed markdown preview Date.now() in useMemo → useEffect with ref
- Fixed sidebar nav horizontal layout → proper vertical stack
- Removed empty shell-topbar wasted space

### 📊 By the Numbers

- **21 commits** in a single session
- **~9,000+ lines** of new code
- **5 new views** — MCP Library, Kanban, Workshop, Preview Split, Template Gallery
- **8 new themes** — Field Manual tactical collection
- **20 MCP servers** in catalog
- **12 agent templates** in Workshop
- **0 TypeScript errors** — All changes pass strict mode

## [1.8.0] — 2026-03-09

### Added

- **MCP Settings** — Gateway-side MCP server management UI
- **Skills tab** — Hidden on mobile, visible on desktop

## [1.7.0] — 2026-03-09

### Added

- **Plan Mode** — Cursor-style structured plan generation with Execute and Edit buttons; plans render step-by-step before any code is touched
- **Agent Mode — activity feed** — real-time action log shows tool calls, file edits, and status while the agent runs
- **Agent Mode — approval tiers** — granular permission levels (auto-apply, confirm, manual) per operation type
- **Agent Mode — auto-apply edits** — accepted diff hunks apply immediately without a separate confirm step
- **Codex theme** — new dark/light theme pair with ink-black backgrounds and warm accent tones
- **Skills UI redesign** — refined layout and typography for the skills panel
- **Mobile terminal tab** — bottom tab bar now surfaces a full-screen gateway terminal (replaces Settings shortcut)

### Fixed

- **Chat send race condition** — message text passed directly to the send handler instead of via `setInput` + `setTimeout`
- **Git sidebar action buttons** — inline buttons now only appear when a file is unstaged and in local mode

### Changed

- **Settings & WorkspaceSidebar** — unified spacing, removed stale automation references
- **Terminal chat relay** — `sendChatMessage` now handles `streaming` and `started` statuses; timeout extended to 2 min
- **Chat tab visibility** — Chat is now accessible from Classic and TUI modes via `visibleViews`
- **Dev URL** — reverted to port 3000 (port 3080 conflicted with localhost plugin)

### Removed

- Workshop view and related components — streamlined navigation

## [1.6.0] — 2026-03-09

### Added

- **GitHub Device Flow sign-in** — Authenticate with GitHub directly from the app without leaving the editor; username badge auto-appears after sign-in
- **GitHub hub in Settings** — Device Flow auth, PAT entry, starred favorites, and repo list in one place; secure token persistence on iOS via localStorage fallback
- **`tauri-plugin-http`** — Server-side HTTP plugin bypasses CORS restrictions for GitHub Device Flow on iOS
- **Mobile file explorer** — Browse and open repo files from chat home on mobile
- **Editor workflow tabs** — Streamlined editor view with workflow tab strip; files can be revealed from chat
- **Cross-platform desktop release assets** — GitHub releases now attach macOS (`.dmg`), Linux (`.AppImage`, `.deb`), and Windows (`.exe`, `.msi`) installers from the release workflow

### Fixed

- **iOS export compliance** — Added `ITSAppUsesNonExemptEncryption = false` to skip the TestFlight export compliance prompt
- **Mobile chat home layout** — Content pushed to top instead of vertical center for better reachability
- **Mobile connect section** — Collapses by default; gateway URL hidden behind a tap-to-reveal control

### Changed

- **Mobile tabs** — Skills replaces Workshop in the bottom tab bar
- **Version metadata aligned** — Synced app, Tauri, Rust, and Apple bundle versions for the 1.6.0 release

## [1.5.0] — 2026-03-08

### Added

- **GitHub project selector** — Connect to any GitHub repo from mobile chat home (`owner/repo` or full URL)
- **Settings tab on mobile** — Full settings panel accessible from bottom tab bar
- **Native-style tab bar** — Slim iOS-native tab bar with bare icons, labels, and haptic feedback (5ms vibration)

### Changed

- **Mobile tabs curated** — Chat, Editor, Git, Workshop, Settings (dropped desktop-only views: Skills, Preview, Diff)
- **44px touch targets** — Tab bar buttons meet iOS HIG minimum with `touch-manipulation` CSS
- **Hidden model picker on mobile** — Mode selector (Ask/Agent/Plan) stays, model name hidden to save space
- **Cleaner connect form** — Icon-prefixed inputs (globe + lock), focus rings, always-visible form
- **Mobile header polish** — Dynamic workspace name, smaller connection dot, reduced padding
- **Hidden chat header on mobile** — Saves 40px vertical space; session info available elsewhere
- **"Let's weave" branding** — Aligns with Knot Code identity (weaving/knots metaphor)
- **Minimal composer on mobile** — No branch pill, permissions toggle, or gateway status in toolbar

### Removed

- Suggestion cards on mobile (too cluttered on small screens)
- Open Folder / Clone Repo buttons on mobile (replaced by GitHub project selector)
- Mode switcher in mobile header (redundant with bottom tab bar)
- "Gateway active" status text row (colored dot is sufficient)
- KnotCode footer on mobile

## [1.4.0] — 2026-03-07

### Added

- **iOS support** — Tauri iOS builds for iPhone simulator (arm64)
- **Edge-to-edge display** — Native WKWebView configuration via Rust objc2 FFI (`contentInsetAdjustmentBehavior = .never`, `edgesForExtendedLayout = .all`)
- **Mobile-first defaults** — Fresh installs on small screens default to Chat mode instead of Classic/Editor
- **CSS safe area handling** — Content respects notch and home indicator via `env(safe-area-inset-*)`
- **Mobile layout** — Borderless, full-bleed shell frame on screens ≤768px
- **Mobile features** — QR connect, agent approval cards, session presence, caffeinate toggle
- **Settings panel** — Redesigned with Connect + General tabs, device list, QR code

### Fixed

- **iOS bottom gap** — WKWebView no longer constrained to safe area bounds
- **Dev mode URL** — `devUrl` corrected to Next.js dev server port (3000)

### Changed

- Added `objc2` v0.6.4 as direct Cargo dependency for iOS native interop
- iOS capabilities separated from desktop (`capabilities/mobile.json`)
- Desktop-only crates (`portable-pty`, `window-vibrancy`, `keyring`, etc.) gated with `#[cfg(not(target_os = "ios"))]`

## [1.1.0] — 2026-03-05

### Added

- **OpenClaw Dev persona** — Docs-aware ecosystem agent preset in Agent Builder with PR workflow, issue triage, architecture review, and security lens
- **Git sidebar panel** — Full git status, staging, and branch management in the sidebar
- **Linux AppImage** — Cross-platform release (x86_64)
- **Apple code signing & notarization** — macOS DMG signed with Developer ID and notarized by Apple
- **Comparison chart** — README now includes competitor averages column

### Fixed

- **Spotify login broken in production build** — Added `tauri-plugin-localhost` to serve assets via `http://localhost:3080` instead of `tauri://` custom protocol (#1)
- **YouTube Error 153** — Same localhost plugin fix resolves YouTube embed origin rejection (#2)

### Changed

- App size reduced from 8.4 MB to 7.8 MB (signed DMG)
- Improved component styles and layout consistency

## [1.0.0] — 2026-03-05

### Added

- Initial public release
- AI Agent Chat with Ask, Agent, and Plan modes
- Agent Builder wizard — 5 persona presets + custom system prompts
- Per-hunk diff review (accept/reject individual changes)
- 7 themes: Obsidian, Bone, Neon, Catppuccin, VooDoo, CyberNord, PrettyPink
- Monaco Editor with multi-tab, Vim mode, ⌘K inline edits, ⌘P quick open
- GitHub integration via device flow auth
- Integrated terminal (xterm.js) with gateway slash commands
- Spotify and YouTube plugins
- Tauri v2 desktop app (macOS Apple Silicon)
- Apache 2.0 license
