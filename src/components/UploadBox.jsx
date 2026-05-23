import { useRef, useState } from 'react'
import './UploadBox.css'

function UploadBox({ onFileSelected, className = '' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    setError('')
    onFileSelected?.(file)
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  function openPicker() {
    inputRef.current?.click()
  }

  return (
    <div
      className={`upload-box ${isDragging ? 'is-dragging' : ''} ${className}`.trim()}
      onClick={openPicker}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="upload-box-input"
        onChange={handleInputChange}
      />

      <div className="upload-box-empty">
        <div className="upload-box-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="upload-box-title">Drag & drop your image here</p>
        <p className="upload-box-subtitle">
          or <span className="upload-box-link">click to browse</span>
        </p>
        <p className="upload-box-hint">PNG, JPG, GIF, WEBP</p>
      </div>

      {error && <p className="upload-box-error">{error}</p>}
    </div>
  )
}

export default UploadBox
