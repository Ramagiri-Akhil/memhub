import axios from 'axios'

export const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
  // Vision requests can take longer than text-only ones.
  timeout: 45000,
})
