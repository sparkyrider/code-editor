# KnotCode Desktop Workflow

This project is **desktop-first** (Tauri v2) with cross-platform support for macOS, Windows, and Linux.

## Primary Commands

```bash
pnpm desktop:dev          # Start desktop app for development
pnpm desktop:check        # Type-check (run before commits)
pnpm desktop:build        # Production build (.app only)
pnpm desktop:package      # Full package (all installer formats)
pnpm desktop:release      # Type-check + full package
pnpm desktop:sign         # macOS signing + notarization
pnpm desktop:build:debug  # Debug build (unoptimized, with devtools)
```

## Daily Workflow

1. Start app:
   ```bash
   pnpm desktop:dev
   ```
2. Make changes — hot reload applies instantly.
3. Validate before commit:
   ```bash
   pnpm desktop:check
   ```
4. Build when ready:
   ```bash
   pnpm desktop:build
   ```

## Release Workflow

```bash
pnpm release <version>          # Bump version, commit, tag
pnpm release <version> --push   # Same + push to trigger CI
```

CI will build for all platforms (macOS, Windows, Linux) and publish to GitHub Releases with checksums.

## Version Management

```bash
pnpm version:sync         # Sync version from package.json to all targets
pnpm version:check        # Verify all version locations match
```

Managed locations: `package.json`, `tauri.conf.json`, `Cargo.toml`, `project.yml`, `Info.plist`

## If Dev Gets Stuck

```bash
pnpm desktop:doctor       # Kill stale processes, remove lock files
pnpm desktop:dev
```

## Notes

- Tauri uses `beforeDevCommand: pnpm frontend:dev` and `beforeBuildCommand: pnpm frontend:build`
- `dev`, `build`, and `check` aliases map to desktop workflows
- Static export (`output: 'export'`) is used for all desktop/mobile builds
- iOS has a separate build path: `pnpm ios:dev` / `pnpm ios:build`
