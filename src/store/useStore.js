import { create } from 'zustand'
import { api } from '../services/api'

export const useStore = create((set, get) => ({
  // --- Connection state ---
  serverOnline:  false,
  ollamaOnline:  false,
  ollamaModels:  [],
  whisperOnline: false,
  whisperModel:  'large-v3-turbo',
  ttsOnline:     false,

  // --- User & languages ---
  user: null,
  allLanguages: [],

  // --- Active chat ---
  activeChatSession: null,
  activeLanguageCode: null,
  messages: [],
  chatLoading: false,

  // ─── Actions ─────────────────────────────────────────────────

  checkServer: async () => {
    try {
      await api.get('/health')
      set({ serverOnline: true })
      const { data } = await api.get('/api/ai/status')
      set({
        ollamaOnline:  data.ollama.available,
        ollamaModels:  data.ollama.models,
        whisperOnline: data.whisper.available,
        whisperModel:  data.whisper.model,
        ttsOnline:     data.tts.available
      })
    } catch {
      set({ serverOnline: false, ollamaOnline: false, whisperOnline: false })
    }
  },

  loadProfile: async () => {
    try {
      const { data } = await api.get('/api/user/profile')
      set({ user: data })
    } catch (err) {
      console.error('[Store] loadProfile:', err.message)
    }
  },

  loadAllLanguages: async () => {
    try {
      const { data } = await api.get('/api/user/languages')
      set({ allLanguages: data })
    } catch (err) {
      console.error('[Store] loadAllLanguages:', err.message)
    }
  },

  addLanguage: async (code) => {
    await api.post('/api/user/languages', { language_code: code })
    await get().loadProfile()
  },

  updateName: async (name) => {
    await api.patch('/api/user/profile', { name })
    await get().loadProfile()
  },

  // ─── Chat ────────────────────────────────────────────────────

  startChat: async (languageCode, scenario = 'free') => {
    const { data } = await api.post('/api/chat/session', {
      language_code: languageCode,
      scenario
    })
    set({
      activeChatSession: data.session_id,
      activeLanguageCode: languageCode,
      messages: []
    })
    return data.session_id
  },

  sendMessage: async (content) => {
    const { activeChatSession, messages } = get()
    if (!activeChatSession) throw new Error('No active session')

    const userMsg = { role: 'user', content, id: Date.now() }
    set({ messages: [...messages, userMsg], chatLoading: true })

    try {
      const { data } = await api.post('/api/chat/message', {
        session_id: activeChatSession,
        content
      })
      const aiMsg = {
        role: 'assistant',
        content: data.content,
        corrections: data.corrections ?? null,
        id: Date.now() + 1
      }
      set({ messages: [...get().messages, aiMsg] })
      return data
    } finally {
      set({ chatLoading: false })
    }
  }
}))
