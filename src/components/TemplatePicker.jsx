import { TEMPLATES } from '../utils/memeTemplates'
import './TemplatePicker.css'

// Tiny SVG glyphs that hint at each template's layout.
function TemplateIcon({ id }) {
  if (id === 'classic') {
    return (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="26" height="26" rx="3" />
        <rect x="7" y="6" width="18" height="3" rx="0.5" fill="currentColor" stroke="none" />
        <rect x="7" y="23" width="18" height="3" rx="0.5" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'headline') {
    return (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="26" height="26" rx="3" />
        <rect x="5" y="6" width="22" height="5" rx="0.5" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'banner') {
    return (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="26" height="26" rx="3" />
        <rect x="3" y="22" width="26" height="7" fill="currentColor" stroke="none" />
        <rect x="8" y="24" width="16" height="2" rx="0.5" fill="#0a0a0c" stroke="none" />
      </svg>
    )
  }
  if (id === 'demotivator') {
    return (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="26" height="26" rx="2" fill="currentColor" stroke="none" />
        <rect x="6" y="6" width="20" height="14" fill="#0a0a0c" stroke="none" />
        <rect x="9" y="24" width="14" height="2" rx="0.5" fill="rgba(255,255,255,0.85)" stroke="none" />
      </svg>
    )
  }
  if (id === 'comic') {
    return (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="26" height="26" rx="3" />
        <rect x="7" y="6" width="18" height="3" rx="1.5" fill="currentColor" stroke="none" />
        <rect x="7" y="23" width="18" height="3" rx="1.5" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'cinematic') {
    return (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="26" height="26" rx="3" />
        <rect x="3" y="3" width="26" height="5" fill="currentColor" opacity="0.55" stroke="none" />
        <rect x="3" y="24" width="26" height="5" fill="currentColor" opacity="0.55" stroke="none" />
      </svg>
    )
  }
  return null
}

function TemplatePicker({ value, onChange }) {
  return (
    <section className="template-picker">
      <div className="template-picker-header">
        <h2 className="template-picker-title">Templates</h2>
        <span className="template-picker-hint">
          {Object.values(TEMPLATES).find((t) => t.id === value)?.description}
        </span>
      </div>

      <div className="template-picker-list">
        {Object.values(TEMPLATES).map((tpl) => {
          const isActive = value === tpl.id
          return (
            <button
              key={tpl.id}
              type="button"
              className={`template-card ${isActive ? 'is-active' : ''}`}
              onClick={() => onChange(tpl.id)}
              aria-pressed={isActive}
            >
              <span className="template-card-icon" aria-hidden="true">
                <TemplateIcon id={tpl.id} />
              </span>
              <span className="template-card-name">{tpl.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default TemplatePicker
