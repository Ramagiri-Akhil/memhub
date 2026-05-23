import { useEffect, useState } from 'react'
import fireLoader from '../assets/fire-loader.gif.gif'
import './LoadingAnimation.css'

const MESSAGES = [
  'Analyzing meme energy...',
  'Summoning internet humor...',
  'Brewing chaos...',
  'Consulting Gen-Z council...',
  'Reading the vibe...',
  'Generating emotional damage...',
]

function LoadingAnimation() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="loading-animation" role="status" aria-live="polite">
      <img
        src={fireLoader}
        alt=""
        aria-hidden="true"
        className="loading-animation-gif"
      />
      <span key={index} className="loading-animation-text">
        {MESSAGES[index]}
      </span>
    </div>
  )
}

export default LoadingAnimation
