import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://memhub-vu02.onrender.com/',
  headers: { 'Content-Type': 'application/json' },
  // Vision requests can take longer than text-only ones.
  timeout: 45000,
})
