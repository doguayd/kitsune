import express from 'express'
import cors from 'cors'
import { initDatabase } from './db/database.js'
import aiRoutes from './routes/ai.js'
import chatRoutes from './routes/chat.js'
import userRoutes from './routes/user.js'
import assessmentRoutes from './routes/assessment.js'
import voiceRoutes from './routes/voice.js'
import learnRoutes from './routes/learn.js'
import { initModelProcesses } from './services/modelManager.js'

// Port: 3717 — き(3)つ(7)ね(1)... Japanese reading of kitsune digits
const PORT = 3717

export async function startServer() {
  const db = await initDatabase()

  const app = express()
  app.use(cors({ origin: '*' }))
  app.use(express.json({ limit: '20mb' }))  // large limit for base64 audio

  // Attach db instance to every request
  app.use((req, _res, next) => {
    req.db = db
    next()
  })

  app.use('/api/ai',         aiRoutes)
  app.use('/api/chat',       chatRoutes)
  app.use('/api/user',       userRoutes)
  app.use('/api/assessment', assessmentRoutes)
  app.use('/api/voice',      voiceRoutes)
  app.use('/api/learn',      learnRoutes)

  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', version: '0.1.0', name: 'Kitsune' })
  )

  // Preload Whisper + XTTS into VRAM in background
  initModelProcesses()

  return new Promise((resolve, reject) => {
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`[Server] Listening on http://127.0.0.1:${PORT}`)
      resolve()
    }).on('error', reject)
  })
}
