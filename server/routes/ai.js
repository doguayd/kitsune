import { Router } from 'express'
import { checkOllamaStatus, listModels } from '../services/ollama.js'
import { checkWhisperStatus } from '../services/whisper.js'
import { checkTtsStatus } from '../services/tts.js'

const router = Router()

router.get('/status', async (_req, res) => {
  const [ollama, whisper, tts] = await Promise.all([
    checkOllamaStatus(),
    checkWhisperStatus(),
    checkTtsStatus()
  ])
  res.json({ ollama, whisper, tts })
})

router.get('/models', async (_req, res) => {
  const models = await listModels()
  res.json(models)
})

export default router
