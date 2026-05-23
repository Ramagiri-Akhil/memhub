import './AudienceIndicator.css'

// Tiny "X people watching the chaos" pill rendered near the reactions.
// Returns null when there's no live audience (count <= 0).
function AudienceIndicator({ count }) {
  if (!count || count <= 0) return null

  const word = count === 1 ? 'person' : 'people'

  return (
    <div className="audience-indicator-wrap">
      <span className="audience-indicator" role="status" aria-live="polite">
        <span className="audience-indicator-dot" aria-hidden="true" />
        <span className="audience-indicator-text">
          {count} {word} watching the chaos
        </span>
      </span>
    </div>
  )
}

export default AudienceIndicator
