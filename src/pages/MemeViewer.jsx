import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MemePreview from '../components/MemePreview'
import ReactionSimulator from '../components/ReactionSimulator'
import AudienceIndicator from '../components/AudienceIndicator'
import { api } from '../services/api'
import { useMemeReactions } from '../hooks/useMemeReactions'
import { getTemplate } from '../utils/memeTemplates'
import { DEFAULT_TEXT_CUSTOM } from '../utils/textCustomization'
import './MemeViewer.css'

// Defensive check on the payload returned by the backend.
function isValidMeme(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.image !== 'string' || data.image.length === 0) return false
  return true
}

function MemeViewer() {
  const { id } = useParams()
  const [meme, setMeme] = useState(null)
  const [status, setStatus] = useState('loading')

  // Hook joins the meme room and streams live reaction updates. We pass
  // the id only once the meme is confirmed to exist so we don't open a
  // room for a missing meme.
  const { reactions, react, viewerCount } = useMemeReactions(
    status === 'found' ? id : null
  )

  useEffect(() => {
    if (!id) {
      setStatus('notFound')
      return
    }

    let cancelled = false
    setStatus('loading')

    api
      .get(`/memes/${id}`)
      .then((res) => {
        if (cancelled) return
        const data = res.data?.data
        if (isValidMeme(data)) {
          setMeme(data)
          setStatus('found')
        } else {
          setStatus('notFound')
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load meme:', err)
        setStatus('notFound')
      })

    return () => {
      cancelled = true
    }
  }, [id])

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
          This meme may have expired or been removed. Memes are stored
          in-memory for the hackathon — they vanish when the backend restarts.
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
          Shared meme · live
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

      <AudienceIndicator count={viewerCount} />

      <ReactionSimulator counts={reactions} onReact={react} />

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
