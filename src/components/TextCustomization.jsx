import './TextCustomization.css'

const FONT_OPTIONS = [
  { key: 'bowlby', label: 'Bowlby' },
  { key: 'impact', label: 'Impact' },
  { key: 'anton', label: 'Anton' },
  { key: 'comic', label: 'Comic' },
  { key: 'cinematic', label: 'Cinematic' },
]

const PRESET_COLORS = [
  '#ffffff',
  '#000000',
  '#fde047',
  '#ef4444',
  '#38bdf8',
  '#ec4899',
  '#4ade80',
  '#f97316',
]

const STYLE_TOGGLES = [
  { key: 'outline', label: 'Outline' },
  { key: 'glow', label: 'Glow' },
  { key: 'shadow', label: 'Shadow' },
  { key: 'bold', label: 'Bold' },
]

function TextCustomization({ value, onChange }) {
  function update(partial) {
    onChange({ ...value, ...partial })
  }

  return (
    <section className="text-custom">
      <h2 className="text-custom-title">Text Customization</h2>

      <div className="text-custom-group">
        <span className="text-custom-label">Font</span>
        <div className="text-custom-fonts">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.key}
              type="button"
              onClick={() => update({ font: font.key })}
              className={`text-custom-font text-custom-font-${font.key} ${
                value.font === font.key ? 'is-active' : ''
              }`}
              aria-pressed={value.font === font.key}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-custom-group">
        <span className="text-custom-label">Color</span>
        <div className="text-custom-colors">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => update({ color })}
              className={`text-custom-color ${
                value.color.toLowerCase() === color.toLowerCase() ? 'is-active' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Use color ${color}`}
            />
          ))}

          <label
            className="text-custom-color-picker"
            style={{ backgroundColor: value.color }}
          >
            <input
              type="color"
              value={value.color}
              onChange={(e) => update({ color: e.target.value })}
              aria-label="Custom color"
            />
            <span className="text-custom-color-picker-icon" aria-hidden="true">+</span>
          </label>
        </div>
      </div>

      <div className="text-custom-group">
        <span className="text-custom-label">Style</span>
        <div className="text-custom-styles">
          {STYLE_TOGGLES.map((style) => (
            <button
              key={style.key}
              type="button"
              onClick={() => update({ [style.key]: !value[style.key] })}
              className={`text-custom-toggle ${value[style.key] ? 'is-active' : ''}`}
              aria-pressed={value[style.key]}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TextCustomization
