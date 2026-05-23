import { useEffect, useState } from 'react'
import './ReactionBar.css'

// Picks a starting value from the prop, falling back to 0 if not provided.
function getInitial(reactions) {
  return {
    laughs: reactions?.laughs ?? 0,
    hype: reactions?.hype ?? 0,
    viralScore: reactions?.viralScore ?? 0,
  }
}

function ReactionBar({ reactions }) {
  const [counts, setCounts] = useState(() => getInitial(reactions))

  // When the parent passes a new `reactions` object (e.g. a new meme),
  // reset our internal counts back to that baseline.
  useEffect(() => {
    setCounts(getInitial(reactions))
  }, [reactions])

  // Tick the numbers up every 3 seconds for a "live engagement" feel.
  useEffect(() => {
    const id = setInterval(() => {
      setCounts((prev) => ({
        laughs: prev.laughs + Math.floor(Math.random() * 5) + 1,
        hype: prev.hype + Math.floor(Math.random() * 3) + 1,
        viralScore: Math.min(
          99,
          prev.viralScore + Math.floor(Math.random() * 2)
        ),
      }))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="reaction-bar" role="status" aria-live="polite">
      <div className="reaction-bar-item">
        <span className="reaction-bar-emoji" aria-hidden="true">😂</span>
        <div className="reaction-bar-data">
          <span className="reaction-bar-label">Laughs</span>
          <span key={counts.laughs} className="reaction-bar-count">
            {counts.laughs.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="reaction-bar-item">
        <span className="reaction-bar-emoji" aria-hidden="true">🔥</span>
        <div className="reaction-bar-data">
          <span className="reaction-bar-label">Hype</span>
          <span key={counts.hype} className="reaction-bar-count">
            {counts.hype.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="reaction-bar-item reaction-bar-item-viral">
        <span className="reaction-bar-emoji" aria-hidden="true">📈</span>
        <div className="reaction-bar-data">
          <span className="reaction-bar-label">Viral Score</span>
          <span key={counts.viralScore} className="reaction-bar-count">
            {counts.viralScore}%
          </span>
        </div>
        <div className="reaction-bar-progress" aria-hidden="true">
          <div
            className="reaction-bar-progress-fill"
            style={{ width: `${counts.viralScore}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default ReactionBar
