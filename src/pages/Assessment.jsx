import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { api } from '../services/api'
import { QUESTIONS, LEVELS, LEVEL_START, TOTAL_QUESTIONS } from '../data/questions'

const WEIGHTS  = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }
const LEVEL_COLOR = {
  A1: '#6ee7b7', A2: '#34d399', B1: '#60a5fa', B2: '#818cf8',
  C1: '#f472b6', C2: '#f59e0b'
}

function calculateCEFR(answers) {
  if (!answers.length) return 'A1'
  const total = answers.reduce((s, { level, correct }) =>
    s + WEIGHTS[level] * (correct ? 1 : 0.25), 0)
  const avg = total / answers.length
  if (avg >= 5.2) return 'C2'
  if (avg >= 4.2) return 'C1'
  if (avg >= 3.2) return 'B2'
  if (avg >= 2.2) return 'B1'
  if (avg >= 1.4) return 'A2'
  return 'A1'
}

function adaptLevel(current, correct) {
  const idx = LEVELS.indexOf(current)
  return correct ? LEVELS[Math.min(idx + 1, 5)] : LEVELS[Math.max(idx - 1, 0)]
}

// Bir sonraki soruyu seç: aynı seviyedeki görülmemiş sorular
function pickQuestion(langCode, level, seen) {
  const pool = (QUESTIONS[langCode] ?? QUESTIONS.en).filter(
    q => q.level === level && !seen.has(q.id)
  )
  if (!pool.length) {
    // Bu seviyede kalmış soru yok — komşu seviyeden al
    const idx = LEVELS.indexOf(level)
    for (let d = 1; d <= 3; d++) {
      for (const dir of [1, -1]) {
        const altIdx = idx + d * dir
        if (altIdx < 0 || altIdx >= LEVELS.length) continue
        const alt = (QUESTIONS[langCode] ?? QUESTIONS.en).filter(
          q => q.level === LEVELS[altIdx] && !seen.has(q.id)
        )
        if (alt.length) return alt[Math.floor(Math.random() * alt.length)]
      }
    }
    return null
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Phases ─────────────────────────────────────────
// quiz → ai-check → result

export default function Assessment() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const langCode = params.get('lang') ?? 'en'
  const { user, allLanguages, loadProfile } = useStore()

  const lang = allLanguages.find(l => l.code === langCode)
  const langQuestions = QUESTIONS[langCode] ?? QUESTIONS.en

  // Quiz state
  const [phase, setPhase]         = useState('quiz')   // quiz | ai-check | result
  const [currentLevel, setLevel]  = useState(LEVEL_START)
  const [seen, setSeen]           = useState(new Set())
  const [answers, setAnswers]     = useState([])
  const [question, setQuestion]   = useState(null)
  const [selected, setSelected]   = useState(null)
  const [showFeedback, setFeedback] = useState(false)

  // AI check state
  const [aiInput, setAiInput]     = useState('')
  const [aiReply, setAiReply]     = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLevel, setAiLevel]     = useState(null)

  // Result state
  const [finalLevel, setFinalLevel] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [tailGlowing, setTailGlowing] = useState(false)

  // Load first question
  useEffect(() => {
    const q = pickQuestion(langCode, LEVEL_START, new Set())
    setQuestion(q)
  }, [langCode])

  const handleAnswer = useCallback((optIdx) => {
    if (selected !== null || !question) return
    setSelected(optIdx)
    setFeedback(true)

    const correct = optIdx === question.c
    const newAnswers = [...answers, { level: question.level, correct }]
    setAnswers(newAnswers)

    setTimeout(() => {
      setFeedback(false)
      setSelected(null)

      const newSeen = new Set([...seen, question.id])
      setSeen(newSeen)

      if (newAnswers.length >= TOTAL_QUESTIONS) {
        // Quiz done — go to AI check
        const preliminary = calculateCEFR(newAnswers)
        setAiLevel(preliminary)
        setPhase('ai-check')
        return
      }

      const nextLevel = adaptLevel(currentLevel, correct)
      setLevel(nextLevel)
      const next = pickQuestion(langCode, nextLevel, newSeen)
      setQuestion(next)
    }, 1200)
  }, [selected, question, answers, seen, currentLevel, langCode])

  const handleAiCheck = async () => {
    if (!aiInput.trim()) return
    setAiLoading(true)
    try {
      const { data } = await api.post('/api/assessment/ai-check', {
        language_code: langCode,
        preliminary_level: aiLevel,
        user_message: aiInput
      })
      setAiReply(data.reply)
      setAiLevel(data.ai_level)
    } catch {
      setAiReply('(AI yanıt veremedi — ön test sonucu kullanılıyor)')
    } finally {
      setAiLoading(false)
    }
  }

  const handleFinish = async () => {
    const result = aiLevel ?? calculateCEFR(answers)
    setFinalLevel(result)
    setSaving(true)
    try {
      await api.post('/api/assessment/save', {
        language_code: langCode,
        cefr_result: result,
        score: Math.round(answers.filter(a => a.correct).length / TOTAL_QUESTIONS * 100)
      })
      await loadProfile()
      setPhase('result')
      setTimeout(() => setTailGlowing(true), 600)
    } finally {
      setSaving(false)
    }
  }

  const progress = Math.round((answers.length / TOTAL_QUESTIONS) * 100)

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">

        {/* ── Quiz Phase ── */}
        {phase === 'quiz' && question && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{lang?.flag ?? '🌍'}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{lang?.name ?? langCode} — Seviye Testi</span>
                  <span>{answers.length} / {TOTAL_QUESTIONS}</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-fox"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${LEVEL_COLOR[currentLevel]}22`, color: LEVEL_COLOR[currentLevel] }}
              >
                {currentLevel}
              </span>
            </div>

            {/* Question */}
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-panel border border-border rounded-2xl p-6 mb-4"
            >
              <p className="text-cream font-medium text-base leading-relaxed mb-6">
                {question.q}
              </p>
              <div className="space-y-2.5">
                {question.opts.map((opt, i) => {
                  let style = 'border-border text-cream hover:border-fox/50 hover:bg-fox/5'
                  if (showFeedback) {
                    if (i === question.c)  style = 'border-success bg-success/10 text-success'
                    else if (i === selected) style = 'border-danger bg-danger/10 text-danger'
                    else style = 'border-border text-muted opacity-50'
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showFeedback}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style}`}
                    >
                      <span className="text-muted mr-2 font-mono">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            <button
              onClick={() => handleAnswer(-1)}
              className="w-full py-2 text-muted text-xs hover:text-cream transition-colors"
            >
              Bilmiyorum — geç →
            </button>
          </motion.div>
        )}

        {/* ── AI Check Phase ── */}
        {phase === 'ai-check' && (
          <motion.div
            key="ai-check"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">🦊</p>
              <h2 className="text-xl font-bold text-cream mb-1">Son adım!</h2>
              <p className="text-muted text-sm">
                Tahmini seviye: <span className="font-bold" style={{ color: LEVEL_COLOR[aiLevel] }}>{aiLevel}</span>
                <br />Kitsune ile kısa bir konuşma yap — sonuç kesinleşsin.
              </p>
            </div>

            <div className="bg-panel border border-border rounded-2xl p-5 mb-4">
              {!aiReply ? (
                <p className="text-muted text-sm text-center py-2">
                  {lang?.name ?? langCode} dilinde kendini tanıt ya da bir şeyler anlat:
                </p>
              ) : (
                <div className="flex gap-2 mb-4">
                  <span className="text-xl shrink-0">🦊</span>
                  <p className="text-cream text-sm leading-relaxed bg-surface rounded-xl px-3 py-2">
                    {aiReply}
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={`${lang?.native_name ?? langCode} dilinde yaz...`}
                  rows={2}
                  disabled={aiLoading || !!aiReply}
                  className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-cream text-sm resize-none focus:outline-none focus:border-fox placeholder-muted disabled:opacity-50"
                />
                {!aiReply && (
                  <button
                    onClick={handleAiCheck}
                    disabled={!aiInput.trim() || aiLoading}
                    className="px-4 bg-fox hover:bg-fox-light disabled:opacity-30 text-white rounded-xl transition-colors"
                  >
                    {aiLoading ? '…' : '➤'}
                  </button>
                )}
              </div>
            </div>

            {aiReply && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 justify-center mb-4">
                  <span className="text-sm text-muted">AI Seviye Tahmini:</span>
                  <span className="font-bold text-lg" style={{ color: LEVEL_COLOR[aiLevel] }}>{aiLevel}</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-3 bg-fox hover:bg-fox-light disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
            >
              {saving ? 'Kaydediliyor…' : 'Sonucu Kaydet →'}
            </button>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full mt-2 py-2 text-muted text-xs hover:text-cream transition-colors"
            >
              AI konuşması olmadan devam et
            </button>
          </motion.div>
        )}

        {/* ── Result Phase ── */}
        {phase === 'result' && finalLevel && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            {/* Kitsune with glowing tail */}
            <div className="mb-6">
              <motion.div
                className="text-8xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦊
              </motion.div>
              {tailGlowing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mt-3 flex justify-center"
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{
                      backgroundColor: lang?.tail_color ?? '#e8720c',
                      boxShadow: `0 0 20px ${lang?.tail_color ?? '#e8720c'}, 0 0 40px ${lang?.tail_color ?? '#e8720c'}55`
                    }}
                  />
                </motion.div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-cream mb-2">
              {lang?.name ?? langCode} Seviyeni Belirledik!
            </h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 mb-6"
              style={{
                borderColor: LEVEL_COLOR[finalLevel],
                backgroundColor: `${LEVEL_COLOR[finalLevel]}18`
              }}
            >
              <span className="text-4xl font-black" style={{ color: LEVEL_COLOR[finalLevel] }}>
                {finalLevel}
              </span>
              <div className="text-left">
                <p className="text-cream font-semibold text-sm">{CEFR_LABELS[finalLevel]}</p>
                <p className="text-muted text-xs">{CEFR_DESC[finalLevel]}</p>
              </div>
            </motion.div>

            <p className="text-muted text-sm mb-8">
              {lang?.flag} kuyruğun {lang?.name} rengiyle parlamaya başladı!
              Doğru seviyeden konuşmaya başla.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/chat?lang=${langCode}`)}
                className="flex-1 py-3 bg-fox hover:bg-fox-light text-white font-semibold rounded-xl transition-colors"
              >
                💬 Konuşmaya Başla
              </button>
              <button
                onClick={() => navigate('/')}
                className="py-3 px-4 border border-border text-muted hover:text-cream hover:border-fox/30 rounded-xl transition-colors text-sm"
              >
                Ana Sayfa
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

const CEFR_LABELS = {
  A1: 'Başlangıç', A2: 'Temel', B1: 'Orta-Alt',
  B2: 'Orta-Üst', C1: 'İleri', C2: 'Uzman'
}
const CEFR_DESC = {
  A1: 'Temel ifadeler ve günlük kelimeler',
  A2: 'Sık kullanılan konular ve basit iletişim',
  B1: 'Tanıdık konularda akıcı anlaşma',
  B2: 'Karmaşık konular, ana fikri anlama',
  C1: 'Zorlu metinler, akıcı ve kendiliğinden anlatım',
  C2: 'Okuduğunu kolaylıkla anlama, kendini ifade etme'
}
