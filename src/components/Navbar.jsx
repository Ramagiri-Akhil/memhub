import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar"  >
      <Link to="/" className="navbar-brand" onClick={() => {
    document
      .getElementById('hero')
      ?.scrollIntoView({
        behavior: 'smooth',
      })
  }}>
        <span className="navbar-brand-mark"  aria-hidden="true" />
        AI Meme Hub
      </Link>

      <span className="navbar-sticker" aria-hidden="true">
        100% Certified Memes™
      </span>
    </nav>
  )
}

export default Navbar
