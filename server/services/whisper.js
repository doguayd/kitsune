import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { getWhisperProcess, TEMP_DIR } from './modelManager.js'

const WHISPER_MODEL = 'large-v3-turbo'

const LANG_HINTS = {
  en: 'english', de: 'german',  zh: 'chinese',  ja: 'japanese',
  fr: 'french',  es: 'spanish', it: 'italian',  ko: 'korean',
  sv: 'swedish'
}

/**
 * Ses tamponunu metne dönüştürür (Whisper large-v3-turbo).
 * Model bellekte kalıcıdır — ilk çağrı yavaş, sonrakiler hızlı.
 */
export async function transcribe (audioBuffer, langCode = 'en', ext = 'webm') {
  const tmpFile = join(TEMP_DIR, `audio_${Date.now()}.${ext}`)
  writeFileSync(tmpFile, audioBuffer)

  try {
    const proc     = getWhisperProcess()
    const language = LANG_HINTS[langCode] ?? null

    const result = await proc.send({
      file: tmpFile.replace(/\\/g, '/'),
      language
    })
    return result.text ?? ''
  } finally {
    try { if (existsSync(tmpFile)) unlinkSync(tmpFile) } catch {}
  }
}

export async function checkWhisperStatus () {
  const proc = getWhisperProcess()
  return {
    available: true,   // süreç başlatıldı (ya da kuyruğa eklendi)
    ready:     proc.isReady,
    model:     WHISPER_MODEL,
    version:   '20250625'
  }
}
