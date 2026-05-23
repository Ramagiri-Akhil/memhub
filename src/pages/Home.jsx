import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import Hero from '../components/Hero'
import UploadBox from '../components/UploadBox'
import MemePreview from '../components/MemePreview'
import CaptionInputs from '../components/CaptionInputs'
import CaptionGenerator from '../components/CaptionGenerator'
import TextCustomization from '../components/TextCustomization'
import LayersPanel from '../components/LayersPanel'
import TemplatePicker from '../components/TemplatePicker'
import ReactionSimulator, {
  EMPTY_REACTIONS,
} from '../components/ReactionSimulator'
import Toast from '../components/Toast'
import { fileToBase64 } from '../utils/fileToBase64'
import {
  DEFAULT_TEXT_CUSTOM,
  getMoodPreset,
} from '../utils/textCustomization'
import { createSticker } from '../utils/stickers'
import { getTemplate, TEMPLATES } from '../utils/memeTemplates'
import { saveMeme, loadMeme } from '../utils/memeStorage'
import './Home.css'

const DEFAULT_TEMPLATE_ID = 'classic'
const DEFAULT_CAPTION_SIZE = 36

// Tries the modern Clipboard API first; falls back to an off-screen
// <textarea> + execCommand('copy') for older browsers / insecure contexts.
async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('clipboard.writeText failed:', err)
    }
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch (err) {
    console.error('Fallback copy failed:', err)
    return false
  }
}

