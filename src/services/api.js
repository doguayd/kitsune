import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://127.0.0.1:3717',
  timeout: 90000  // 90s — local LLMs can be slow on first token
})

// Voice endpoints need more time — XTTS model load + synthesis can take ~2 min cold start
export const voiceApi = axios.create({
  baseURL: 'http://127.0.0.1:3717',
  timeout: 180000  // 3 min
})
