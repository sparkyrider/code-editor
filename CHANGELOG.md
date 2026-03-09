# Changelog

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
