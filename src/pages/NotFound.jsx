import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <section className="not-found">
      {/* Decorative doodles */}
      <svg
        className="not-found-doodle not-found-doodle-star"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="var(--color-yellow)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 2L14 9L21 10L14 11L12 18L10 11L3 10L10 9L12 2Z" />
      </svg>
      <svg
        className="not-found-doodle not-found-doodle-bolt"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="var(--color-cyan)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
      </svg>
      <svg
        className="not-found-doodle not-found-doodle-sparkle"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="var(--color-pink)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 1l1.6 5.4L19 8l-5.4 1.6L12 15l-1.6-5.4L5 8l5.4-1.6L12 1z" />
      </svg>
      <svg
        className="not-found-doodle not-found-doodle-burst"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="12" y1="3" x2="12" y2="7" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <line x1="3" y1="12" x2="7" y2="12" />
        <line x1="17" y1="12" x2="21" y2="12" />
        <line x1="5.6" y1="5.6" x2="8.4" y2="8.4" />
        <line x1="15.6" y1="15.6" x2="18.4" y2="18.4" />
        <line x1="5.6" y1="18.4" x2="8.4" y2="15.6" />
        <line x1="15.6" y1="8.4" x2="18.4" y2="5.6" />
      </svg>

      <div className="not-found-card">
        <span className="not-found-emoji" aria-hidden="true">💀</span>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-tagline">
          This meme has left the chat.
        </p>
        <p className="not-found-text">
          The page you're looking for is no longer relevant. Or maybe it never
          was — like that one meme you forwarded to the group chat in 2019.
        </p>

        <Link to="/" className="not-found-cta">
          Take me back
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </Link>

        <span className="not-found-stamp" aria-hidden="true">
          Not Found
          <br />
          (lol)
        </span>
      </div>
    </section>
  )
}

export default NotFound
