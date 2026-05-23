// A meme template is a pure data recipe describing:
//   - slots:        which text slots are visible and where they sit
//   - textDefaults: the starting text customization (font / color / styles)
//   - overlays:     decorative layers rendered behind the text
//
// MemePreview reads this recipe and renders generically — no template needs
// custom JSX. Adding a 7th template is just adding another entry below.

export const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Top + bottom Impact captions',
    slots: {
      top:    { show: true,  position: { top: '3%' },    align: 'center' },
      bottom: { show: true,  position: { bottom: '3%' }, align: 'center' },
    },
    textDefaults: {
      font: 'bowlby', color: '#ffffff',
      outline: true, glow: false, shadow: true, bold: false,
    },
    overlays: [],
  },

  headline: {
    id: 'headline',
    name: 'Headline',
    description: 'Big single line at top',
    slots: {
      top:    { show: true,  position: { top: '6%' }, align: 'center' },
      bottom: { show: false },
    },
    textDefaults: {
      font: 'bowlby', color: '#fbbf24',
      outline: true, glow: false, shadow: true, bold: true,
    },
    overlays: [],
  },

  banner: {
    id: 'banner',
    name: 'Banner',
    description: 'Black banner under the image',
    slots: {
      top:    { show: false },
      bottom: { show: true, position: { bottom: '8%' }, align: 'center' },
    },
    textDefaults: {
      font: 'bowlby', color: '#ffffff',
      outline: false, glow: false, shadow: false, bold: false,
    },
    overlays: ['banner-bottom'],
  },

  demotivator: {
    id: 'demotivator',
    name: 'Demotivator',
    description: 'Movie poster frame',
    slots: {
      top:    { show: false },
      bottom: { show: true, position: { bottom: '5%' }, align: 'center' },
    },
    textDefaults: {
      font: 'cinematic', color: '#ffffff',
      outline: false, glow: false, shadow: true, bold: false,
    },
    overlays: ['frame-black'],
  },

  comic: {
    id: 'comic',
    name: 'Comic',
    description: 'Comic Sans, wholesome vibes',
    slots: {
      top:    { show: true, position: { top: '4%' },    align: 'center' },
      bottom: { show: true, position: { bottom: '4%' }, align: 'center' },
    },
    textDefaults: {
      font: 'comic', color: '#0a0a0c',
      outline: false, glow: false, shadow: false, bold: true,
    },
    overlays: [],
  },

  cinematic: {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Letterbox with golden serif',
    slots: {
      top:    { show: true, position: { top: '5%' },    align: 'center' },
      bottom: { show: true, position: { bottom: '5%' }, align: 'center' },
    },
    textDefaults: {
      font: 'cinematic', color: '#fef3c7',
      outline: false, glow: true, shadow: true, bold: false,
    },
    overlays: ['cinematic-letterbox'],
  },
}

export function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES.classic
}
