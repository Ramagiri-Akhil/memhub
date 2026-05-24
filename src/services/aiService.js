import { api } from './api'

const ALLOWED_MOODS = [
  'cinematic',
  'chaotic',
  'wholesome',
  'dark',
  'reaction',
  'funny',
]

const ALLOWED_TEMPLATES = [
  'classic',
  'headline',
  'banner',
  'demotivator',
  'comic',
  'cinematic',
]

const ALLOWED_FONTS = ['bowlby', 'impact', 'anton', 'comic', 'cinematic']

function normalizeMood(value) {
  if (typeof value !== 'string') return 'reaction'
  const lower = value.toLowerCase().trim()
  return ALLOWED_MOODS.includes(lower) ? lower : 'reaction'
}

function isValidHex(value) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
}

function isPercent(value) {
  return typeof value === 'string' && /^\d+(\.\d+)?%$/.test(value)
}

function sanitizeCaptions(value) {
  if (!value || typeof value !== 'object') return null
  const top = typeof value.top === 'string' ? value.top.trim() : ''
  const bottom = typeof value.bottom === 'string' ? value.bottom.trim() : ''
  if (!top && !bottom) return null
  return { top, bottom }
}

function sanitizePositions(value) {
  if (!value || typeof value !== 'object') return null
  const result = {}
  if (isPercent(value.top)) result.top = { top: value.top }
  if (isPercent(value.bottom)) result.bottom = { bottom: value.bottom }
  return Object.keys(result).length > 0 ? result : null
}

function normalizeSuggestion(raw) {
  if (!raw || typeof raw !== 'object') return null

  const captions = sanitizeCaptions(raw.captions)
  if (!captions) return null

  const templateValue =
    typeof raw.template === 'string' ? raw.template.toLowerCase().trim() : ''
  const template = ALLOWED_TEMPLATES.includes(templateValue)
    ? templateValue
    : 'classic'

  const fontValue =
    typeof raw.font === 'string' ? raw.font.toLowerCase().trim() : ''
  const font = ALLOWED_FONTS.includes(fontValue) ? fontValue : null

  const color = isValidHex(raw.color) ? raw.color : null

  const rawStyles =
    raw.styles && typeof raw.styles === 'object' ? raw.styles : raw

  const styles = {
    outline: typeof rawStyles.outline === 'boolean' ? rawStyles.outline : null,
    glow: typeof rawStyles.glow === 'boolean' ? rawStyles.glow : null,
    shadow: typeof rawStyles.shadow === 'boolean' ? rawStyles.shadow : null,
    bold: typeof rawStyles.bold === 'boolean' ? rawStyles.bold : null,
  }

  const positions = sanitizePositions(raw.positions)

  return { template, captions, font, color, styles, positions }
}

// Calls POST /generate-captions on the Express backend.
// Returns { suggestions, mood } where each suggestion is a validated recipe.
export async function generateCaptions({
  count = 4,
  image = null,
  language = null,  // 'Hindi' | 'Telugu' | 'Hyderabad' | 'English'
  style = null,     // 'Savage' | 'Gen-Z' | 'Dark Humor' | 'Nerd' | 'Cinematic'
} = {}) {
  try {
    const res = await api.post('/generate-captions', { count, image, language, style })
    console.log('[aiService] response data:', res.data)

    const data = res.data

    const rawList = Array.isArray(data?.suggestions)
      ? data.suggestions
      : Array.isArray(data?.captions)
        ? data.captions.map((c) => ({ template: 'classic', captions: c }))
        : []

    if (rawList.length === 0) {
      console.error('[aiService] unexpected response shape:', data)
      throw new Error('Server response did not include any meme recipes.')
    }

    const suggestions = rawList.map(normalizeSuggestion).filter(Boolean)

    if (suggestions.length === 0) {
      throw new Error('AI response was malformed — no usable recipes.')
    }

    return {
      suggestions,
      mood: normalizeMood(data?.mood),
    }
  } catch (err) {
    console.error('[aiService] generateCaptions failed:', err)

    if (err.response) {
      const serverMessage =
        err.response.data?.message || err.response.data?.error
      throw new Error(
        serverMessage ||
          `Server returned status ${err.response.status}. Please try again.`
      )
    }
    if (err.request) {
      throw new Error(
        'No response from the server. Is the backend running on the expected port?'
      )
    }
    throw new Error(
      err.message || 'Could not generate captions. Please try again.'
    )
  }
}