import { useState } from 'react'
import { generateCaptions } from '../services/aiService'
import LoadingAnimation from './LoadingAnimation'
import MemeSuggestionCard from './MemeSuggestionCard'
import './CaptionGenerator.css'

const LANGUAGES = [
  { id: 'Hindi',     label: '🇮🇳 Hindi' },
  { id: 'Telugu',    label: '🌶️ Telugu' },
  { id: 'Hyderabad', label: '🍗 Hyderabadi' },
  { id: 'English',   label: '🌐 English' },
]

const STYLES = [
  { id: 'Savage',     label: '🔥 Savage' },
  { id: 'Gen-Z',      label: '✨ Gen-Z' },
  { id: 'Dark Humor', label: '💀 Dark' },
  { id: 'Nerd',       label: '🤓 Nerd' },
  { id: 'Cinematic',  label: '🎬 Cinematic' },
]

function CaptionGenerator({ onApply, onMoodChange, onValidationFail, image }) {
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [language, setLanguage]       = useState(null)  // null = step 1
  const [style, setStyle]             = useState(null)  // null = step 2

  const isLocked = !image

  // Step 1 → Step 2
  function handleLanguageSelect(id) {
    setLanguage(id)
    setStyle(null)
    setSuggestions([])
    setError('')
  }

  // Back to Step 1
  function handleBack() {
    setLanguage(null)
    setStyle(null)
    setSuggestions([])
    setError('')
  }

  async function handleGenerate(selectedStyle) {
    if (isLoading) return
    if (isLocked) { onValidationFail?.(); return }

    setIsLoading(true)
    setError('')
    try {
      const { suggestions: results, mood } = await generateCaptions({
        count: 4,
        image,
        language,
        style: selectedStyle,
      })
      setSuggestions(results)
      onMoodChange?.(mood)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleStyleSelect(id) {
    setStyle(id)
    setSuggestions([])
    setError('')
    handleGenerate(id)
  }

  return (
    <section className="caption-gen">

      {/* Header */}
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
      </div>

      {/* STEP 1 — Language */}
      {!language && (
        <div className="caption-gen-step caption-gen-step--reveal">
          <p className="caption-gen-step-label">Pick a Language</p>
          <div className="caption-gen-chip-row">
            {LANGUAGES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className="caption-gen-chip"
                onClick={() => handleLanguageSelect(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Style (language selected, not yet generating) */}
      {language && !isLoading && (
        <div className="caption-gen-step caption-gen-step--reveal">
          <div className="caption-gen-step-header">
            <button type="button" className="caption-gen-back" onClick={handleBack}>
              ← {LANGUAGES.find(l => l.id === language)?.label}
            </button>
            <p className="caption-gen-step-label">Pick a Style</p>
          </div>
          <div className="caption-gen-chip-row">
            {STYLES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`caption-gen-chip ${style === id ? 'is-active' : ''}`}
                onClick={() => handleStyleSelect(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingAnimation />}

      {/* Error */}
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
          <button type="button" className="caption-gen-retry" onClick={() => handleGenerate(style)}>
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && suggestions.length > 0 && (
        <div className="caption-gen-grid">
          {suggestions.map((s, i) => (
            <MemeSuggestionCard key={i} suggestion={s} onClick={onApply} />
          ))}
        </div>
      )}

      {/* Hint — only on step 1 */}
      {!language && (
        <p className="caption-gen-hint">
          Pick a language to get started 👆
        </p>
      )}

    </section>
  )
}

export default CaptionGenerator