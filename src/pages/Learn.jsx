/**
 * Kitsune Learn Page — Faz 3
 * Session-based exercise flow with 5 tracks, 8 exercise types, story mode
 */
import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { api } from '../services/api'

// ── Constants ─────────────────────────────────────────────────────────────────
const TRACKS = [
  { id: 'drill',     label: 'Hızlı Antrenman', icon: '⚡', desc: 'Karışık alıştırma seti',     color: 'fox' },
  { id: 'story',     label: 'Hikaye Modu',      icon: '📖', desc: 'Oku, anla, öğren (i+1)',      color: 'blue' },
  { id: 'errorhunt', label: 'Hata Avı',          icon: '🔍', desc: 'Hataları bul ve düzelt',      color: 'red' },
  { id: 'dialogue',  label: 'Diyalog',            icon: '💬', desc: 'Konuşma senaryosu pratiği',   color: 'green' },
  { id: 'vocab',     label: 'Kelime Kartları',    icon: '🃏', desc: 'Kelime ve ifade alıştırması', color: 'purple' },
]

const TYPE_META = {
  multiple_choice:  { icon: '🎯', label: 'Çoktan Seç' },
  fill_blank:       { icon: '✏️', label: 'Boşluk Doldur' },
  translate:        { icon: '🌐', label: 'Çeviri' },
  word_order:       { icon: '🔀', label: 'Kelime Sırala' },
  error_correction: { icon: '🔍', label: 'Hata Düzelt' },
  collocation:      { icon: '🤝', label: 'Eşleştir' },
  dialogue_complete:{ icon: '💬', label: 'Diyalog Tamamla' },
  true_false:       { icon: '⚖️', label: 'Doğru / Yanlış' },
}

const XP_REWARD    = 20
const SESSION_SIZE = 5

// ── Track colour helper ───────────────────────────────────────────────────────
const trackClasses = {
  fox:    { border: 'border-fox',    bg: 'bg-fox/15',    text: 'text-fox',    btn: 'bg-fox hover:bg-fox-light' },
  blue:   { border: 'border-blue-500',  bg: 'bg-blue-500/15',  text: 'text-blue-400',  btn: 'bg-blue-500 hover:bg-blue-400' },
  red:    { border: 'border-red-500',   bg: 'bg-red-500/15',   text: 'text-red-400',   btn: 'bg-red-500 hover:bg-red-400' },
  green:  { border: 'border-green-500', bg: 'bg-green-500/15', text: 'text-green-400', btn: 'bg-green-500 hover:bg-green-400' },
  purple: { border: 'border-purple-500',bg: 'bg-purple-500/15',text: 'text-purple-400',btn: 'bg-purple-500 hover:bg-purple-400' },
}

// ── Helper: normalise answer strings ─────────────────────────────────────────
const norm = s => (s ?? '').trim().toLowerCase().replace(/[.,!?]/g, '')

