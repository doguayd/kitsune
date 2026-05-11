import { Router } from 'express'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { transcribe, checkWhisperStatus } from '../services/whisper.js'
import { synthesize, checkTtsStatus } from '../services/tts.js'

const router = Router()

/**
 * POST /api/voice/transcribe
 * Body: { audio_base64: string, language_code: string, ext: string }
 * Returns: { text: string }
 */
router.post('/transcribe', async (req, res) => {
  const { audio_base64, language_code = 'en', ext = 'webm' } = req.body
  if (!audio_base64) return res.status(400).json({ error: 'audio_base64 required' })

  try {
    const buffer = Buffer.from(audio_base64, 'base64')
    const text = await transcribe(buffer, language_code, ext)
    res.json({ text })
  } catch (err) {
    console.error('[Voice/STT] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/voice/synthesize
 * Body: { text: string, language_code: string }
 * Returns: { audio_base64: string, format: 'wav' }
 */
router.post('/synthesize', async (req, res) => {
  const { text, language_code = 'en' } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'text required' })

  let outFile = null
  try {
    outFile = await synthesize(text.trim(), language_code)
    const audioBuffer = readFileSync(outFile)
    const audio_base64 = audioBuffer.toString('base64')
    res.json({ audio_base64, format: 'wav' })
  } catch (err) {
    console.error('[Voice/TTS] Error:', err.message)
    res.status(500).json({ error: err.message })
  } finally {
    if (outFile && existsSync(outFile)) {
      try { unlinkSync(outFile) } catch {}
    }
  }
})

/**
 * GET /api/voice/status
 * Returns availability of Whisper and TTS
 */
router.get('/status', async (req, res) => {
  const [whisper, tts] = await Promise.all([checkWhisperStatus(), checkTtsStatus()])
  res.json({ whisper, tts })
})

export default router
