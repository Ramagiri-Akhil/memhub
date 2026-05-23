// Font preset key → CSS font-family stack.
// Bowlby One is the new default meme font — chunky, rounded, very meme-coded.
// The others remain available so users can swap via the Text Customization panel.
export const FONT_FAMILIES = {
  bowlby: '"Bowlby One", "Anton", Impact, "Arial Black", sans-serif',
  impact: 'Impact, "Anton", "Arial Black", sans-serif',
  anton: '"Anton", Impact, "Arial Black", sans-serif',
  comic: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive',
  cinematic: '"Bricolage Grotesque", Georgia, "Times New Roman", serif',
}

// Sensible starting point — classic meme look with Bowlby One.
export const DEFAULT_TEXT_CUSTOM = {
  font: 'bowlby',
  color: '#ffffff',
  outline: true,
  glow: false,
  shadow: true,
  bold: false,
}

// AI mood → preset to auto-fill the customization panel after a generation.
// Users can override any of these via the panel.
export const MOOD_PRESETS = {
  cinematic: { font: 'cinematic', color: '#fef3c7', outline: true, glow: true, shadow: true, bold: false },
  chaotic:   { font: 'bowlby',    color: '#fde047', outline: true, glow: true, shadow: false, bold: true },
  wholesome: { font: 'comic',     color: '#fff7ed', outline: true, glow: false, shadow: true, bold: true },
  dark:      { font: 'bowlby',    color: '#f3f4f6', outline: true, glow: false, shadow: true, bold: true },
  funny:     { font: 'bowlby',    color: '#fef08a', outline: true, glow: true, shadow: true, bold: true },
  reaction:  DEFAULT_TEXT_CUSTOM,
}

export function getMoodPreset(mood) {
  return MOOD_PRESETS[mood] || DEFAULT_TEXT_CUSTOM
}

// Builds the inline style object applied to a meme caption span.
// Combines the user's customization with the per-caption font size.
export function buildCaptionStyle(custom, fontSize) {
  const style = {}

  if (fontSize) style.fontSize = `${fontSize}px`

  const fontKey = custom?.font
  if (fontKey && FONT_FAMILIES[fontKey]) {
    style.fontFamily = FONT_FAMILIES[fontKey]
  }

  if (custom?.color) {
    style.color = custom.color
  }

  style.fontWeight = custom?.bold ? 800 : 400

  // Build the text-shadow stack from the active toggles.
  const shadows = []

  if (custom?.outline) {
    const c = '#000'
    shadows.push(
      `-2px -2px 0 ${c}`,
      `2px -2px 0 ${c}`,
      `-2px 2px 0 ${c}`,
      `2px 2px 0 ${c}`,
      `0 -2px 0 ${c}`,
      `0 2px 0 ${c}`,
      `-2px 0 0 ${c}`,
      `2px 0 0 ${c}`,
    )
  }

  if (custom?.glow) {
    const glowColor = custom?.color || '#ffffff'
    shadows.push(`0 0 14px ${glowColor}`)
    shadows.push(`0 0 28px ${glowColor}`)
  }

  if (custom?.shadow) {
    shadows.push('0 4px 12px rgba(0, 0, 0, 0.75)')
  }

  style.textShadow = shadows.length > 0 ? shadows.join(', ') : 'none'

  // Pair text-stroke with paint-order so the outline doesn't eat letters.
  style.WebkitTextStroke = custom?.outline ? '3px #000' : '0'
  style.paintOrder = 'stroke fill'

  return style
}
