import { useRef, useState } from 'react'
import './ReactionSimulator.css'

export const REACTIONS = [
  { key: 'lol',    emoji: '😂', label: 'Laughing' },
  { key: 'fire',   emoji: '🔥', label: 'Fire' },
  { key: 'dead',   emoji: '💀', label: 'Dead' },
  { key: 'cry',    emoji: '😭', label: 'Crying' },
  { key: 'salute', emoji: '🫡', label: 'Salute' },
]

export const EMPTY_REACTIONS = REACTIONS.reduce((map, r) => {
  map[r.key] = 0
  return map
}, {})

const SPAM_THROTTLE_MS = 300

// Controlled component: parent owns `counts`, child reports a click via
// `onReact(key)`. Renders as a compact inline row — no card, no header.
function ReactionSimulator({ counts = EMPTY_REACTIONS, onReact }) {
  const [popKeys, setPopKeys] = useState({})
  const lastClickRef = useRef({})

  function handleClick(key) {
    const now = Date.now()
    const last = lastClickRef.current[key] || 0
    if (now - last < SPAM_THROTTLE_MS) return
    lastClickRef.current[key] = now

    onReact?.(key)
    setPopKeys((prev) => ({ ...prev, [key]: now }))
  }

  return (
    <div className="reactions" role="group" aria-label="React to this meme">
      {REACTIONS.map(({ key, emoji, label }) => (
        <button
          key={key}
          type="button"
          className="reaction-btn"
          onClick={() => handleClick(key)}
          aria-label={`React with ${label}`}
        >
          <span
            key={popKeys[key] || 0}
            className="reaction-emoji"
            aria-hidden="true"
          >
            {emoji}
          </span>
          <span key={counts[key] || 0} className="reaction-count">
            {counts[key] || 0}
          </span>
        </button>
      ))}
    </div>
  )
}

export default ReactionSimulator
