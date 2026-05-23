import { useRef, useState } from 'react'
import './ReactionSimulator.css'

// Keys ARE the emojis — matches the backend's REACTION_EMOJIS list so
// reaction counts can flow straight through the Socket.IO payload.
export const REACTIONS = [
  { key: '😂', label: 'Laughing' },
  { key: '🔥', label: 'Fire' },
  { key: '💀', label: 'Dead' },
  { key: '😮', label: 'Shocked' },
  { key: '🤯', label: 'Mindblown' },
]

export const EMPTY_REACTIONS = REACTIONS.reduce((map, r) => {
  map[r.key] = 0
  return map
}, {})

const SPAM_THROTTLE_MS = 300

// Controlled component: parent owns `counts`, child reports a click via
// `onReact(key)`. Renders a compact inline row — ONE emoji + ONE count
// per reaction button. No duplicated elements.
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
      {REACTIONS.map((reaction) => {
        // Coerce to Number so a stray string from storage can't break math
        // or accidentally render extra characters.
        const count = Number(counts[reaction.key]) || 0
        const popKey = popKeys[reaction.key] || 0

        return (
          <button
            key={reaction.key}
            type="button"
            className="reaction-btn"
            onClick={() => handleClick(reaction.key)}
            aria-label={`React with ${reaction.label}`}
          >
            {/* Single emoji — re-keyed on click to retrigger the bounce. */}
            <span
              key={`emoji-${popKey}`}
              className="reaction-emoji"
              aria-hidden="true"
            >
              {reaction.key}
            </span>

            {/* Single count — re-keyed on value change to retrigger the pop. */}
            <span key={`count-${count}`} className="reaction-count">
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ReactionSimulator
