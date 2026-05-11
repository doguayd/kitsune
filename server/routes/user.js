import { Router } from 'express'

const router = Router()

// Full profile with unlocked languages
router.get('/profile', (req, res) => {
  const db = req.db
  const user = db.prepare('SELECT * FROM users LIMIT 1').get()
  const languages = db.prepare(`
    SELECT ul.*, l.name, l.native_name, l.flag, l.tail_color, l.tail_index
    FROM user_languages ul
    JOIN languages l ON ul.language_code = l.code
    WHERE ul.user_id = ?
    ORDER BY l.tail_index
  `).all(user.id)

  const { settings, ...userFields } = user
  res.json({ ...userFields, settings: JSON.parse(settings ?? '{}'), languages })
})

// All available languages (for language picker)
router.get('/languages', (req, res) => {
  const languages = req.db.prepare('SELECT * FROM languages ORDER BY tail_index').all()
  res.json(languages)
})

// Add a language to the user's list
router.post('/languages', (req, res) => {
  const { language_code } = req.body
  if (!language_code) return res.status(400).json({ error: 'language_code is required' })

  const db = req.db
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()

  try {
    db.prepare(
      'INSERT OR IGNORE INTO user_languages (user_id, language_code) VALUES (?, ?)'
    ).run(user.id, language_code)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Update display name
router.patch('/profile', (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' })
  req.db.prepare('UPDATE users SET name = ? WHERE id = 1').run(name.trim())
  res.json({ success: true })
})

// Update CEFR level for a language
router.patch('/languages/:code/level', (req, res) => {
  const { cefr_level } = req.body
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  if (!validLevels.includes(cefr_level)) {
    return res.status(400).json({ error: 'Invalid CEFR level' })
  }

  const db = req.db
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()
  db.prepare(
    'UPDATE user_languages SET cefr_level = ? WHERE user_id = ? AND language_code = ?'
  ).run(cefr_level, user.id, req.params.code)

  res.json({ success: true })
})

export default router
