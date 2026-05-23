import { io } from 'socket.io-client'
import { API_BASE_URL } from './api'

// Singleton Socket.IO client. The hook `useMemeReactions` joins/leaves
// meme rooms; this connection stays open for the lifetime of the page.
let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}
