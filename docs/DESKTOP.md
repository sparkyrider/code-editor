# Desktop Application (Tauri v2)

## Overview

KnotCode ships as a native desktop application for **macOS**, **Windows**, and **Linux** via [Tauri v2](https://v2.tauri.app). Tauri wraps the system's native WebView (WebKit on macOS, WebView2 on Windows, WebKitGTK on Linux) instead of bundling Chromium, resulting in a ~10 MB binary.

## Architecture

```
┌────────────────────────────────────┐
│       Native Desktop App           │
│                                    │
│  ┌──────────────────────────────┐  │
│  │     System WebView           │  │
│  │                              │  │
│  │   Next.js Static Export      │  │
│  │   (HTML / CSS / JS bundle)   │  │
│  │                              │  │
│  └──────────────┬───────────────┘  │
│                 │                  │
│  ┌──────────────┴───────────────┐  │
│  │    Rust Backend (Tauri v2)    │  │
│  │    - Window management        │  │
│  │    - Local filesystem + git   │  │
│  │    - Terminal / PTY           │  │
│  │    - Keychain secrets         │  │
│  │    - IPC bridge               │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

## Platform Matrix

| Platform              | Installer             | Status    |
| --------------------- | --------------------- | --------- |
| macOS (Apple Silicon) | `.dmg`                | Supported |
| Windows (x64)         | `.msi`, `.exe` (NSIS) | Supported |
| Linux (x64)           | `.AppImage`, `.deb`   | Supported |

## Prerequisites

### Rust Toolchain

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version
```

### Platform-Specific

- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with "Desktop development with C++" workload, plus [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- **Linux**: `libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf`

### Node.js + pnpm

```bash
node --version   # v20+ required
pnpm --version
```

## Development

```bash
pnpm install
pnpm desktop:dev          # Tauri dev mode + hot reload
```

The dev window connects to `http://localhost:3000` with full hot reload. First run compiles ~300 Rust crates (2-5 min); subsequent runs are fast.

## Production Build

```bash
pnpm desktop:build        # Production .app bundle
pnpm desktop:package      # Full installer package (all bundle targets)
pnpm desktop:release      # Type-check + package
```

Output:

```
src-tauri/target/release/bundle/
├── dmg/        # macOS .dmg
├── appimage/   # Linux .AppImage
├── deb/        # Linux .deb
├── msi/        # Windows .msi
└── nsis/       # Windows .exe (NSIS)
```

## Release Process

1. Bump version: `pnpm release <version>` (updates all locations via `sync-versions.mjs`)
2. Push tag: `git push origin HEAD --tags`
3. CI builds all platforms via `.github/workflows/release.yml`
4. Assets + checksums published to GitHub Releases

### macOS Signing & Notarization

For signed releases, configure secrets per `.env.signing.example` and run:

```bash
pnpm desktop:sign
```

Or run `scripts/sign-and-deploy.sh` directly with the required environment variables.

## If Dev Gets Stuck

```bash
pnpm desktop:doctor       # Kill stale processes, clear locks
pnpm desktop:dev
```

## File Structure

```
src-tauri/
├── Cargo.toml              # Rust dependencies
├── tauri.conf.json         # App config, bundle targets, iOS section
├── build.rs                # Build hook
├── Entitlements.plist      # macOS entitlements for signing
├── Info.ios.plist           # iOS-specific plist overrides
├── capabilities/
│   ├── default.json        # Desktop security capabilities
│   └── mobile.json         # Mobile security capabilities
├── icons/                  # App icons (all platforms)
├── gen/apple/              # Generated iOS/macOS project files
└── src/
    ├── main.rs             # Desktop entry point
    ├── lib.rs              # App builder + platform branching
    ├── local_fs.rs         # Local filesystem commands
    ├── terminal.rs         # PTY terminal management
    └── engine.rs           # Gateway engine lifecycle
```
