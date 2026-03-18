#!/usr/bin/env node
/**
 * Release helper — bumps version across ALL targets, commits, tags, and optionally pushes.
 *
 * Usage:
 *   pnpm release <version> [--push]
 *
 * Examples:
 *   pnpm release 1.11.0          # bump + tag locally
 *   pnpm release 1.11.0 --push   # bump + tag + push (triggers CI release)
 *
 * Bumps: package.json, tauri.conf.json, Cargo.toml, project.yml, Info.plist
 */

import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const version = args.find(a => /^\d+\.\d+\.\d+(\S+)?$/.test(a))

if (!version) {
  console.error('Usage: pnpm release <version>  e.g. pnpm release 1.11.0 --push')
  process.exit(1)
}

const shouldPush = args.includes('--push') || args.includes('-p')

// ── Verify working tree is clean ───────────────────────────────────────────
try {
  const status = execSync('git status --porcelain', { cwd: root }).toString().trim()
  if (status) {
    console.error('Working tree is dirty — commit or stash your changes first.')
    process.exit(1)
  }
} catch {
  console.error('Git not available or not a git repo.')
  process.exit(1)
}

// ── Bump ALL version locations via sync-versions ──────────────────────────
execSync(`node scripts/sync-versions.mjs ${version}`, { stdio: 'inherit', cwd: root })

// ── Verify they all match ─────────────────────────────────────────────────
execSync('node scripts/sync-versions.mjs --check', { stdio: 'inherit', cwd: root })

// ── Commit & tag ──────────────────────────────────────────────────────────
const tag = `v${version}`
const filesToStage = [
  'package.json',
  'src-tauri/tauri.conf.json',
  'src-tauri/Cargo.toml',
  'src-tauri/gen/apple/project.yml',
  'src-tauri/gen/apple/app_iOS/Info.plist',
].join(' ')

execSync(`git add ${filesToStage}`, { stdio: 'inherit', cwd: root })
execSync(`git commit -m "chore: release ${tag}"`, { stdio: 'inherit', cwd: root })
execSync(`git tag ${tag}`, { stdio: 'inherit', cwd: root })
console.log(`\n  Tagged ${tag}`)

// ── Push ──────────────────────────────────────────────────────────────────
if (shouldPush) {
  execSync('git push origin HEAD --tags', { stdio: 'inherit', cwd: root })
  console.log(`  Pushed to origin — the GitHub Actions release workflow will start shortly.\n`)
  console.log(`  Monitor at: https://github.com/OpenKnots/code-editor/actions\n`)
} else {
  console.log(`\n  Run the following to trigger the release workflow:\n`)
  console.log(`    git push origin HEAD --tags\n`)
}
