// Inline SVG paths for each sticker type. `viewBox` is always 0 0 24 24
// so the LayersPanel and MemePreview can size them freely.
export const STICKER_TYPES = {
  star: {
    label: 'Star',
    color: '#fbbf24',
  },
  fire: {
    label: 'Fire',
    color: '#f97316',
  },
  heart: {
    label: 'Heart',
    color: '#ec4899',
  },
  bolt: {
    label: 'Bolt',
    color: '#facc15',
  },
  sparkle: {
    label: 'Sparkle',
    color: '#38bdf8',
  },
  smile: {
    label: 'Smile',
    color: '#fde047',
  },
}

// Builds a unique-enough id for a new sticker instance.
export function createSticker(type) {
  return {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
  }
}
