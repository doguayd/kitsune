import axios from 'axios'

const OLLAMA_URL = 'http://127.0.0.1:11434'

// Best model per language family — Qwen3 is strong across all, best for CJK
const LANGUAGE_MODELS = {
  zh: 'qwen3:14b',
  ja: 'qwen3:14b',
  ko: 'qwen3:14b',
  default: 'qwen3:14b'   // qwen3:14b handles all European languages well too
}

const LANGUAGE_NAMES = {
  en: 'English',
  de: 'German',
  zh: 'Mandarin Chinese',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  ko: 'Korean',
  sv: 'Swedish'
}

export function getModelForLanguage(langCode) {
  return LANGUAGE_MODELS[langCode] ?? LANGUAGE_MODELS.default
}

export function getLanguageName(langCode) {
  return LANGUAGE_NAMES[langCode] ?? langCode
}

export async function checkOllamaStatus() {
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 })
    return { available: true, models: res.data.models ?? [] }
  } catch {
    return { available: false, models: [] }
  }
}

export async function listModels() {
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 })
    return res.data.models ?? []
  } catch {
    return []
  }
}

export async function chat(messages, options = {}) {
  const { model = LANGUAGE_MODELS.default, temperature = 0.7 } = options

  const res = await axios.post(
    `${OLLAMA_URL}/api/chat`,
    { model, messages, stream: false, options: { temperature } },
    { timeout: 90000 }
  )

  // Strip <think>...</think> blocks that qwen3 emits (chain-of-thought tokens)
  const raw = res.data?.message?.content ?? ''
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  res.data.message.content = cleaned

  return res.data
}

export function buildSystemPrompt(langCode, cefrLevel, scenario = 'free') {
  const langName = getLanguageName(langCode)

  const scenarioDesc = {
    free:       'Have a natural, friendly conversation to help the user practice.',
    restaurant: 'You are a waiter at a restaurant. Stay in character.',
    business:   'You are in a professional business meeting. Use formal language.',
    travel:     'You are helping a traveler navigate and explore a new city.',
    shopping:   'You are a shop assistant helping a customer.',
  }[scenario] ?? 'Have a natural conversation.'

  return `You are Kitsune, a warm and encouraging AI language companion.
The user is practicing ${langName} at CEFR level ${cefrLevel}.
Scenario: ${scenarioDesc}

Guidelines:
- Respond primarily in ${langName} at ${cefrLevel}-appropriate complexity.
- Keep responses concise (2-4 sentences) to encourage back-and-forth dialogue.
- Be encouraging and natural — never condescending.
- If the user asks you to explain something, briefly explain in Turkish.

Correction rule (STRICT):
- ONLY append a [CORRECTIONS:] block if the user's message contains actual grammar or vocabulary mistakes.
- Format: [CORRECTIONS: original error → correction | original error → correction]
- Example: [CORRECTIONS: "I goes" → "I go" | "informations" → "information"]
- If the user's message is correct, do NOT include any [CORRECTIONS:] block at all. Silence means "no errors".
- NEVER put suggestions, advice, or language tips inside [CORRECTIONS:].`
}
