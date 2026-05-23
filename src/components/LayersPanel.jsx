import { useState } from 'react'
import { STICKER_TYPES } from '../utils/stickers'
import StickerIcon from './StickerIcon'
import './LayersPanel.css'

function CaptionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7V5h14v2" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="9" y1="19" x2="15" y2="19" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function isActive(selected, kind, id) {
  return selected && selected.kind === kind && selected.id === id
}

function LayersPanel({
  topCaption,
  bottomCaption,
  stickers,
  selectedLayer,
  onSelect,
  onDelete,
  onAddSticker,
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  // Build an ordered list of layer entries for rendering.
  const layers = []
  if (topCaption) {
    layers.push({ kind: 'caption', id: 'top', label: 'Top', preview: topCaption })
  }
  if (bottomCaption) {
    layers.push({ kind: 'caption', id: 'bottom', label: 'Bottom', preview: bottomCaption })
  }
  stickers.forEach((s) => {
    const type = STICKER_TYPES[s.type]
    layers.push({
      kind: 'sticker',
      id: s.id,
      label: type ? type.label : 'Sticker',
      stickerType: s.type,
      color: type ? type.color : '#ffffff',
    })
  })

  function handlePickSticker(type) {
    onAddSticker(type)
    setPickerOpen(false)
  }

  return (
    <section className="layers-panel">
      <div className="layers-panel-header">
        <h2 className="layers-panel-title">Layers</h2>
        <span className="layers-panel-count">{layers.length}</span>
      </div>

      {layers.length === 0 ? (
        <p className="layers-panel-empty">
          No layers yet. Type a caption or add a sticker.
        </p>
      ) : (
        <ul className="layers-list">
          {layers.map((layer) => {
            const active = isActive(selectedLayer, layer.kind, layer.id)
            return (
              <li
                key={`${layer.kind}-${layer.id}`}
                className={`layers-item ${active ? 'is-active' : ''}`}
              >
                <button
                  type="button"
                  className="layers-item-select"
                  onClick={() => onSelect(layer.kind, layer.id)}
                >
                  <span
                    className="layers-item-icon"
                    style={
                      layer.kind === 'sticker' ? { color: layer.color } : undefined
                    }
                  >
                    {layer.kind === 'caption' ? (
                      <CaptionIcon />
                    ) : (
                      <StickerIcon type={layer.stickerType} />
                    )}
                  </span>
                  <span className="layers-item-text">
                    <span className="layers-item-label">{layer.label}</span>
                    {layer.preview && (
                      <span className="layers-item-preview">{layer.preview}</span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  className="layers-item-delete"
                  onClick={() => onDelete(layer.kind, layer.id)}
                  aria-label={`Delete ${layer.label}`}
                >
                  <TrashIcon />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="layers-add">
        <button
          type="button"
          className="layers-add-btn"
          onClick={() => setPickerOpen((prev) => !prev)}
          aria-expanded={pickerOpen}
        >
          {pickerOpen ? 'Close' : '+ Add Sticker'}
        </button>

        {pickerOpen && (
          <div className="layers-picker">
            {Object.entries(STICKER_TYPES).map(([key, type]) => (
              <button
                key={key}
                type="button"
                className="layers-picker-item"
                onClick={() => handlePickSticker(key)}
                style={{ color: type.color }}
                aria-label={`Add ${type.label}`}
              >
                <StickerIcon type={key} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LayersPanel
