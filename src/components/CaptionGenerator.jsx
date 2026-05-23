import { useState } from 'react'
import { generateCaptions } from '../services/aiService'
import LoadingAnimation from './LoadingAnimation'
import MemeModeSelector from './MemeModeSelector'
import MemeSuggestionCard from './MemeSuggestionCard'
import './CaptionGenerator.css'

const MEME_MODES = ['Savage', 'Gen-Z', 'Dark Humor', 'Nerd', 'Cinematic']

function CaptionGenerator({ onApply, onMoodChange, image }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [mode, setMode] = useState(MEME_MODES[0])

  async function handleGenerate() {
    if (isLoading) return
    setIsLoading(true)
    setError('')
    try {
      const { suggestions: results, mood } = await generateCaptions({
        count: 4,
        image,
        mode,
      })
      setSuggestions(results)
      if (onMoodChange) onMoodChange(mood)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="caption-gen">
      <div className="caption-gen-header">
        <h2 className="caption-gen-title">
          <span className="caption-gen-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 1l1.6 5.4L19 8l-5.4 1.6L12 15l-1.6-5.4L5 8l5.4-1.6L12 1z" />
              <path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
            </svg>
          </span>
          AI Caption Ideas
        </h2>

        <button
          type="button"
          className="caption-gen-btn"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? 'Generating…' : 'Generate Funny Captions'}
        </button>
      </div>

      <MemeModeSelector modes={MEME_MODES} value={mode} onChange={setMode} />

      {isLoading && <LoadingAnimation />}

      {!isLoading && error && (
        <div className="caption-gen-error" role="alert">
          <span className="caption-gen-error-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <div className="caption-gen-error-body">
            <p className="caption-gen-error-title">Couldn't generate captions</p>
            <p className="caption-gen-error-message">{error}</p>
          </div>
          <button
            type="button"
            className="caption-gen-retry"
            onClick={handleGenerate}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && suggestions.length > 0 && (
        <div className="caption-gen-grid">
          {suggestions.map((s, i) => (
            <MemeSuggestionCard
              key={i}
              suggestion={s}
              onClick={onApply}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && suggestions.length === 0 && (
        <p className="caption-gen-hint">
          Pick a style above and tap the button to get AI meme previews.
        </p>
      )}
    </section>
  )
}

export default CaptionGenerator
