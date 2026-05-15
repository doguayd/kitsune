/**
 * Kitsune Learn Routes
 * Evidence-based exercise generation:
 * - 8 exercise types, CEFR-gated (A1 blocked → B1+ interleaved)
 * - Parallel session generation (5 exercises in ~same time as 1)
 * - SM-2 compatible (difficulty ratings feed back to vocabulary)
 * - Comprehensible input story mode (Krashen i+1 principle)
 */
import { Router } from 'express'
import { chat } from '../services/ollama.js'

const router = Router()

const LANG_NAMES = {
  en: 'English', de: 'German', fr: 'French',  es: 'Spanish',
  it: 'Italian', ja: 'Japanese', zh: 'Chinese', ko: 'Korean', sv: 'Swedish'
}

// ── CEFR-gated exercise type selection ────────────────────────────────────────
// A1-A2: blocked (one structure), B1+: interleaved (mixed structures)
const TYPES_BY_LEVEL = {
  A1: ['multiple_choice', 'fill_blank', 'true_false', 'word_order'],
  A2: ['multiple_choice', 'fill_blank', 'true_false', 'word_order', 'translate'],
  B1: ['multiple_choice', 'fill_blank', 'translate', 'word_order', 'error_correction', 'collocation'],
  B2: ['fill_blank', 'translate', 'error_correction', 'collocation', 'dialogue_complete', 'word_order'],
  C1: ['translate', 'error_correction', 'collocation', 'dialogue_complete', 'fill_blank'],
  C2: ['translate', 'error_correction', 'collocation', 'dialogue_complete', 'fill_blank'],
}

// ── Track-specific type overrides ─────────────────────────────────────────────
const TRACK_TYPES = {
  drill:      null,                  // uses CEFR default (interleaved)
  errorhunt:  ['error_correction'],
  dialogue:   ['dialogue_complete'],
  vocab:      ['multiple_choice', 'fill_blank', 'true_false'],
  story:      ['true_false', 'multiple_choice', 'fill_blank'],  // comprehension Qs after story
}

// ── Exercise prompts ──────────────────────────────────────────────────────────
function buildPrompt(type, lang, level, context = '') {
  const ctx = context ? `\nContext (use this topic/vocabulary): "${context.slice(0, 300)}"` : ''

  const p = {
    multiple_choice: `Create a ${level} ${lang} grammar or vocabulary multiple-choice question.${ctx}
Return ONLY valid JSON:
{"type":"multiple_choice","question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}
"answer" is the 0-based index of the correct option.`,

    fill_blank: `Create a ${level} ${lang} fill-in-the-blank sentence. Replace exactly one word/phrase with ___.${ctx}
Return ONLY valid JSON:
{"type":"fill_blank","question":"Sentence with ___ here.","answer":"correctword","hint":"brief grammar hint"}`,

    translate: `Create a ${level} ${lang} to Turkish translation exercise. Short sentence only.${ctx}
Return ONLY valid JSON:
{"type":"translate","source_text":"${lang} sentence","answer":"Turkish translation","hint":"key grammar note"}`,

    word_order: `Create a ${level} ${lang} word-order exercise. Scramble a meaningful sentence.${ctx}
Return ONLY valid JSON:
{"type":"word_order","words":["word1","word2","word3","word4","word5"],"answer":"correct full sentence","hint":"grammar tip"}`,

    error_correction: `Write a ${level} ${lang} sentence with exactly ONE grammatical error. The learner must find and fix it.${ctx}
Return ONLY valid JSON:
{"type":"error_correction","sentence":"Sentence with one error here.","error_word":"wrongword","answer":"correctedword","explanation":"Why this is wrong and what the rule is."}`,

    collocation: `Create a ${level} ${lang} collocation exercise. Give a verb or adjective and 4 noun/adverb options; only one forms a natural collocation.${ctx}
Return ONLY valid JSON:
{"type":"collocation","stem":"make","question":"Which word goes with \\"make\\"?","options":["a mistake","a walk","a problem","a travel"],"answer":0,"explanation":"We say 'make a mistake', not 'do/take a mistake'."}`,

    dialogue_complete: `Write a 3-line ${level} ${lang} dialogue. Leave line 2 (the learner's turn) blank and provide 4 options.${ctx}
Return ONLY valid JSON:
{"type":"dialogue_complete","context":"Situation description","lines":[{"speaker":"A","text":"First speaker line"},{"speaker":"You","text":"___"},{"speaker":"A","text":"Third speaker line"}],"options":["Correct response","Wrong 1","Wrong 2","Wrong 3"],"answer":0,"explanation":"Why this response fits."}`,

    true_false: `Write a ${level} ${lang} true/false statement about grammar, vocabulary, or culture.${ctx}
Return ONLY valid JSON:
{"type":"true_false","statement":"A statement about the language or a translated sentence.","answer":true,"explanation":"Why this is true/false."}`,
  }

  return p[type] ?? p.multiple_choice
}

// ── Core exercise generator ───────────────────────────────────────────────────
async function generateOne(type, lang, level, context = '') {
  const prompt = buildPrompt(type, lang, level, context)
  const response = await chat([
    { role: 'system', content: 'You are a language exercise generator. Reply with valid JSON only, no extra text or markdown.' },
    { role: 'user',   content: prompt }
  ])
  const raw   = response.message.content.trim().replace(/^```json|```$/gm, '')
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0])
}

