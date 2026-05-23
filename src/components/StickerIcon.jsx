// Shared sticker SVG renderer. One <svg> per type with hard-coded paths —
// kept inline so html2canvas captures them and so the LayersPanel and the
// MemePreview can both render the same icon at any size.
function StickerIcon({ type }) {
  if (type === 'star') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14 9L21 10L14 11L12 18L10 11L3 10L10 9L12 2Z" />
      </svg>
    )
  }
  if (type === 'fire') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c0 3.5-3 5-3 9 0 4.5 3 8 6 8s6-3 6-8c0-2-1-3-2-5-1 1.5-1.5 3-2.5 3-1 0-1.5-3-1.5-5 0-1.2-1-2-3-2z" />
      </svg>
    )
  }
  if (type === 'heart') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" />
      </svg>
    )
  }
  if (type === 'bolt') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
      </svg>
    )
  }
  if (type === 'sparkle') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1l1.6 5.4L19 8l-5.4 1.6L12 15l-1.6-5.4L5 8l5.4-1.6L12 1z" />
      </svg>
    )
  }
  if (type === 'smile') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="10" r="1.6" fill="#0a0a0c" />
        <circle cx="15" cy="10" r="1.6" fill="#0a0a0c" />
        <path
          d="M8 14 Q 12 17.5 16 14"
          stroke="#0a0a0c"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return null
}

export default StickerIcon
