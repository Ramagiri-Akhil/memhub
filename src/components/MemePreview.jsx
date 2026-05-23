import { useMemo, useRef } from 'react'
import Draggable from 'react-draggable'
import { buildCaptionStyle } from '../utils/textCustomization'
import { STICKER_TYPES } from '../utils/stickers'
import StickerIcon from './StickerIcon'
import './MemePreview.css'

function OverlayLayer({ type }) {
  return (
    <div className={`meme-overlay meme-overlay-${type}`} aria-hidden="true" />
  )
}

// One sticker rendered on the meme. Draggable when interactive, static when readOnly.
function MemeSticker({ sticker, isSelected, onSelect, readOnly }) {
  const nodeRef = useRef(null)
  const type = STICKER_TYPES[sticker.type]
  const color = type ? type.color : '#ffffff'

  return (
    <Draggable nodeRef={nodeRef} bounds="parent" disabled={readOnly}>
      <span
        ref={nodeRef}
        className={`meme-sticker ${isSelected ? 'is-selected' : ''}`}
        style={{ color }}
        onClick={
          readOnly
            ? undefined
            : (e) => {
                e.stopPropagation()
                onSelect()
              }
        }
      >
        <StickerIcon type={sticker.type} />
      </span>
    </Draggable>
  )
}

function MemePreview({
  imageUrl,
  topCaption,
  bottomCaption,
  topSize,
  bottomSize,
  textCustom,
  stickers = [],
  selectedLayer = null,
  onSelectLayer = () => {},
  mood = 'reaction',
  template,
  previewRef,
  readOnly = false,
}) {
  const topNodeRef = useRef(null)
  const bottomNodeRef = useRef(null)

  const topSlot = template?.slots?.top || { show: true }
  const bottomSlot = template?.slots?.bottom || { show: true }
  const overlays = template?.overlays || []

  const topStyle = useMemo(() => {
    const base = buildCaptionStyle(textCustom, topSize)
    return {
      ...base,
      textAlign: topSlot.align || 'center',
      ...(topSlot.position || {}),
    }
  }, [textCustom, topSize, topSlot])

  const bottomStyle = useMemo(() => {
    const base = buildCaptionStyle(textCustom, bottomSize)
    return {
      ...base,
      textAlign: bottomSlot.align || 'center',
      ...(bottomSlot.position || {}),
    }
  }, [textCustom, bottomSize, bottomSlot])

  const isCaptionSelected = (id) =>
    selectedLayer &&
    selectedLayer.kind === 'caption' &&
    selectedLayer.id === id

  const isStickerSelected = (id) =>
    selectedLayer &&
    selectedLayer.kind === 'sticker' &&
    selectedLayer.id === id

  const tplKey = template?.id || 'classic'

  return (
    <div
      className={`meme-preview meme-preview-mood-${mood} ${readOnly ? 'is-readonly' : ''}`}
      ref={previewRef}
    >
      <img src={imageUrl} alt="Meme preview" className="meme-preview-image" />

      {overlays.map((type) => (
        <OverlayLayer key={`overlay-${type}`} type={type} />
      ))}

      {topSlot.show && topCaption && (
        <Draggable
          key={`top-${tplKey}`}
          nodeRef={topNodeRef}
          bounds="parent"
          disabled={readOnly}
        >
          <span
            ref={topNodeRef}
            className={`meme-caption meme-caption-top ${
              isCaptionSelected('top') ? 'is-selected' : ''
            }`}
            style={topStyle}
            onClick={
              readOnly
                ? undefined
                : (e) => {
                    e.stopPropagation()
                    onSelectLayer('caption', 'top')
                  }
            }
          >
            {topCaption}
          </span>
        </Draggable>
      )}

      {bottomSlot.show && bottomCaption && (
        <Draggable
          key={`bot-${tplKey}`}
          nodeRef={bottomNodeRef}
          bounds="parent"
          disabled={readOnly}
        >
          <span
            ref={bottomNodeRef}
            className={`meme-caption meme-caption-bottom ${
              isCaptionSelected('bottom') ? 'is-selected' : ''
            }`}
            style={bottomStyle}
            onClick={
              readOnly
                ? undefined
                : (e) => {
                    e.stopPropagation()
                    onSelectLayer('caption', 'bottom')
                  }
            }
          >
            {bottomCaption}
          </span>
        </Draggable>
      )}

      {stickers.map((sticker) => (
        <MemeSticker
          key={sticker.id}
          sticker={sticker}
          isSelected={isStickerSelected(sticker.id)}
          onSelect={() => onSelectLayer('sticker', sticker.id)}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

export default MemePreview
