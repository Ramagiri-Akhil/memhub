import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MemePreview from '../components/MemePreview'
import ReactionSimulator, {
  EMPTY_REACTIONS,
} from '../components/ReactionSimulator'
import { loadMeme } from '../utils/memeStorage'
import { getTemplate } from '../utils/memeTemplates'
import { DEFAULT_TEXT_CUSTOM } from '../utils/textCustomization'
import './MemeViewer.css'

// Returns true if `data` has the minimum shape required to render a meme.
// Defensive against missing keys or partial corruption.
function isValidMeme(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.image !== 'string' || data.image.length === 0) return false
  return true
}

function MemeViewer() {
  const { id } = useParams()
  const [meme, setMeme] = useState(null)
  const [status, setStatus] = useState('loading')
  const [reactions, setReactions] = useState(EMPTY_REACTIONS)

  useEffect(() => {
    if (!id) {
      setStatus('notFound')
      return
    }

    const data = loadMeme(id)
    if (!isValidMeme(data)) {
      setStatus('notFound')
      return
    }

    setMeme(data)
    setReactions({ ...EMPTY_REACTIONS, ...(data.reactions || {}) })
    setStatus('found')
  }, [id])

  function handleReact(key) {
    setReactions((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
  }

  if (status === 'loading') {
    return (
      <section className="meme-viewer-empty">
        <p>Loading meme…</p>
      </section>
    )
  }

  if (status === 'notFound') {
    return (
      <section className="meme-viewer-empty">
        <span className="meme-viewer-empty-emoji" aria-hidden="true">
          🤔
        </span>
        <h1 className="meme-viewer-empty-title">Meme not found</h1>
        <p className="meme-viewer-empty-text">
          This meme may have been removed, or it was created on another browser.
          Memes are stored per device — they don't travel with the link across
          browsers.
        </p>
        <Link to="/" className="meme-viewer-cta">
          Make your own meme
          <svg
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
        </Link>
      </section>
    )
  }

  return (
    <section className="meme-viewer">
      <header className="meme-viewer-header">
        <span className="meme-viewer-badge">
          <span className="meme-viewer-badge-dot" aria-hidden="true" />
          Shared meme
        </span>
        <h1 className="meme-viewer-title">Someone made you a meme</h1>
        {meme.mood && (
          <span className="meme-viewer-vibe" data-mood={meme.mood}>
            Vibe · {meme.mood}
          </span>
        )}
      </header>

      <MemePreview
        imageUrl={meme.image}
        topCaption={meme.topCaption}
        bottomCaption={meme.bottomCaption}
        topSize={meme.topSize}
        bottomSize={meme.bottomSize}
        textCustom={meme.textCustom || DEFAULT_TEXT_CUSTOM}
        stickers={meme.stickers || []}
        mood={meme.mood || 'reaction'}
        template={getTemplate(meme.templateId)}
        readOnly
      />

      <ReactionSimulator counts={reactions} onReact={handleReact} />

      <Link to="/" className="meme-viewer-cta">
        Make your own meme
        <svg
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
      </Link>
    </section>
  )
}

export default MemeViewer
