/**
 * Kitsune Vocabulary Routes — SM-2 Spaced Repetition
 * Endpoints:
 *   GET  /api/vocab/:lang/due     — cards due for review today
 *   GET  /api/vocab/:lang/all     — all cards for this language
 *   POST /api/vocab               — add a new word
 *   POST /api/vocab/:id/review    — record SM-2 review (rating 1-5)
 *   DELETE /api/vocab/:id         — remove a word
 */
import { Router } from 'express'

const router = Router()

// ── SM-2 algorithm ────────────────────────────────────────────────────────────
// quality: 0-5  (3=Good, 5=Easy, 1=Hard, 0=Failed)
function sm2(interval, ef, reviewCount, quality) {
  let newEF = ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  newEF = Math.max(1.3, newEF)

  let newInterval
  if (quality < 3) {
    newInterval = 1   // restart if failed
  } else {
    if (reviewCount === 0)      newInterval = 1
    else if (reviewCount === 1) newInterval = 6
    else                        newInterval = Math.round(interval * ef)
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + newInterval)

  return { newEF, newInterval, nextReview: nextReview.toISOString() }
}

// ── GET /api/vocab/:lang/due ──────────────────────────────────────────────────
router.get('/:lang/due', (req, res) => {
  const db = req.db
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()
  const due  = db.prepare(`
    SELECT * FROM vocabulary
    WHERE user_id = ? AND language_code = ?
    AND datetime(next_review) <= datetime('now')
    ORDER BY next_review ASC
    LIMIT 20
  `).all(user.id, req.params.lang)
  res.json(due)
})

// ── GET /api/vocab/:lang/all ──────────────────────────────────────────────────
router.get('/:lang/all', (req, res) => {
  const db = req.db
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()
  const words = db.prepare(`
    SELECT * FROM vocabulary
    WHERE user_id = ? AND language_code = ?
    ORDER BY created_at DESC
  `).all(user.id, req.params.lang)
  res.json(words)
})

// ── POST /api/vocab ───────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { language_code, word, translation = '', context = '' } = req.body
  if (!language_code || !word) {
    return res.status(400).json({ error: 'language_code and word required' })
  }
  const db   = req.db
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()
  try {
    const result = db.prepare(`
      INSERT INTO vocabulary (user_id, language_code, word, translation, context)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, language_code, word.trim(), translation.trim(), context.trim())
    const card = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(result.lastInsertRowid)
    res.json(card)
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Word already in your list' })
    }
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/vocab/:id/review ────────────────────────────────────────────────
// body: { quality: 0-5 }  (0/1=fail, 2=hard, 3=good, 4=great, 5=easy)
router.post('/:id/review', (req, res) => {
  const { quality = 3 } = req.body
  const db   = req.db
  const card = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(req.params.id)
  if (!card) return res.status(404).json({ error: 'Card not found' })

  const { newEF, newInterval, nextReview } = sm2(
    card.interval_days, card.ease_factor, card.review_count, quality
  )

  db.prepare(`
    UPDATE vocabulary
    SET ease_factor   = ?,
        interval_days = ?,
        next_review   = ?,
        review_count  = review_count + 1
    WHERE id = ?
  `).run(newEF, newInterval, nextReview, card.id)

  const updated = db.prepare('SELECT * FROM vocabulary WHERE id = ?').get(card.id)
  res.json({ card: updated, next_review_in_days: newInterval })
})

// ── DELETE /api/vocab/:id ─────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const db = req.db
  db.prepare('DELETE FROM vocabulary WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
