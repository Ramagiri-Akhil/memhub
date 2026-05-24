import axios from 'axios'

// Backend base URL. Used by both the HTTP api client and the Socket.IO
// client (see src/services/socket.js).
export const API_BASE_URL = 'https://memhub-vu02.onrender.com'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/`,
  headers: { 'Content-Type': 'application/json' },
  // Vision requests can take longer than text-only ones.
  timeout: 45000,
})