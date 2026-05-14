import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { api } from '../services/api'

const EXERCISE_TYPES = [
  { id: 'multiple_choice', label: 'Çoktan Seç',    icon: '🎯', desc: 'Doğru şıkkı bul' },
  { id: 'fill_blank',      label: 'Boşluk Doldur', icon: '✏️', desc: 'Eksik kelimeyi yaz' },
  { id: 'translate',       label: 'Çeviri',         icon: '🌐', desc: 'Türkçeye çevir' },
]

const XP_REWARD = 20

export default function Learn() {
  const [params]  = useSearchParams()
  const { user, loadProfile } = useStore()

  const langs    = user?.languages ?? []
  const initLang = params.get('lang') ?? langs[0]?.language_code ?? 'en'

  const [selectedLang, setSelectedLang]   = useState(initLang)
  const [selectedType, setSelectedType]   = useState('multiple_choice')
  const [phase, setPhase]                 = useState('select')  // select | loading | question | checking | result | done
  const [exercise, setExercise]           = useState(null)
  const [userAnswer, setUserAnswer]       = useState(null)
  const [checkResult, setCheckResult]     = useState(null)
  const [sessionScore, setSessionScore]   = useState({ correct: 0, total: 0 })
  const [sessionXP, setSessionXP]         = useState(0)
  const [fillInput, setFillInput]         = useState('')

  const langMeta  = langs.find(l => l.language_code === selectedLang)
  const cefrLevel = langMeta?.cefr_level ?? 'B1'

  const fetchExercise = async () => {
    setPhase('loading')
    setUserAnswer(null)
    setCheckResult(null)
    setFillInput('')
    try {
      const { data } = await api.post('/api/learn/exercise', {
        language_code: selectedLang,
        cefr_level:    cefrLevel,
        exercise_type: selectedType
      })
      setExercise(data)
      setPhase('question')
    } catch (err) {
      console.error('[Learn] fetch error:', err)
      setPhase('select')
    }
  }

  const submitAnswer = async (answer) => {
    if (phase !== 'question') return
    setUserAnswer(answer)
    setPhase('checking')
    try {
      const { data } = await api.post('/api/learn/check', {
        language_code: selectedLang,
        exercise,
        user_answer:   answer
      })
      setCheckResult(data)
      const newScore = {
        correct: sessionScore.correct + (data.correct ? 1 : 0),
        total:   sessionScore.total   + 1
      }
      setSessionScore(newScore)

      if (data.correct) {
        const xp = sessionXP + XP_REWARD
        setSessionXP(xp)
        await api.post('/api/learn/xp', { language_code: selectedLang, amount: XP_REWARD })
        await loadProfile()
      }
      setPhase('result')
    } catch (err) {
      console.error('[Learn] check error:', err)
      setPhase('question')
    }
  }

  const nextExercise = () => fetchExercise()
  const endSession   = () => setPhase('done')
  const restart      = () => { setSessionScore({ correct: 0, total: 0 }); setSessionXP(0); setPhase('select') }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-cream mb-1">Alıştırma</h2>
          <p className="text-muted text-sm">AI tarafından üretilen alıştırmalarla pratik yap</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── SELECT ──────────────────────────────────────────────────── */}
          {phase === 'select' && (
            <motion.div key="select"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Language picker */}
              <div className="mb-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Dil</p>
                <div className="flex flex-wrap gap-2">
                  {langs.map(l => (
                    <button
                      key={l.language_code}
                      onClick={() => setSelectedLang(l.language_code)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all
                        ${selectedLang === l.language_code
                          ? 'border-fox bg-fox/15 text-fox'
                          : 'border-border bg-panel text-muted hover:text-cream hover:border-fox/30'}`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                      <span className="text-xs opacity-60">{l.cefr_level}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise type picker */}
              <div className="mb-6">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Alıştırma Türü</p>
                <div className="grid grid-cols-3 gap-3">
                  {EXERCISE_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all
                        ${selectedType === t.id
                          ? 'border-fox bg-fox/15 text-fox'
                          : 'border-border bg-panel text-muted hover:text-cream hover:border-fox/30'}`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <span className="font-medium text-xs">{t.label}</span>
                      <span className="text-xs opacity-60 text-center">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchExercise}
                disabled={!selectedLang}
                className="w-full py-3 bg-fox hover:bg-fox-light text-white font-semibold rounded-xl
                           transition-colors disabled:opacity-40 text-sm"
              >
                🚀 Başla
              </button>
            </motion.div>
          )}

          {/* ── LOADING ─────────────────────────────────────────────────── */}
          {phase === 'loading' && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-20">
              <span className="text-5xl">🦊</span>
              <p className="text-muted text-sm">Alıştırma hazırlanıyor…</p>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <motion.div
                    key={i} className="w-2 h-2 rounded-full bg-fox"
                    animate={{ opacity: [0.3,1,0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── QUESTION / RESULT ────────────────────────────────────────── */}
          {(phase === 'question' || phase === 'checking' || phase === 'result') && exercise && (
            <motion.div key="question"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">

              {/* Session progress */}
              <div className="flex items-center justify-between text-xs text-muted">
                <span>✅ {sessionScore.correct} / {sessionScore.total}</span>
                <span className="text-fox font-semibold">+{sessionXP} XP</span>
                <span>{langMeta?.flag} {langMeta?.name} · {cefrLevel}</span>
              </div>

              {/* Exercise card */}
              <div className="bg-panel border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">
                    {EXERCISE_TYPES.find(t => t.id === exercise.type)?.icon ?? '📝'}
                  </span>
                  <span className="text-xs text-muted">
                    {EXERCISE_TYPES.find(t => t.id === exercise.type)?.label}
                  </span>
                </div>

                <p className="text-cream font-medium text-base mb-5 leading-relaxed">
                  {exercise.question ?? exercise.source_text}
                </p>

                {/* ── Multiple choice ── */}
                {exercise.type === 'multiple_choice' && (
                  <div className="grid grid-cols-2 gap-2">
                    {exercise.options?.map((opt, i) => {
                      const isSelected = userAnswer === i
                      const isCorrect  = checkResult && i === Number(exercise.answer)
                      const isWrong    = checkResult && isSelected && !checkResult.correct
                      return (
                        <button
                          key={i}
                          onClick={() => phase === 'question' && submitAnswer(i)}
                          disabled={phase !== 'question'}
                          className={`px-4 py-3 rounded-xl text-sm text-left border transition-all
                            ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-400'
                            : isWrong   ? 'bg-red-500/20   border-red-500   text-red-400'
                            : isSelected ? 'bg-fox/20 border-fox text-fox'
                            : 'bg-surface border-border text-muted hover:border-fox/40 hover:text-cream disabled:opacity-60'}`}
                        >
                          <span className="opacity-50 mr-2">{String.fromCharCode(65+i)}.</span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* ── Fill blank ── */}
                {exercise.type === 'fill_blank' && (
                  <div className="space-y-3">
                    {exercise.hint && (
                      <p className="text-xs text-muted">İpucu: {exercise.hint}</p>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={fillInput}
                        onChange={e => setFillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && phase === 'question' && fillInput.trim() && submitAnswer(fillInput.trim())}
                        placeholder="Cevabını yaz…"
                        disabled={phase !== 'question'}
                        className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5
                                   text-cream text-sm focus:outline-none focus:border-fox
                                   disabled:opacity-50 placeholder-muted"
                      />
                      <button
                        onClick={() => phase === 'question' && fillInput.trim() && submitAnswer(fillInput.trim())}
                        disabled={phase !== 'question' || !fillInput.trim()}
                        className="px-4 py-2.5 bg-fox hover:bg-fox-light text-white font-bold
                                   rounded-xl transition-colors disabled:opacity-40"
                      >
                        ➤
                      </button>
                    </div>

                    {/* Result highlight */}
                    {checkResult && (
                      <p className={`text-sm font-medium ${checkResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                        {checkResult.correct ? '✅ Doğru!' : `❌ Doğrusu: "${checkResult.correct_answer}"`}
                      </p>
                    )}
                  </div>
                )}

                {/* ── Translate ── */}
                {exercise.type === 'translate' && (
                  <div className="space-y-3">
                    {exercise.hint && (
                      <p className="text-xs text-muted">Not: {exercise.hint}</p>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={fillInput}
                        onChange={e => setFillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && phase === 'question' && fillInput.trim() && submitAnswer(fillInput.trim())}
                        placeholder="Türkçe çevirinizi yazın…"
                        disabled={phase !== 'question'}
                        className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5
                                   text-cream text-sm focus:outline-none focus:border-fox
                                   disabled:opacity-50 placeholder-muted"
                      />
                      <button
                        onClick={() => phase === 'question' && fillInput.trim() && submitAnswer(fillInput.trim())}
                        disabled={phase !== 'question' || !fillInput.trim()}
                        className="px-4 py-2.5 bg-fox hover:bg-fox-light text-white font-bold
                                   rounded-xl transition-colors disabled:opacity-40"
                      >
                        ➤
                      </button>
                    </div>

                    {phase === 'checking' && (
                      <p className="text-xs text-muted animate-pulse">AI kontrol ediyor…</p>
                    )}
                    {checkResult && (
                      <div className={`text-sm ${checkResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                        <p className="font-medium">{checkResult.correct ? '✅ Doğru!' : '❌ Yanlış'}</p>
                        {!checkResult.correct && (
                          <p className="mt-1 text-muted">Doğru cevap: <span className="text-cream">{checkResult.correct_answer}</span></p>
                        )}
                        {checkResult.feedback && (
                          <p className="mt-1 text-muted text-xs">{checkResult.feedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Explanation + XP badge */}
              <AnimatePresence>
                {phase === 'result' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-3">
                    {checkResult?.explanation && exercise.type !== 'translate' && (
                      <div className="bg-panel/60 border border-border/50 rounded-xl px-4 py-3 text-sm text-muted">
                        💡 {checkResult.explanation}
                      </div>
                    )}

                    {checkResult?.correct && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 text-fox-light font-semibold text-sm"
                      >
                        <span>⭐</span><span>+{XP_REWARD} XP kazandın!</span>
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={nextExercise}
                        className="flex-1 py-2.5 bg-fox hover:bg-fox-light text-white font-semibold
                                   rounded-xl transition-colors text-sm"
                      >
                        Sonraki →
                      </button>
                      {sessionScore.total >= 3 && (
                        <button
                          onClick={endSession}
                          className="px-4 py-2.5 bg-panel border border-border text-muted
                                     hover:text-cream rounded-xl transition-colors text-sm"
                        >
                          Bitir
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── DONE ────────────────────────────────────────────────────── */}
          {phase === 'done' && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4">
              <span className="text-6xl block">
                {sessionScore.correct / sessionScore.total >= 0.8 ? '🏆' : '🦊'}
              </span>
              <h3 className="text-xl font-bold text-cream">
                {sessionScore.correct / sessionScore.total >= 0.8 ? 'Harika!' : 'İyi iş!'}
              </h3>
              <p className="text-muted text-sm">
                {sessionScore.total} alıştırmadan {sessionScore.correct} doğru
              </p>
              <p className="text-fox-light font-semibold">+{sessionXP} XP kazandın</p>
              <button
                onClick={restart}
                className="mt-2 px-6 py-2.5 bg-fox hover:bg-fox-light text-white font-semibold
                           rounded-xl transition-colors text-sm"
              >
                Tekrar Başla
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
