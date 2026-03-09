/**
 * Persistent storage for favorite and recent GitHub repos.
 * Uses localStorage with simple JSON serialization.
 */

export interface SavedRepo {
  fullName: string   // e.g. "OpenKnots/code-editor"
  name: string       // e.g. "code-editor"
  owner: string      // e.g. "OpenKnots"
  defaultBranch: string
  addedAt: number    // timestamp
}

const FAVORITES_KEY = 'code-editor:gh-favorites'
const RECENTS_KEY = 'code-editor:gh-recents'
const MAX_RECENTS = 10

function load(key: string): SavedRepo[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch { return [] }
}

function save(key: string, repos: SavedRepo[]) {
  try { localStorage.setItem(key, JSON.stringify(repos)) } catch {}
}

// ─── Favorites ─────────────────────────────────────────────────

export function getFavorites(): SavedRepo[] {
  return load(FAVORITES_KEY)
}

export function addFavorite(repo: SavedRepo): SavedRepo[] {
  const current = load(FAVORITES_KEY)
  const updated = [repo, ...current.filter(r => r.fullName !== repo.fullName)]
  save(FAVORITES_KEY, updated)
  return updated
}

export function removeFavorite(fullName: string): SavedRepo[] {
  const updated = load(FAVORITES_KEY).filter(r => r.fullName !== fullName)
  save(FAVORITES_KEY, updated)
  return updated
}

export function isFavorite(fullName: string): boolean {
  return load(FAVORITES_KEY).some(r => r.fullName === fullName)
}

// ─── Recents ───────────────────────────────────────────────────

export function getRecents(): SavedRepo[] {
  return load(RECENTS_KEY)
}

export function addRecent(repo: SavedRepo): SavedRepo[] {
  const current = load(RECENTS_KEY)
  const updated = [
    { ...repo, addedAt: Date.now() },
    ...current.filter(r => r.fullName !== repo.fullName),
  ].slice(0, MAX_RECENTS)
  save(RECENTS_KEY, updated)
  return updated
}

export function clearRecents(): SavedRepo[] {
  save(RECENTS_KEY, [])
  return []
}
