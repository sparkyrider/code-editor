#!/usr/bin/env node
/**
 * Unified build & run script for Knot Code.
 *
 * Usage:
 *   pnpm run:web              # dev server (web)
 *   pnpm run:web --build      # production build + start (web)
 *   pnpm run:desktop           # dev mode (desktop / Tauri)
 *   pnpm run:desktop --build   # production build (desktop / Tauri)
 */

import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)

const target = args.find(a => a === 'web' || a === 'desktop')
const isBuild = args.includes('--build') || args.includes('-b')

if (!target) {
  console.error(`
  Usage:  pnpm run:web [--build]
          pnpm run:desktop [--build]

  Targets
    web        Next.js web application
    desktop    Tauri desktop application

  Flags
    --build    Production build (+ start for web, bundle for desktop)
`)
  process.exit(1)
}

const run = (cmd) => {
  console.log(`\n  → ${cmd}\n`)
  execSync(cmd, { stdio: 'inherit', cwd: root })
}

if (target === 'web') {
  if (isBuild) {
    run('pnpm build')
    run('pnpm start')
  } else {
    run('pnpm dev')
  }
} else {
  if (isBuild) {
    run('pnpm tauri:build')
  } else {
    run('pnpm tauri:dev')
  }
}
