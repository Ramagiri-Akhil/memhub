import './MemeModeSelector.css'

function MemeModeSelector({ modes, value, onChange }) {
  return (
    <div
      className="meme-mode-selector"
      role="radiogroup"
      aria-label="Caption style"
    >
      {modes.map((mode) => {
        const isActive = mode === value
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`meme-mode-chip ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(mode)}
          >
            {mode}
          </button>
        )
      })}
    </div>
  )
}

export default MemeModeSelector
