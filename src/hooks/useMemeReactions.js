import { useEffect, useState } from 'react'
import { getSocket } from '../services/socket'

// Shared default — keys match the backend's REACTION_EMOJIS list.
const EMPTY_REACTIONS = {
  '😂': 0,
  '🔥': 0,
  '💀': 0,
  '😮': 0,
  '🤯': 0,
}

// Joins the meme's room over Socket.IO and exposes:
//   - reactions: live count map updated whenever anyone reacts
//   - viewerCount: how many sockets are currently in this meme's room
//   - react(emoji): broadcasts a click to the room
//   - isLive: convenience flag — true when memeId is set
//
// Pass a falsy memeId to keep the hook idle.
export function useMemeReactions(memeId) {
  const [reactions, setReactions] = useState(EMPTY_REACTIONS)
  const [viewerCount, setViewerCount] = useState(0)

  useEffect(() => {
    if (!memeId) {
      setReactions(EMPTY_REACTIONS)
      setViewerCount(0)
      return
    }

    const socket = getSocket()

    function handleReactions(payload) {
      if (payload?.memeId === memeId && payload?.reactions) {
        setReactions(payload.reactions)
      }
    }

    function handleViewers(payload) {
      if (payload?.memeId === memeId && typeof payload.count === 'number') {
        setViewerCount(payload.count)
      }
    }

    socket.on('reactions', handleReactions)
    socket.on('viewers', handleViewers)
    socket.emit('join', memeId)

    return () => {
      socket.off('reactions', handleReactions)
      socket.off('viewers', handleViewers)
    }
  }, [memeId])

  function react(emoji) {
    if (!memeId) return
    const socket = getSocket()
    socket.emit('react', { memeId, emoji })
  }

  return { reactions, react, viewerCount, isLive: Boolean(memeId) }
}

export { EMPTY_REACTIONS }
