// localStorage-backed save/load for shareable memes. Keys are prefixed so
// they don't collide with other state we may store in the future.

const STORAGE_PREFIX = 'meme:'

export function saveMeme(id, data) {
  if (!id || typeof id !== 'string') {
    console.error('[memeStorage] save called with invalid id:', id)
    return false
  }
  if (!data || typeof data !== 'object') {
    console.error('[memeStorage] save called with invalid data')
    return false
  }

  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(data))
    return true
  } catch (err) {
    // QuotaExceededError, SecurityError (private mode), etc.
    console.error('[memeStorage] save failed:', err)
    return false
  }
}

export function loadMeme(id) {
  if (!id || typeof id !== 'string') return null

  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch (err) {
    console.error('[memeStorage] load failed:', err)
    return null
  }
}
