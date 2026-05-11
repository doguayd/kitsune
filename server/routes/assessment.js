import { Router } from 'express'
import { chat, buildSystemPrompt, getModelForLanguage } from '../services/ollama.js'

const router = Router()

// CEFR seviyeleri ve ağırlıkları
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const WEIGHTS = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }

/**
 * Adaptif test skorundan CEFR seviyesi hesaplar.
 * Her doğru cevap seviye ağırlığını, her yanlış 0.25 × ağırlığı katar.
 */
function calculateCEFR(answers) {
  if (!answers.length) return 'A1'
  const total = answers.reduce((sum, { level, correct }) =>
    sum + WEIGHTS[level] * (correct ? 1 : 0.25), 0)
  const avg = total / answers.length

  if (avg >= 5.2) return 'C2'
  if (avg >= 4.2) return 'C1'
  if (avg >= 3.2) return 'B2'
  if (avg >= 2.2) return 'B1'
  if (avg >= 1.4) return 'A2'
  return 'A1'
}

// Seviye yukarı/aşağı hareket (sınır kontrolü)
function adaptLevel(current, correct) {
  const idx = LEVELS.indexOf(current)
  return correct
    ? LEVELS[Math.min(idx + 1, 5)]
    : LEVELS[Math.max(idx - 1, 0)]
}

// Sonucu kaydet ve kuyruk parlaklığını güncelle
router.post('/save', (req, res) => {
  const { language_code, cefr_result, score } = req.body
  if (!language_code || !cefr_result) {
    return res.status(400).json({ error: 'language_code and cefr_result required' })
  }

  const db = req.db
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()

  // Level assessment kaydı
  db.prepare(
    'INSERT INTO level_assessments (user_id, language_code, cefr_result, score) VALUES (?, ?, ?, ?)'
  ).run(user.id, language_code, cefr_result, score ?? 0)

  // user_languages güncelle (kuyruk parlaklığı: A1=0 … C2=5)
  const glowLevel = LEVELS.indexOf(cefr_result)
  db.prepare(`
    INSERT INTO user_languages (user_id, language_code, cefr_level, tail_glow)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, language_code) DO UPDATE SET
      cefr_level = excluded.cefr_level,
      tail_glow  = excluded.tail_glow
  `).run(user.id, language_code, cefr_result, glowLevel)

  res.json({ success: true, cefr_result, glow_level: glowLevel })
})

// AI konuşma doğrulaması — 1 mesajlık hızlı sohbet, sonra seviye tahmini
router.post('/ai-check', async (req, res) => {
  const { language_code, preliminary_level, user_message } = req.body

  const LANG_NAMES = {
    en:'English', de:'German', zh:'Mandarin Chinese', ja:'Japanese',
    fr:'French', es:'Spanish', it:'Italian', ko:'Korean', sv:'Swedish'
  }

  const system = `You are a language assessment AI for ${LANG_NAMES[language_code] ?? language_code}.
The learner's preliminary level is ${preliminary_level}.
Respond naturally to their message (2 sentences max), then on a new line output EXACTLY:
LEVEL_ESTIMATE: <A1|A2|B1|B2|C1|C2>
Base your estimate on vocabulary range, grammar accuracy, and fluency in their message.`

  try {
    const model = getModelForLanguage(language_code)
    const response = await chat(
      [{ role: 'system', content: system }, { role: 'user', content: user_message }],
      { model, temperature: 0.3 }
    )
    const raw = response.message.content
    const match = raw.match(/LEVEL_ESTIMATE:\s*(A1|A2|B1|B2|C1|C2)/i)
    const ai_level = match?.[1] ?? preliminary_level
    const reply = raw.replace(/LEVEL_ESTIMATE:.*/i, '').trim()

    res.json({ reply, ai_level })
  } catch (err) {
    console.error('[Assessment] AI check error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
export { calculateCEFR, adaptLevel, LEVELS }
