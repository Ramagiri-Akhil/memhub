import { useState } from 'react'
import { getTemplate } from '../utils/memeTemplates'
import './MemeSuggestionCard.css'

function formatCount(n) {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return String(n)
}

function MemeSuggestionCard({ suggestion, onClick }) {
  const template = getTemplate(suggestion.template)

  // Stable per-card simulated engagement — set once on mount.
  const [stats] = useState(() => ({
    laughs: Math.floor(Math.random() * 4900) + 120,
    hype: Math.floor(Math.random() * 1900) + 60,
  }))

  const top = suggestion.captions?.top || ''
  const bottom = suggestion.captions?.bottom || ''
  const topShow = Boolean(template.slots.top?.show) && Boolean(top)
  const bottomShow = Boolean(template.slots.bottom?.show) && Boolean(bottom)

  return (
    <article className="suggestion-card">
      <header className="suggestion-card-header">
        <h3 className="suggestion-card-title">#{suggestion.template}</h3>
        {suggestion.color && (
          <span
            className="suggestion-card-color"
            style={{ backgroundColor: suggestion.color }}
            aria-label={`Color ${suggestion.color}`}
          />
        )}
      </header>

      <div className="suggestion-card-captions">
        {topShow && (
          <p className="suggestion-card-caption">{top}</p>
        )}
        {topShow && bottomShow && (
          <span className="suggestion-card-divider" aria-hidden="true">
            ·  ·  ·
          </span>
        )}
        {bottomShow && (
          <p className="suggestion-card-caption">{bottom}</p>
        )}
      </div>

      <div className="suggestion-card-stats">
        <span className="suggestion-card-stat">
          <span aria-hidden="true">😂</span> {formatCount(stats.laughs)}
        </span>
        <span className="suggestion-card-stat">
          <span aria-hidden="true">🔥</span> {formatCount(stats.hype)}
        </span>
      </div>

      <button
        type="button"
        className="suggestion-card-cta"
        onClick={() => onClick(suggestion)}
      >
        Use This Meme
        <svg
          className="suggestion-card-cta-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </button>
    </article>
  )
}

export default MemeSuggestionCard
