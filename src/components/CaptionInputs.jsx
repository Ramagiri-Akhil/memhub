import './CaptionInputs.css'

const SIZE_MIN = 14
const SIZE_MAX = 80

function CaptionInputs({
  topCaption,
  bottomCaption,
  topSize,
  bottomSize,
  onTopChange,
  onBottomChange,
  onTopSizeChange,
  onBottomSizeChange,
}) {
  return (
    <div className="caption-inputs">
      <div className="caption-field">
        <label className="caption-label" htmlFor="top-caption-input">
          Top caption
        </label>
        <input
          id="top-caption-input"
          type="text"
          className="caption-input"
          placeholder="When the code finally compiles"
          value={topCaption}
          onChange={(e) => onTopChange(e.target.value)}
          maxLength={80}
        />
        <div className="caption-size-row">
          <span className="caption-size-label">Size</span>
          <input
            type="range"
            className="caption-slider"
            min={SIZE_MIN}
            max={SIZE_MAX}
            value={topSize}
            onChange={(e) => onTopSizeChange(Number(e.target.value))}
            aria-label="Top caption font size"
          />
          <span className="caption-size-value">{topSize}px</span>
        </div>
      </div>

      <div className="caption-field">
        <label className="caption-label" htmlFor="bottom-caption-input">
          Bottom caption
        </label>
        <input
          id="bottom-caption-input"
          type="text"
          className="caption-input"
          placeholder="...on the first try"
          value={bottomCaption}
          onChange={(e) => onBottomChange(e.target.value)}
          maxLength={80}
        />
        <div className="caption-size-row">
          <span className="caption-size-label">Size</span>
          <input
            type="range"
            className="caption-slider"
            min={SIZE_MIN}
            max={SIZE_MAX}
            value={bottomSize}
            onChange={(e) => onBottomSizeChange(Number(e.target.value))}
            aria-label="Bottom caption font size"
          />
          <span className="caption-size-value">{bottomSize}px</span>
        </div>
      </div>
    </div>
  )
}

export default CaptionInputs
