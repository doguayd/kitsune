import { Router } from 'express'
import { chat } from '../services/ollama.js'

const router = Router()

const LANG_NAMES = {
  en: 'English', de: 'German', fr: 'French', es: 'Spanish',
  it: 'Italian', ja: 'Japanese', zh: 'Chinese', ko: 'Korean', sv: 'Swedish'
}

const EXERCISE_PROMPTS = {
  multiple_choice: (lang, level) =>
    `Create a grammar or vocabulary multiple-choice question for a ${level} ${lang} learner.
Return ONLY valid JSON (no extra text):
{"type":"multiple_choice","question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}
The "answer" field is the 0-based index of the correct option.`,

  fill_blank: (lang, level) =>
    `Create a fill-in-the-blank sentence for a ${level} ${lang} learner. Replace exactly one word with ___.
Return ONLY valid JSON:
{"type":"fill_blank","question":"The sentence with ___ here.","answer":"missingword","hint":"brief hint"}`,

  translate: (lang, level) =>
    `Create a translation exercise for a ${level} ${lang} learner.
Give a short ${lang} sentence and its correct Turkish translation.
Return ONLY valid JSON:
{"type":"translate","source_text":"${lang} sentence here","answer":"Turkish translation here","hint":"grammar note"}`,
}

/**
 * POST /api/learn/exercise
 * Body: { language_code, cefr_level, exercise_type }
 */
router.post('/exercise', async (req, res) => {
  const { language_code = 'en', cefr_level = 'B1', exercise_type } = req.body
  const langName = LANG_NAMES[language_code] ?? 'English'

  const types    = ['multiple_choice', 'fill_blank', 'translate']
  const type     = types.includes(exercise_type) ? exercise_type : types[Math.floor(Math.random() * types.length)]
  const prompt   = EXERCISE_PROMPTS[type](langName, cefr_level)

  try {
    const response = await chat([
      { role: 'system', content: 'You are a language exercise generator. Reply with valid JSON only.' },
      { role: 'user',   content: prompt }
    ])

    const raw       = response.message.content.trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')

    const exercise = JSON.parse(jsonMatch[0])
    res.json(exercise)
  } catch (err) {
    console.error('[Learn/exercise]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/learn/check
 * Body: { language_code, exercise, user_answer }
 * For multiple_choice: user_answer is index (number)
 * For fill_blank: user_answer is string
 * For translate: user_answer is string → AI checks
 */
router.post('/check', async (req, res) => {
  const { exercise, user_answer } = req.body
  if (!exercise) return res.status(400).json({ error: 'exercise required' })

  if (exercise.type === 'multiple_choice') {
    const correct = Number(user_answer) === Number(exercise.answer)
    return res.json({
      correct,
      correct_answer: exercise.options[exercise.answer],
      explanation:    exercise.explanation ?? ''
    })
  }

  if (exercise.type === 'fill_blank') {
    const correct = (user_answer ?? '').trim().toLowerCase() === exercise.answer.toLowerCase()
    return res.json({
      correct,
      correct_answer: exercise.answer,
      explanation:    exercise.hint ?? ''
    })
  }

  if (exercise.type === 'translate') {
    try {
      const response = await chat([
        {
          role: 'system',
          content: 'You are a translation checker. Reply with valid JSON only: {"correct":true/false,"feedback":"one short sentence"}'
        },
        {
          role: 'user',
          content: `Original sentence: "${exercise.source_text}"\nExpected translation: "${exercise.answer}"\nUser's answer: "${user_answer}"\n\nIs the user's translation correct or acceptably equivalent?`
        }
      ])
      const raw       = response.message.content.trim()
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      const result    = JSON.parse(jsonMatch[0])
      return res.json({ ...result, correct_answer: exercise.answer })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(400).json({ error: 'Unknown exercise type' })
})

/**
 * POST /api/learn/xp
 * Body: { language_code, amount }
 */
router.post('/xp', (req, res) => {
  const { language_code, amount = 20 } = req.body
  const db = req.db
  db.prepare(
    'UPDATE user_languages SET xp = xp + ? WHERE language_code = ? AND user_id = 1'
  ).run(amount, language_code)
  const row = db.prepare(
    'SELECT xp, streak FROM user_languages WHERE language_code = ? AND user_id = 1'
  ).get(language_code)
  res.json(row ?? { xp: 0, streak: 0 })
})

export default router