// ── Story generator (Krashen i+1 comprehensible input) ────────────────────────
async function generateStory(lang, level) {
  const wordCounts = { A1: 60, A2: 90, B1: 130, B2: 180, C1: 240, C2: 300 }
  const words = wordCounts[level] ?? 100

  const response = await chat([
    {
      role: 'system',
      content: `You are a language teacher writing comprehensible input stories (Krashen i+1 principle).
Write at CEFR ${level} level: 90-98% familiar vocabulary, 2-10% new words.
Reply with valid JSON only.`
    },
    {
      role: 'user',
      content: `Write a short ${lang} story (~${words} words) suitable for CEFR ${level} learners.
Then provide its Turkish translation.
Return ONLY valid JSON:
{"title":"Story title in ${lang}","text":"Full story in ${lang}","translation":"Turkish translation","new_words":[{"word":"...","meaning":"Turkish meaning"}]}`
    }
  ])
  const raw   = response.message.content.trim().replace(/^```json|```$/gm, '')
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No story JSON')
  return JSON.parse(match[0])
}

// ── Select exercise types for a track ─────────────────────────────────────────
function pickTypes(cefr, track, count) {
  const pool  = TRACK_TYPES[track] ?? TYPES_BY_LEVEL[cefr] ?? TYPES_BY_LEVEL.B1
  const types = []
  for (let i = 0; i < count; i++) types.push(pool[i % pool.length])
  // For interleaved levels (B1+), shuffle the types
  if (['B1','B2','C1','C2'].includes(cefr) && track === 'drill') {
    types.sort(() => Math.random() - 0.5)
  }
  return types
}

// ── POST /api/learn/session ───────────────────────────────────────────────────
// Generates a full session (story + exercises) in parallel
router.post('/session', async (req, res) => {
  const { language_code = 'en', cefr_level = 'B1', track = 'drill', count = 5 } = req.body
  const lang = LANG_NAMES[language_code] ?? 'English'

  try {
    let story = null

    // Story mode: generate story first, then comprehension exercises based on it
    if (track === 'story') {
      story = await generateStory(lang, cefr_level)
    }

    const types   = pickTypes(cefr_level, track, count)
    const context = story?.text ?? ''

    // Generate all exercises in parallel (much faster than sequential)
    const exercises = await Promise.all(
      types.map(type =>
        generateOne(type, lang, cefr_level, context).catch(err => ({
          type: 'multiple_choice',
          question: `[Generation failed: ${err.message}]`,
          options: ['A', 'B', 'C', 'D'], answer: 0, explanation: ''
        }))
      )
    )

    res.json({ story, exercises, track, cefr_level, language_code })
  } catch (err) {
    console.error('[Learn/session]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/learn/exercise ──────────────────────────────────────────────────
router.post('/exercise', async (req, res) => {
  const { language_code = 'en', cefr_level = 'B1', exercise_type } = req.body
  const lang  = LANG_NAMES[language_code] ?? 'English'
  const pool  = TYPES_BY_LEVEL[cefr_level] ?? TYPES_BY_LEVEL.B1
  const type  = pool.includes(exercise_type) ? exercise_type : pool[Math.floor(Math.random() * pool.length)]

  try {
    const exercise = await generateOne(type, lang, cefr_level)
    res.json(exercise)
  } catch (err) {
    console.error('[Learn/exercise]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/learn/check ─────────────────────────────────────────────────────
router.post('/check', async (req, res) => {
  const { exercise, user_answer } = req.body
  if (!exercise) return res.status(400).json({ error: 'exercise required' })

  // Direct comparison types
  if (['multiple_choice', 'collocation', 'dialogue_complete'].includes(exercise.type)) {
    const correct = Number(user_answer) === Number(exercise.answer)
    const correct_answer = exercise.options?.[exercise.answer] ?? exercise.answer
    return res.json({ correct, correct_answer, explanation: exercise.explanation ?? '' })
  }

  if (exercise.type === 'true_false') {
    const ua = typeof user_answer === 'boolean' ? user_answer : user_answer === 'true'
    return res.json({ correct: ua === exercise.answer, correct_answer: exercise.answer, explanation: exercise.explanation ?? '' })
  }

  if (exercise.type === 'fill_blank') {
    const correct = (user_answer ?? '').trim().toLowerCase() === (exercise.answer ?? '').toLowerCase()
    return res.json({ correct, correct_answer: exercise.answer, explanation: exercise.hint ?? '' })
  }

  if (exercise.type === 'error_correction') {
    const correct = (user_answer ?? '').trim().toLowerCase() === (exercise.answer ?? '').toLowerCase()
    return res.json({ correct, correct_answer: exercise.answer, explanation: exercise.explanation ?? '' })
  }

  if (exercise.type === 'word_order') {
    const normalise = s => s.trim().toLowerCase().replace(/[.,!?]/g, '')
    const correct   = normalise(user_answer ?? '') === normalise(exercise.answer ?? '')
    return res.json({ correct, correct_answer: exercise.answer, explanation: exercise.hint ?? '' })
  }

  // AI-checked types (translate)
  if (exercise.type === 'translate') {
    try {
      const response = await chat([
        {
          role: 'system',
          content: 'You check language translations. Reply ONLY with valid JSON: {"correct":true/false,"feedback":"one short sentence"}'
        },
        {
          role: 'user',
          content: `Original: "${exercise.source_text}"\nExpected: "${exercise.answer}"\nUser: "${user_answer}"\nIs the user's answer correct or acceptably equivalent?`
        }
      ])
      const raw   = response.message.content.trim().replace(/^```json|```$/gm, '')
      const match = raw.match(/\{[\s\S]*\}/)
      const result = JSON.parse(match[0])
      return res.json({ ...result, correct_answer: exercise.answer })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(400).json({ error: 'Unknown exercise type' })
})

// ── POST /api/learn/xp ────────────────────────────────────────────────────────
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
