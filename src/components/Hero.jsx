import './Hero.css'

function Hero() {
  return (
    <section className="brand-panel">
      {/* Scattered doodles */}
      <svg
        className="brand-doodle brand-doodle-star"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="var(--color-pink)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 2L14 9L21 10L14 11L12 18L10 11L3 10L10 9L12 2Z" />
      </svg>
      <svg
        className="brand-doodle brand-doodle-burst"
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
      <svg
        className="brand-doodle brand-doodle-sparkle"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="var(--color-yellow)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 1l1.6 5.4L19 8l-5.4 1.6L12 15l-1.6-5.4L5 8l5.4-1.6L12 1z" />
      </svg>
      <svg
        className="brand-doodle brand-doodle-bolt"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="var(--color-cyan)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
      </svg>

      <span className="brand-badge">
        <span className="brand-badge-dot" aria-hidden="true" />
        New &middot; AI Meme Studio
      </span>

      <h1 className="brand-title">
        <span className="brand-title-word brand-title-word-1">MEMES</span>
        <span className="brand-title-word brand-title-word-2">THAT</span>
        <span className="brand-title-word brand-title-word-3">SLAP!</span>
      </h1>

      <p className="brand-subtitle">
        Drop a pic. Pick a vibe. Let AI cook the punchline. Your meme is one
        click from going viral.
      </p>

      <div className="brand-ctas">
        <a href="#upload" className="brand-cta brand-cta-primary">
          Start Making
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
        </a>
        <a href="#upload" className="brand-cta brand-cta-secondary">
          Browse Vibes
        </a>
      </div>

      <span className="brand-stamp" aria-hidden="true">
        Hot Off
        <br />
        the Press!
      </span>
    </section>
  )
}

export default Hero
