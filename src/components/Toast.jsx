import './Toast.css'

// Tiny presentational toast — rendered when `message` is a truthy string.
// The parent owns timing (show + auto-clear); this component just renders.
function Toast({ message }) {
  if (!message) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="toast-text">{message}</span>
    </div>
  )
}

export default Toast
