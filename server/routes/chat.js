import { Router } from 'express'
import {
  chat,
  buildSystemPrompt,
  getModelForLanguage
} from '../services/ollama.js'

const router = Router()

// Start a new chat session
router.post('/session', (req, res) => {
  const { language_code = 'en', scenario = 'free' } = req.body
  const db = req.db
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()

  const result = db.prepare(
    'INSERT INTO chat_sessions (user_id, language_code, scenario) VALUES (?, ?, ?)'
  ).run(user.id, language_code, scenario)

  res.json({ session_id: result.lastInsertRowid })
})

// Send a message, get AI response
router.post('/message', async (req, res) => {
  const { session_id, content } = req.body
  if (!session_id || !content?.trim()) {
    return res.status(400).json({ error: 'session_id and content are required' })
  }

  const db = req.db
  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(session_id)
  if (!session) return res.status(404).json({ error: 'Session not found' })

  const userLang = db.prepare(
    'SELECT cefr_level FROM user_languages WHERE language_code = ? LIMIT 1'
  ).get(session.language_code)
  const cefrLevel = userLang?.cefr_level ?? 'B1'

  // Persist user message
  db.prepare(
    'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)'
  ).run(session_id, 'user', content)

  // Build last 20 messages as context
  const history = db.prepare(
    'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at LIMIT 20'
  ).all(session_id)

  const systemPrompt = buildSystemPrompt(session.language_code, cefrLevel, session.scenario)

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content }))
  ]

  try {
    const model = getModelForLanguage(session.language_code)
    const response = await chat(messages, { model })
    const raw = response.message.content

    // Extract [CORRECTIONS: ...] block if present
    const corrMatch = raw.match(/\[CORRECTIONS:(.*?)\]/s)
    const cleanContent = raw.replace(/\[CORRECTIONS:.*?\]/s, '').trim()

    // Filter out non-corrections: skip "none", blanks, and "X → X" (same before/after)
    let corrections = null
    if (corrMatch) {
      const items = corrMatch[1]
        .split('|')
        .map(c => c.trim())
        .filter(c => {
          if (!c || /^none$/i.test(c)) return false
          const sides = c.split('→').map(s => s.replace(/['"]/g, '').trim())
          if (sides.length === 2 && sides[0] === sides[1]) return false
          return true
        })
      corrections = items.length > 0 ? items.join(' | ') : null
    }

    // Persist assistant reply
    db.prepare(
      'INSERT INTO messages (session_id, role, content, corrections) VALUES (?, ?, ?, ?)'
    ).run(session_id, 'assistant', cleanContent, corrections)

    // +5 XP for chat participation
    db.prepare(
      'UPDATE user_languages SET xp = xp + 5 WHERE language_code = ? AND user_id = 1'
    ).run(session.language_code)

    res.json({ content: cleanContent, corrections })
  } catch (err) {
    console.error('[Chat] Ollama error:', err.message)
    res.status(500).json({ error: 'AI yanıtı alınamadı.', details: err.message })
  }
})

// Fetch message history for a session
router.get('/session/:id/messages', (req, res) => {
  const db = req.db
  const messages = db.prepare(
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at'
  ).all(req.params.id)
  res.json(messages)
})

// Close a session
router.patch('/session/:id/end', (req, res) => {
  const db = req.db
  db.prepare(
    "UPDATE chat_sessions SET ended_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(req.params.id)
  res.json({ success: true })
})

export default router
