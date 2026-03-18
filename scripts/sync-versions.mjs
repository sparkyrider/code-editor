#!/usr/bin/env node
/**
 * Single source of truth: package.json → all other version locations.
 *
 * Usage:
 *   node scripts/sync-versions.mjs            # sync from package.json
 *   node scripts/sync-versions.mjs 1.11.0     # set explicit version everywhere
 *   node scripts/sync-versions.mjs --check    # assert all locations match (exit 1 on drift)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const LOCATIONS = {
  'package.json': {
    read(content) {
      return JSON.parse(content).version
    },
    write(content, version) {
      const obj = JSON.parse(content)
      obj.version = version
      return JSON.stringify(obj, null, 2) + '\n'
    },
  },
  'src-tauri/tauri.conf.json': {
    read(content) {
      return JSON.parse(content).version
    },
    write(content, version) {
      const obj = JSON.parse(content)
      obj.version = version
      return JSON.stringify(obj, null, 2) + '\n'
    },
  },
  'src-tauri/Cargo.toml': {
    read(content) {
      const m = content.match(/^version\s*=\s*"([^"]+)"/m)
      return m ? m[1] : null
    },
    write(content, version) {
      return content.replace(/^(version\s*=\s*")[^"]+(")/m, `$1${version}$2`)
    },
  },
  'src-tauri/gen/apple/project.yml': {
    read(content) {
      const m = content.match(/CFBundleShortVersionString:\s*(\S+)/)
      return m ? m[1] : null
    },
    write(content, version) {
      return content
        .replace(/(CFBundleShortVersionString:\s*)\S+/, `$1${version}`)
        .replace(/(CFBundleVersion:\s*)"[^"]+"/, `$1"${version}"`)
    },
  },
  'src-tauri/gen/apple/app_iOS/Info.plist': {
    read(content) {
      const m = content.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/)
      return m ? m[1] : null
    },
    write(content, version) {
      return content
        .replace(
          /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+(<\/string>)/,
          `$1${version}$2`,
        )
        .replace(
          /(<key>CFBundleVersion<\/key>\s*<string>)[^<]+(<\/string>)/,
          `$1${version}$2`,
        )
    },
  },
}

function readVersions() {
  const versions = {}
  for (const [file, handler] of Object.entries(LOCATIONS)) {
    const fullPath = resolve(root, file)
    try {
      const content = readFileSync(fullPath, 'utf8')
      versions[file] = handler.read(content)
    } catch {
      versions[file] = null
    }
  }
  return versions
}

function check() {
  const versions = readVersions()
  const source = versions['package.json']
  let ok = true

  console.log(`\n  Version contract check (source: package.json → ${source})\n`)

  for (const [file, ver] of Object.entries(versions)) {
    if (ver === source) {
      console.log(`  ✓ ${file.padEnd(45)} ${ver}`)
    } else {
      console.log(`  ✗ ${file.padEnd(45)} ${ver ?? 'NOT FOUND'} (expected ${source})`)
      ok = false
    }
  }

  console.log('')
  if (!ok) {
    console.error('  Version drift detected. Run: pnpm version:sync\n')
    process.exit(1)
  }
  console.log('  All versions in sync.\n')
}

function sync(version) {
  console.log(`\n  Syncing all version locations → ${version}\n`)

  for (const [file, handler] of Object.entries(LOCATIONS)) {
    const fullPath = resolve(root, file)
    try {
      const content = readFileSync(fullPath, 'utf8')
      const current = handler.read(content)
      if (current === version) {
        console.log(`  · ${file.padEnd(45)} ${version} (unchanged)`)
        continue
      }
      const updated = handler.write(content, version)
      writeFileSync(fullPath, updated)
      console.log(`  ✓ ${file.padEnd(45)} ${current ?? '?'} → ${version}`)
    } catch (e) {
      console.error(`  ✗ ${file.padEnd(45)} ${e.message}`)
      process.exit(1)
    }
  }

  console.log('\n  Done.\n')
}

// ── CLI ────────────────────────────────────────────────────────────
const arg = process.argv[2]

if (arg === '--check') {
  check()
} else {
  const version = arg || JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version
  if (!/^\d+\.\d+\.\d+/.test(version)) {
    console.error(`Invalid version: ${version}`)
    process.exit(1)
  }
  sync(version)
}