function Home() {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [topCaption, setTopCaption] = useState('')
  const [bottomCaption, setBottomCaption] = useState('')
  const [topSize, setTopSize] = useState(DEFAULT_CAPTION_SIZE)
  const [bottomSize, setBottomSize] = useState(DEFAULT_CAPTION_SIZE)
  const [mood, setMood] = useState(null)
  const [textCustom, setTextCustom] = useState(DEFAULT_TEXT_CUSTOM)
  const [stickers, setStickers] = useState([])
  const [selectedLayer, setSelectedLayer] = useState(null)
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID)
  const [reactions, setReactions] = useState(EMPTY_REACTIONS)
  const [isDownloading, setIsDownloading] = useState(false)
  const [toast, setToast] = useState(null)
  const previewRef = useRef(null)
  const toastTimerRef = useRef(null)

  function showToast(message) {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  async function handleFileSelected(file) {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
    setImageBase64(null)
    try {
      const base64 = await fileToBase64(file)
      setImageBase64(base64)
    } catch (err) {
      console.error('Failed to read image as base64:', err)
    }
  }

  function handleRemove() {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setImageBase64(null)
    setTopCaption('')
    setBottomCaption('')
    setTopSize(DEFAULT_CAPTION_SIZE)
    setBottomSize(DEFAULT_CAPTION_SIZE)
    setMood(null)
    setTextCustom(DEFAULT_TEXT_CUSTOM)
    setStickers([])
    setSelectedLayer(null)
    setTemplateId(DEFAULT_TEMPLATE_ID)
    setReactions(EMPTY_REACTIONS)
  }

  function handleMoodChange(nextMood) {
    setMood(nextMood)
    setTextCustom(getMoodPreset(nextMood))
  }

  function handleReact(key) {
    setReactions((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
  }

  function handleSelectLayer(kind, id) {
    setSelectedLayer({ kind, id })
  }

  function handleDeleteLayer(kind, id) {
    if (kind === 'caption') {
      if (id === 'top') setTopCaption('')
      if (id === 'bottom') setBottomCaption('')
    } else if (kind === 'sticker') {
      setStickers((prev) => prev.filter((s) => s.id !== id))
    }
    setSelectedLayer((prev) =>
      prev && prev.kind === kind && prev.id === id ? null : prev
    )
  }

  function handleAddSticker(type) {
    const sticker = createSticker(type)
    setStickers((prev) => [...prev, sticker])
    setSelectedLayer({ kind: 'sticker', id: sticker.id })
  }

  function handleTemplateChange(id) {
    if (!TEMPLATES[id]) return
    setTemplateId(id)
    setTextCustom(TEMPLATES[id].textDefaults)
  }

  function handleApplySuggestion(suggestion) {
    if (!suggestion) return

    setTopCaption(suggestion.captions?.top || '')
    setBottomCaption(suggestion.captions?.bottom || '')

    const nextTemplateId =
      suggestion.template && TEMPLATES[suggestion.template]
        ? suggestion.template
        : templateId
    if (nextTemplateId !== templateId) {
      setTemplateId(nextTemplateId)
    }

    const baseDefaults =
      TEMPLATES[nextTemplateId]?.textDefaults || DEFAULT_TEXT_CUSTOM
    const next = { ...baseDefaults }
    if (suggestion.font) next.font = suggestion.font
    if (suggestion.color) next.color = suggestion.color
    if (suggestion.styles) {
      if (typeof suggestion.styles.outline === 'boolean')
        next.outline = suggestion.styles.outline
      if (typeof suggestion.styles.glow === 'boolean')
        next.glow = suggestion.styles.glow
      if (typeof suggestion.styles.shadow === 'boolean')
        next.shadow = suggestion.styles.shadow
      if (typeof suggestion.styles.bold === 'boolean')
        next.bold = suggestion.styles.bold
    }
    setTextCustom(next)

    if (previewRef.current) {
      previewRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  async function captureMemeBlob() {
    if (!previewRef.current) return null
    setSelectedLayer(null)
    await new Promise((resolve) => requestAnimationFrame(resolve))
    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    })
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  }

  async function handleDownload() {
    if (!previewRef.current || isDownloading) return
    setIsDownloading(true)
    try {
      const blob = await captureMemeBlob()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'meme.png'
      link.click()
      URL.revokeObjectURL(url)
      showToast('Meme downloaded!')
    } catch (err) {
      console.error('Failed to download meme:', err)
      showToast("Couldn't download")
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleShareLink() {
    if (!imageBase64) {
      showToast('Upload an image first')
      return
    }

    const id =
      typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    const memeData = {
      image: imageBase64,
      topCaption,
      bottomCaption,
      topSize,
      bottomSize,
      textCustom,
      templateId,
      mood,
      stickers,
      reactions,
      createdAt: Date.now(),
    }

    const saved = saveMeme(id, memeData)
    if (!saved) {
      showToast("Couldn't save — storage full")
      return
    }

    // Verify the meme is actually retrievable before handing out a link.
    const verify = loadMeme(id)
    if (!verify || !verify.image) {
      showToast("Couldn't save meme")
      return
    }

    const url = `${window.location.origin}/meme/${id}`
    const copied = await copyToClipboard(url)
    if (copied) {
      showToast('Link copied! Paste to share')
    } else {
      showToast('Link ready — copy from address bar')
    }
  }

  const hasImage = Boolean(imageUrl)

  return (
    <>
      <section id="upload" className="home">
        <div className="home-grid">
          <aside className="home-left">
            <Hero />
          </aside>

          <div className="home-center">
            {hasImage ? (
              <>
                {mood && (
                  <div className="home-mood-bar">
                    <span className="home-mood-chip" data-mood={mood}>
                      <span className="home-mood-chip-dot" aria-hidden="true" />
                      Vibe · {mood}
                    </span>
                  </div>
                )}

                <MemePreview
                  previewRef={previewRef}
                  imageUrl={imageUrl}
                  topCaption={topCaption}
                  bottomCaption={bottomCaption}
                  topSize={topSize}
                  bottomSize={bottomSize}
                  textCustom={textCustom}
                  stickers={stickers}
                  selectedLayer={selectedLayer}
                  onSelectLayer={handleSelectLayer}
                  mood={mood || 'reaction'}
                  template={getTemplate(templateId)}
                />

                <ReactionSimulator
                  counts={reactions}
                  onReact={handleReact}
                />

                <CaptionInputs
                  topCaption={topCaption}
                  bottomCaption={bottomCaption}
                  topSize={topSize}
                  bottomSize={bottomSize}
                  onTopChange={setTopCaption}
                  onBottomChange={setBottomCaption}
                  onTopSizeChange={setTopSize}
                  onBottomSizeChange={setBottomSize}
                />

                <TextCustomization
                  value={textCustom}
                  onChange={setTextCustom}
                />

                <LayersPanel
                  topCaption={topCaption}
                  bottomCaption={bottomCaption}
                  stickers={stickers}
                  selectedLayer={selectedLayer}
                  onSelect={handleSelectLayer}
                  onDelete={handleDeleteLayer}
                  onAddSticker={handleAddSticker}
                />
              </>
            ) : (
              <div className="home-empty">
                <span className="home-empty-emoji" aria-hidden="true">
                  👉
                </span>
                <h2 className="home-empty-title">Drop a pic on the right</h2>
                <p className="home-empty-text">
                  Your meme will live here. Captions, vibes, all that good
                  stuff.
                </p>
              </div>
            )}
          </div>

          <aside className="home-right">
            <UploadBox
              onFileSelected={handleFileSelected}
              className={hasImage ? 'compact' : ''}
            />

            <TemplatePicker
              value={templateId}
              onChange={handleTemplateChange}
            />

            <CaptionGenerator
              image={imageBase64}
              onApply={handleApplySuggestion}
              onMoodChange={handleMoodChange}
            />

            {hasImage && (
              <div className="home-buttons">
                <button
                  type="button"
                  className="home-btn home-btn-share"
                  onClick={handleShareLink}
                  disabled={isDownloading}
                >
                  Share Link
                </button>
                <button
                  type="button"
                  className="home-btn home-btn-download"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Cooking…' : 'Download'}
                </button>
                <button
                  type="button"
                  className="home-btn home-btn-remove"
                  onClick={handleRemove}
                  disabled={isDownloading}
                >
                  Remove
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>

      <Toast message={toast} />
    </>
  )
}

export default Home