// ── Word-order subcomponent ───────────────────────────────────────────────────
function WordOrder({ words, onSubmit, disabled }) {
  const [built, setBuilt]       = useState([])
  const [remaining, setRemain]  = useState([...words])

  const addWord = idx => {
    setBuilt(b => [...b, remaining[idx]])
    setRemain(r => r.filter((_, i) => i !== idx))
  }
  const removeWord = idx => {
    setRemain(r => [...r, built[idx]])
    setBuilt(b => b.filter((_, i) => i !== idx))
  }
  const reset = () => { setBuilt([]); setRemain([...words]) }

  return (
    <div className="space-y-4">
      {/* Built sentence */}
      <div className="min-h-12 p-3 bg-surface border border-border rounded-xl flex flex-wrap gap-2 items-center">
        {built.length === 0
          ? <span className="text-muted text-sm">Kelimelere tıklayarak cümle oluştur…</span>
          : built.map((w, i) => (
            <button key={i} onClick={() => !disabled && removeWord(i)}
              className="px-3 py-1.5 bg-fox/20 border border-fox/40 text-fox rounded-lg text-sm
                         hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-colors">
              {w}
            </button>
          ))
        }
      </div>

      {/* Remaining word pool */}
      <div className="flex flex-wrap gap-2">
        {remaining.map((w, i) => (
          <button key={i} onClick={() => !disabled && addWord(i)}
            className="px-3 py-1.5 bg-panel border border-border text-cream rounded-lg text-sm
                       hover:border-fox/40 hover:text-fox transition-colors disabled:opacity-50">
            {w}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={reset} disabled={disabled || built.length === 0}
          className="px-3 py-2 bg-panel border border-border text-muted text-xs rounded-lg
                     hover:text-cream transition-colors disabled:opacity-40">
          ↺ Sıfırla
        </button>
        <button
          onClick={() => onSubmit(built.join(' '))}
          disabled={disabled || built.length === 0}
          className="flex-1 py-2 bg-fox hover:bg-fox-light text-white text-sm font-semibold
                     rounded-lg transition-colors disabled:opacity-40"
        >
          Gönder
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Learn() {
  const [params]  = useSearchParams()
  const { user, loadProfile } = useStore()

  const langs     = user?.languages ?? []
  const initLang  = params.get('lang') ?? langs[0]?.language_code ?? 'en'

  // Selection state
  const [selectedLang,  setSelectedLang]  = useState(initLang)
  const [selectedTrack, setSelectedTrack] = useState('drill')

  // Session state
  const [phase, setPhase]             = useState('select')   // select|loading|story|exercise|checking|result|done
  const [session, setSession]         = useState(null)        // { story, exercises, track, cefr_level }
  const [exerciseIdx, setExerciseIdx] = useState(0)

  // Answer state (reset per exercise)
  const [userAnswer,   setUserAnswer]   = useState(null)
  const [textInput,    setTextInput]    = useState('')
  const [checkResult,  setCheckResult]  = useState(null)

  // Score state
  const [score, setScore]   = useState({ correct: 0, total: 0 })
  const [totalXP, setTotalXP] = useState(0)

  // Word-order key for re-mounting
  const [woKey, setWoKey] = useState(0)

  // ── Derived ────────────────────────────────────────────────────────────────
  const langMeta   = langs.find(l => l.language_code === selectedLang)
  const cefrLevel  = langMeta?.cefr_level ?? 'B1'
  const trackMeta  = TRACKS.find(t => t.id === selectedTrack) ?? TRACKS[0]
  const tc         = trackClasses[trackMeta.color] ?? trackClasses.fox
  const exercise   = session?.exercises?.[exerciseIdx] ?? null
  const typeMeta   = TYPE_META[exercise?.type] ?? { icon: '📝', label: 'Alıştırma' }

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    setPhase('loading')
    setScore({ correct: 0, total: 0 })
    setTotalXP(0)
    setExerciseIdx(0)
    setUserAnswer(null)
    setTextInput('')
    setCheckResult(null)
    try {
      const { data } = await api.post('/api/learn/session', {
        language_code: selectedLang,
        cefr_level:    cefrLevel,
        track:         selectedTrack,
        count:         SESSION_SIZE
      })
      setSession(data)
      if (data.story) setPhase('story')
      else            setPhase('exercise')
    } catch (err) {
      console.error('[Learn] session error:', err)
      setPhase('select')
    }
  }, [selectedLang, cefrLevel, selectedTrack])

  // ── Submit answer ──────────────────────────────────────────────────────────
  const submitAnswer = useCallback(async (answer) => {
    if (phase !== 'exercise') return
    setUserAnswer(answer)
    setPhase('checking')
    try {
      const { data } = await api.post('/api/learn/check', { exercise, user_answer: answer })
      setCheckResult(data)
      const newScore = {
        correct: score.correct + (data.correct ? 1 : 0),
        total:   score.total + 1
      }
      setScore(newScore)
      if (data.correct) {
        const newXP = totalXP + XP_REWARD
        setTotalXP(newXP)
        await api.post('/api/learn/xp', { language_code: selectedLang, amount: XP_REWARD })
        await loadProfile()
      }
      setPhase('result')
    } catch (err) {
      console.error('[Learn] check error:', err)
      setPhase('exercise')
    }
  }, [phase, exercise, score, totalXP, selectedLang, loadProfile])

  // ── Next exercise ──────────────────────────────────────────────────────────
  const nextExercise = () => {
    const next = exerciseIdx + 1
    if (next >= (session?.exercises?.length ?? SESSION_SIZE)) {
      setPhase('done')
    } else {
      setExerciseIdx(next)
      setUserAnswer(null)
      setTextInput('')
      setCheckResult(null)
      setWoKey(k => k + 1)
      setPhase('exercise')
    }
  }

  const restart = () => {
    setSession(null)
    setPhase('select')
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  const answerBtn = (value, label, idx) => {
    const isSelected = userAnswer === value
    const isCorrect  = checkResult && value === Number(exercise.answer)
    const isWrong    = checkResult && isSelected && !checkResult.correct
    return (
      <button
        key={idx}
        onClick={() => phase === 'exercise' && submitAnswer(value)}
        disabled={phase !== 'exercise'}
        className={`w-full px-4 py-3 rounded-xl text-sm text-left border transition-all
          ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-400'
          : isWrong   ? 'bg-red-500/20   border-red-500   text-red-400'
          : isSelected ? `${tc.bg} ${tc.border} ${tc.text}`
          : 'bg-surface border-border text-muted hover:border-fox/40 hover:text-cream disabled:opacity-60'}`}
      >
        <span className="opacity-50 mr-2 font-mono text-xs">{String.fromCharCode(65 + idx)}.</span>
        {label}
      </button>
    )
  }

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-cream mb-1">Alıştırma</h2>
          <p className="text-muted text-sm">Kanıtlanmış yöntemlerle {langMeta?.name ?? 'dil'} öğren</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── SELECT ────────────────────────────────────────────────── */}
          {phase === 'select' && (
            <motion.div key="select"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">

              {/* Language */}
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Dil</p>
                <div className="flex flex-wrap gap-2">
                  {langs.map(l => (
                    <button key={l.language_code} onClick={() => setSelectedLang(l.language_code)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all
                        ${selectedLang === l.language_code
                          ? 'border-fox bg-fox/15 text-fox'
                          : 'border-border bg-panel text-muted hover:text-cream hover:border-fox/30'}`}>
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                      <span className="text-xs opacity-50">{l.cefr_level}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Track */}
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Mod</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRACKS.map(t => {
                    const c = trackClasses[t.color]
                    const active = selectedTrack === t.id
                    return (
                      <button key={t.id} onClick={() => setSelectedTrack(t.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all
                          ${active ? `${c.border} ${c.bg}` : 'border-border bg-panel hover:border-fox/30'}`}>
                        <span className="text-2xl mt-0.5">{t.icon}</span>
                        <div>
                          <p className={`font-semibold text-sm ${active ? c.text : 'text-cream'}`}>{t.label}</p>
                          <p className="text-xs text-muted mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button onClick={startSession} disabled={!selectedLang}
                className="w-full py-3 bg-fox hover:bg-fox-light text-white font-semibold
                           rounded-xl transition-colors disabled:opacity-40 text-sm">
                🚀 {trackMeta.icon} {trackMeta.label} Başlat
              </button>
            </motion.div>
          )}

          {/* ── LOADING ───────────────────────────────────────────────── */}
          {phase === 'loading' && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-24">
              <span className="text-5xl">{trackMeta.icon}</span>
              <p className="text-cream font-medium">Oturum hazırlanıyor…</p>
              <p className="text-muted text-xs">{SESSION_SIZE} alıştırma paralel oluşturuluyor</p>
              <div className="flex gap-1.5 mt-2">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-fox"
                    animate={{ opacity: [0.3,1,0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STORY ─────────────────────────────────────────────────── */}
          {phase === 'story' && session?.story && (
            <motion.div key="story"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">

              <div className="bg-panel border border-blue-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span>📖</span>
                  <h3 className="font-bold text-cream">{session.story.title}</h3>
                  <span className="ml-auto text-xs text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full">
                    {session.cefr_level}
                  </span>
                </div>

                <p className="text-cream leading-relaxed text-sm whitespace-pre-wrap">
                  {session.story.text}
                </p>

                {/* Translation toggle */}
                <details className="group">
                  <summary className="cursor-pointer text-xs text-muted hover:text-cream list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                    Türkçe Çeviriyi Göster
                  </summary>
                  <p className="mt-2 text-muted text-sm leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
                    {session.story.translation}
                  </p>
                </details>

                {/* New words */}
                {session.story.new_words?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted mb-2">🆕 Yeni Kelimeler</p>
                    <div className="flex flex-wrap gap-2">
                      {session.story.new_words.map((nw, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-500/10 border border-blue-500/30
                                                  text-blue-300 rounded-lg text-xs">
                          <span className="font-semibold">{nw.word}</span>
                          <span className="opacity-60"> — {nw.meaning}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setPhase('exercise')}
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold
                           rounded-xl transition-colors text-sm">
                Anlama Sorularına Geç →
              </button>
            </motion.div>
          )}

          {/* ── EXERCISE / CHECKING / RESULT ──────────────────────────── */}
          {['exercise','checking','result'].includes(phase) && exercise && (
            <motion.div key={`ex-${exerciseIdx}`}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                  <span>Alıştırma {exerciseIdx + 1} / {session.exercises.length}</span>
                  <span>✅ {score.correct}  ·  <span className={tc.text}>+{totalXP} XP</span></span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-fox rounded-full"
                    animate={{ width: `${((exerciseIdx) / session.exercises.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Exercise card */}
              <div className="bg-panel border border-border rounded-2xl p-5 space-y-4">

                {/* Type badge */}
                <div className="flex items-center gap-2">
                  <span>{typeMeta.icon}</span>
                  <span className="text-xs text-muted">{typeMeta.label}</span>
                  {phase === 'checking' && (
                    <span className="ml-auto text-xs text-muted animate-pulse">Kontrol ediliyor…</span>
                  )}
                </div>

                {/* ── TRUE / FALSE ── */}
                {exercise.type === 'true_false' && (
                  <>
                    <p className="text-cream font-medium leading-relaxed">{exercise.statement}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[true, false].map(val => {
                        const label = val ? '✅ Doğru' : '❌ Yanlış'
                        const isSelected = userAnswer === val
                        const isCorrect  = checkResult && val === exercise.answer
                        const isWrong    = checkResult && isSelected && !checkResult.correct
                        return (
                          <button key={String(val)}
                            onClick={() => phase === 'exercise' && submitAnswer(val)}
                            disabled={phase !== 'exercise'}
                            className={`py-4 rounded-xl border text-sm font-semibold transition-all
                              ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-400'
                              : isWrong   ? 'bg-red-500/20 border-red-500 text-red-400'
                              : isSelected ? `${tc.bg} ${tc.border} ${tc.text}`
                              : 'bg-surface border-border text-muted hover:border-fox/40 hover:text-cream disabled:opacity-60'}`}>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* ── MULTIPLE CHOICE & COLLOCATION ── */}
                {(exercise.type === 'multiple_choice' || exercise.type === 'collocation') && (
                  <>
                    <p className="text-cream font-medium leading-relaxed">
                      {exercise.question}
                    </p>
                    {exercise.type === 'collocation' && (
                      <p className="text-sm text-muted">
                        Fiil / sıfat: <span className="text-fox font-semibold">"{exercise.stem}"</span>
                      </p>
                    )}
                    <div className="space-y-2">
                      {exercise.options?.map((opt, i) => answerBtn(i, opt, i))}
                    </div>
                  </>
                )}

                {/* ── DIALOGUE COMPLETE ── */}
                {exercise.type === 'dialogue_complete' && (
                  <>
                    {exercise.context && (
                      <p className="text-xs text-muted italic border-l-2 border-fox/30 pl-3">
                        {exercise.context}
                      </p>
                    )}
                    <div className="space-y-2">
                      {exercise.lines?.map((line, i) => (
                        <div key={i} className={`flex gap-2 text-sm
                          ${line.speaker === 'You' ? 'justify-end' : ''}`}>
                          <div className={`px-3 py-2 rounded-xl max-w-[80%]
                            ${line.speaker === 'You'
                              ? 'bg-fox/15 border border-fox/30 text-fox'
                              : 'bg-surface border border-border text-muted'}`}>
                            <span className="text-xs opacity-50 mr-1">{line.speaker}:</span>
                            {line.text === '___'
                              ? <span className="text-muted italic">???</span>
                              : line.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-1">
                      {exercise.options?.map((opt, i) => answerBtn(i, opt, i))}
                    </div>
                  </>
                )}

                {/* ── FILL BLANK ── */}
                {exercise.type === 'fill_blank' && (
                  <>
                    <p className="text-cream font-medium leading-relaxed">{exercise.question}</p>
                    {exercise.hint && (
                      <p className="text-xs text-muted">💡 İpucu: {exercise.hint}</p>
                    )}
                    <div className="flex gap-2">
                      <input value={textInput} onChange={e => setTextInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && phase === 'exercise' && textInput.trim() && submitAnswer(textInput.trim())}
                        placeholder="Cevabını yaz…" disabled={phase !== 'exercise'}
                        className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5
                                   text-cream text-sm focus:outline-none focus:border-fox
                                   disabled:opacity-50 placeholder-muted" />
                      <button onClick={() => phase === 'exercise' && textInput.trim() && submitAnswer(textInput.trim())}
                        disabled={phase !== 'exercise' || !textInput.trim()}
                        className="px-4 py-2.5 bg-fox hover:bg-fox-light text-white font-bold
                                   rounded-xl transition-colors disabled:opacity-40">➤</button>
                    </div>
                    {checkResult && (
                      <p className={`text-sm ${checkResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                        {checkResult.correct ? '✅ Doğru!' : `❌ Doğrusu: "${checkResult.correct_answer}"`}
                      </p>
                    )}
                  </>
                )}

                {/* ── ERROR CORRECTION ── */}
                {exercise.type === 'error_correction' && (
                  <>
                    <div>
                      <p className="text-xs text-muted mb-2">Bu cümlede bir hata var. Yanlış kelimeyi düzelt:</p>
                      <p className="text-cream font-medium leading-relaxed bg-surface border border-border
                                    rounded-xl px-4 py-3">
                        {exercise.sentence}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input value={textInput} onChange={e => setTextInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && phase === 'exercise' && textInput.trim() && submitAnswer(textInput.trim())}
                        placeholder="Doğru kelimeyi yaz…" disabled={phase !== 'exercise'}
                        className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5
                                   text-cream text-sm focus:outline-none focus:border-fox
                                   disabled:opacity-50 placeholder-muted" />
                      <button onClick={() => phase === 'exercise' && textInput.trim() && submitAnswer(textInput.trim())}
                        disabled={phase !== 'exercise' || !textInput.trim()}
                        className="px-4 py-2.5 bg-fox hover:bg-fox-light text-white font-bold
                                   rounded-xl transition-colors disabled:opacity-40">➤</button>
                    </div>
                    {checkResult && (
                      <div className={`text-sm ${checkResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                        <p>{checkResult.correct ? '✅ Doğru!' : `❌ Doğrusu: "${checkResult.correct_answer}"`}</p>
                        {!checkResult.correct && exercise.error_word && (
                          <p className="text-xs text-muted mt-1">
                            Hatalı kelime: <span className="line-through text-red-400">{exercise.error_word}</span>
                            {' → '}<span className="text-green-400">{exercise.answer}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── TRANSLATE ── */}
                {exercise.type === 'translate' && (
                  <>
                    <div>
                      <p className="text-xs text-muted mb-2">Türkçeye çevir:</p>
                      <p className="text-cream font-medium leading-relaxed bg-surface border border-border
                                    rounded-xl px-4 py-3 text-lg">
                        {exercise.source_text}
                      </p>
                    </div>
                    {exercise.hint && (
                      <p className="text-xs text-muted">💡 {exercise.hint}</p>
                    )}
                    <div className="flex gap-2">
                      <input value={textInput} onChange={e => setTextInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && phase === 'exercise' && textInput.trim() && submitAnswer(textInput.trim())}
                        placeholder="Türkçe çevirinizi yazın…" disabled={phase !== 'exercise'}
                        className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5
                                   text-cream text-sm focus:outline-none focus:border-fox
                                   disabled:opacity-50 placeholder-muted" />
                      <button onClick={() => phase === 'exercise' && textInput.trim() && submitAnswer(textInput.trim())}
                        disabled={phase !== 'exercise' || !textInput.trim()}
                        className="px-4 py-2.5 bg-fox hover:bg-fox-light text-white font-bold
                                   rounded-xl transition-colors disabled:opacity-40">➤</button>
                    </div>
                    {phase === 'checking' && (
                      <p className="text-xs text-muted animate-pulse">🤖 AI cevabı kontrol ediyor…</p>
                    )}
                    {checkResult && (
                      <div className={`text-sm ${checkResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                        <p className="font-medium">{checkResult.correct ? '✅ Doğru!' : '❌ Yanlış'}</p>
                        {!checkResult.correct && (
                          <p className="mt-1 text-muted text-xs">
                            Beklenen: <span className="text-cream">{checkResult.correct_answer}</span>
                          </p>
                        )}
                        {checkResult.feedback && (
                          <p className="mt-1 text-muted text-xs">{checkResult.feedback}</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── WORD ORDER ── */}
                {exercise.type === 'word_order' && (
                  <>
                    <p className="text-xs text-muted">Kelimeleri doğru sıraya diz:</p>
                    {exercise.hint && (
                      <p className="text-xs text-muted">💡 {exercise.hint}</p>
                    )}
                    <WordOrder key={woKey} words={exercise.words ?? []}
                      onSubmit={submitAnswer} disabled={phase !== 'exercise'} />
                    {checkResult && (
                      <p className={`text-sm ${checkResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                        {checkResult.correct
                          ? '✅ Doğru!'
                          : `❌ Doğrusu: "${checkResult.correct_answer}"`}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Result footer */}
              <AnimatePresence>
                {phase === 'result' && (
                  <motion.div key="result-footer"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-3">

                    {/* Explanation */}
                    {checkResult?.explanation && (
                      <div className="bg-panel/60 border border-border/50 rounded-xl px-4 py-3 text-sm text-muted">
                        💡 {checkResult.explanation}
                      </div>
                    )}

                    {/* XP badge */}
                    {checkResult?.correct && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 text-fox font-semibold text-sm">
                        ⭐ +{XP_REWARD} XP
                      </motion.div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <button onClick={nextExercise}
                        className="flex-1 py-2.5 bg-fox hover:bg-fox-light text-white font-semibold
                                   rounded-xl transition-colors text-sm">
                        {exerciseIdx + 1 >= (session?.exercises?.length ?? SESSION_SIZE)
                          ? 'Sonuçları Gör 🏆'
                          : 'Sonraki →'}
                      </button>
                      <button onClick={() => setPhase('done')}
                        className="px-4 py-2.5 bg-panel border border-border text-muted
                                   hover:text-cream rounded-xl transition-colors text-sm">
                        Bitir
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── DONE ──────────────────────────────────────────────────── */}
          {phase === 'done' && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4">

              <div className="text-6xl">
                {score.total === 0 ? '🦊'
                 : score.correct / score.total >= 0.8 ? '🏆'
                 : score.correct / score.total >= 0.5 ? '🦊'
                 : '📚'}
              </div>

              <div>
                <h3 className="text-xl font-bold text-cream">
                  {score.total === 0 ? 'Oturum Bitti'
                   : score.correct / score.total >= 0.8 ? 'Harika gitti! 🎉'
                   : score.correct / score.total >= 0.5 ? 'İyi iş!'
                   : 'Biraz daha pratik gerekli'}
                </h3>
                <p className="text-muted text-sm mt-1">
                  {trackMeta.icon} {trackMeta.label}  ·  {langMeta?.flag} {langMeta?.name}  ·  {cefrLevel}
                </p>
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                <div className="bg-panel border border-border rounded-xl p-3">
                  <p className="text-2xl font-bold text-cream">{score.correct}</p>
                  <p className="text-xs text-muted mt-1">Doğru</p>
                </div>
                <div className="bg-panel border border-border rounded-xl p-3">
                  <p className="text-2xl font-bold text-cream">{score.total}</p>
                  <p className="text-xs text-muted mt-1">Toplam</p>
                </div>
                <div className="bg-panel border border-fox/30 rounded-xl p-3">
                  <p className="text-2xl font-bold text-fox">+{totalXP}</p>
                  <p className="text-xs text-muted mt-1">XP</p>
                </div>
              </div>

              {/* Accuracy bar */}
              {score.total > 0 && (
                <div className="max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>Doğruluk</span>
                    <span>{Math.round((score.correct / score.total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        score.correct / score.total >= 0.8 ? 'bg-green-500'
                        : score.correct / score.total >= 0.5 ? 'bg-fox'
                        : 'bg-red-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score.correct / score.total) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <button onClick={startSession}
                  className="px-6 py-2.5 bg-fox hover:bg-fox-light text-white font-semibold
                             rounded-xl transition-colors text-sm">
                  🔄 Tekrar
                </button>
                <button onClick={restart}
                  className="px-6 py-2.5 bg-panel border border-border text-muted
                             hover:text-cream rounded-xl transition-colors text-sm">
                  Mod Seç
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
