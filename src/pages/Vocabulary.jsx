/**
 * Kitsune Vocabulary — SM-2 Spaced Repetition Flashcards
 * Features:
 *  - Due-card review (flip, rate Hard/Good/Easy)
 *  - Full word list with next-review date
 *  - Add new word form
 *  - Delete words
 */
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { api } from '../services/api'

const RATING_LABELS = [
  { quality: 1, label: 'Zor 😓',   desc: 'Hatırlayamadım',   cls: 'border-red-500    bg-red-500/15    text-red-400' },
  { quality: 3, label: 'İyi 🙂',   desc: 'Biraz uğraştım',   cls: 'border-fox        bg-fox/15        text-fox' },
  { quality: 5, label: 'Kolay 😄', desc: 'Hemen hatırladım', cls: 'border-green-500  bg-green-500/15  text-green-400' },
]

// Relative time helper
function relTime(isoDate) {
  if (!isoDate) return '—'
  const diff = Math.floor((new Date(isoDate) - Date.now()) / 86_400_000)
  if (diff <= 0)      return 'Bugün'
  if (diff === 1)     return 'Yarın'
  if (diff < 30)      return `${diff} gün`
  if (diff < 365)     return `${Math.round(diff / 30)} ay`
  return `${Math.round(diff / 365)} yıl`
}

export default function Vocabulary() {
  const [params]  = useSearchParams()
  const { user }  = useStore()
  const langs     = user?.languages ?? []
  const initLang  = params.get('lang') ?? langs[0]?.language_code ?? 'en'

  const [selectedLang, setSelectedLang] = useState(initLang)
  const [tab,          setTab]          = useState('review')  // review | list | add

  // Review state
  const [dueCards,    setDueCards]    = useState([])
  const [cardIdx,     setCardIdx]     = useState(0)
  const [flipped,     setFlipped]     = useState(false)
  const [reviewDone,  setReviewDone]  = useState(false)
  const [loading,     setLoading]     = useState(false)

  // List state
  const [allCards,    setAllCards]    = useState([])
  const [listLoading, setListLoading] = useState(false)

  // Add form
  const [addWord,   setAddWord]   = useState('')
  const [addTrans,  setAddTrans]  = useState('')
  const [addCtx,    setAddCtx]    = useState('')
  const [addErr,    setAddErr]    = useState('')
  const [addOk,     setAddOk]     = useState(false)

  const langMeta = langs.find(l => l.language_code === selectedLang)

  // ── Load due cards ──────────────────────────────────────────────────────────
  const loadDue = useCallback(async () => {
    setLoading(true)
    setCardIdx(0)
    setFlipped(false)
    setReviewDone(false)
    try {
      const { data } = await api.get(`/api/vocab/${selectedLang}/due`)
      setDueCards(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [selectedLang])

  // ── Load all cards ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setListLoading(true)
    try {
      const { data } = await api.get(`/api/vocab/${selectedLang}/all`)
      setAllCards(data ?? [])
    } finally {
      setListLoading(false)
    }
  }, [selectedLang])

  useEffect(() => {
    if (tab === 'review') loadDue()
    if (tab === 'list')   loadAll()
  }, [tab, selectedLang])

  // ── Rate current card ───────────────────────────────────────────────────────
  const rateCard = async (quality) => {
    const card = dueCards[cardIdx]
    if (!card) return
    try {
      await api.post(`/api/vocab/${card.id}/review`, { quality })
    } catch { /* silent */ }
    const next = cardIdx + 1
    if (next >= dueCards.length) {
      setReviewDone(true)
    } else {
      setCardIdx(next)
      setFlipped(false)
    }
  }

  // ── Add word ────────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault()
    setAddErr('')
    setAddOk(false)
    if (!addWord.trim()) return
    try {
      await api.post('/api/vocab', {
        language_code: selectedLang,
        word:          addWord.trim(),
        translation:   addTrans.trim(),
        context:       addCtx.trim()
      })
      setAddWord(''); setAddTrans(''); setAddCtx('')
      setAddOk(true)
      setTimeout(() => setAddOk(false), 2000)
    } catch (err) {
      setAddErr(err.response?.data?.error ?? 'Bir hata oluştu')
    }
  }

  // ── Delete word ─────────────────────────────────────────────────────────────
  const deleteCard = async (id) => {
    try {
      await api.delete(`/api/vocab/${id}`)
      setAllCards(c => c.filter(x => x.id !== id))
    } catch { /* silent */ }
  }

  const currentCard = dueCards[cardIdx]

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-cream mb-1">Kelime Kartları</h2>
          <p className="text-muted text-sm">SM-2 aralıklı tekrar — doğru zamanda doğru kart</p>
        </div>

        {/* Language selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {langs.map(l => (
            <button key={l.language_code} onClick={() => setSelectedLang(l.language_code)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all
                ${selectedLang === l.language_code
                  ? 'border-fox bg-fox/15 text-fox'
                  : 'border-border bg-panel text-muted hover:text-cream hover:border-fox/30'}`}>
              <span>{l.flag}</span><span>{l.name}</span>
            </button>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-5 bg-surface rounded-xl p-1 border border-border">
          {[
            { id: 'review', label: '🗂 Tekrar', badge: dueCards.length > 0 && tab !== 'review' ? dueCards.length : null },
            { id: 'list',   label: '📋 Tüm Kelimeler' },
            { id: 'add',    label: '➕ Kelime Ekle' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === t.id
                  ? 'bg-fox text-white shadow'
                  : 'text-muted hover:text-cream'}`}>
              {t.label}
              {t.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── REVIEW TAB ─────────────────────────────────────────── */}
          {tab === 'review' && (
            <motion.div key="review"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {loading && (
                <div className="flex flex-col items-center gap-3 py-20 text-muted">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-fox"
                        animate={{ opacity: [0.3,1,0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }} />
                    ))}
                  </div>
                  <p className="text-sm">Kartlar yükleniyor…</p>
                </div>
              )}

              {!loading && dueCards.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <span className="text-5xl">🎉</span>
                  <h3 className="text-cream font-bold text-lg">Bugünlük hepsi tamam!</h3>
                  <p className="text-muted text-sm">Tekrar edilecek kart yok. Harika iş!</p>
                  <button onClick={() => setTab('add')}
                    className="mt-2 px-5 py-2 bg-fox hover:bg-fox-light text-white text-sm
                               font-semibold rounded-xl transition-colors">
                    ➕ Kelime Ekle
                  </button>
                </div>
              )}

              {!loading && !reviewDone && currentCard && (
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{cardIdx + 1} / {dueCards.length} kart</span>
                    <span>{langMeta?.flag} {langMeta?.name}</span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-border">
                    <motion.div className="h-full bg-fox rounded-full"
                      animate={{ width: `${(cardIdx / dueCards.length) * 100}%` }}
                      transition={{ duration: 0.3 }} />
                  </div>

                  {/* Flashcard */}
                  <motion.div
                    key={currentCard.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-panel border border-border rounded-2xl p-8 text-center min-h-[220px]
                               flex flex-col items-center justify-center gap-4 cursor-pointer
                               hover:border-fox/40 transition-colors"
                    onClick={() => !flipped && setFlipped(true)}>

                    {/* Word */}
                    <p className="text-3xl font-bold text-cream">{currentCard.word}</p>

                    {/* Context */}
                    {currentCard.context && (
                      <p className="text-sm text-muted italic">"{currentCard.context}"</p>
                    )}

                    {/* Tap hint or translation */}
                    <AnimatePresence>
                      {!flipped ? (
                        <motion.p key="hint"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-xs text-muted mt-2">
                          👆 Çeviriyi görmek için tıkla
                        </motion.p>
                      ) : (
                        <motion.div key="trans"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="space-y-1">
                          <p className="text-xl text-fox-light font-semibold">
                            {currentCard.translation || '—'}
                          </p>
                          <p className="text-xs text-muted">
                            {currentCard.review_count}× tekrar · EF {currentCard.ease_factor?.toFixed(1)}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Rating buttons */}
                  <AnimatePresence>
                    {flipped && (
                      <motion.div key="ratings"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-3 gap-3">
                        {RATING_LABELS.map(r => (
                          <button key={r.quality} onClick={() => rateCard(r.quality)}
                            className={`py-3 px-2 border rounded-xl text-sm font-semibold
                                        transition-all hover:scale-105 active:scale-95 ${r.cls}`}>
                            <div>{r.label}</div>
                            <div className="text-xs font-normal opacity-70 mt-0.5">{r.desc}</div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {!loading && reviewDone && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-3">
                  <span className="text-5xl">🦊</span>
                  <h3 className="text-cream font-bold text-lg">Günlük tekrar tamam!</h3>
                  <p className="text-muted text-sm">{dueCards.length} kart tekrar edildi</p>
                  <div className="flex gap-2 justify-center pt-2">
                    <button onClick={loadDue}
                      className="px-5 py-2 bg-fox hover:bg-fox-light text-white text-sm
                                 font-semibold rounded-xl transition-colors">
                      Tekrar Yükle
                    </button>
                    <button onClick={() => setTab('add')}
                      className="px-5 py-2 bg-panel border border-border text-muted
                                 hover:text-cream text-sm rounded-xl transition-colors">
                      Kelime Ekle
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── LIST TAB ───────────────────────────────────────────── */}
          {tab === 'list' && (
            <motion.div key="list"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {listLoading && (
                <div className="text-center py-16 text-muted text-sm">Yükleniyor…</div>
              )}

              {!listLoading && allCards.length === 0 && (
                <div className="text-center py-16 space-y-2">
                  <span className="text-4xl">📭</span>
                  <p className="text-muted text-sm">Henüz kelime yok.</p>
                  <button onClick={() => setTab('add')}
                    className="mt-1 px-5 py-2 bg-fox hover:bg-fox-light text-white text-sm
                               font-semibold rounded-xl transition-colors">
                    ➕ Kelime Ekle
                  </button>
                </div>
              )}

              {!listLoading && allCards.length > 0 && (
                <div className="space-y-2">
                  {allCards.map(card => (
                    <motion.div key={card.id}
                      layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-panel border border-border rounded-xl px-4 py-3
                                 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-cream text-sm">{card.word}</span>
                          {card.translation && (
                            <span className="text-muted text-xs">— {card.translation}</span>
                          )}
                        </div>
                        {card.context && (
                          <p className="text-xs text-muted italic truncate mt-0.5">"{card.context}"</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted">{relTime(card.next_review)}</p>
                        <p className="text-xs text-muted opacity-50">{card.review_count}× tekrar</p>
                      </div>
                      <button onClick={() => deleteCard(card.id)}
                        className="text-muted hover:text-red-400 transition-colors text-xs px-2 py-1
                                   rounded-lg hover:bg-red-500/10">
                        🗑
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ADD TAB ────────────────────────────────────────────── */}
          {tab === 'add' && (
            <motion.div key="add"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              <form onSubmit={handleAdd} className="space-y-4">
                <div className="bg-panel border border-border rounded-2xl p-5 space-y-4">

                  <div>
                    <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">
                      {langMeta?.flag} {langMeta?.name} Kelime *
                    </label>
                    <input value={addWord} onChange={e => setAddWord(e.target.value)}
                      placeholder="örn. schadenfreude" required
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5
                                 text-cream text-sm focus:outline-none focus:border-fox
                                 placeholder-muted" />
                  </div>

                  <div>
                    <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">
                      Türkçe Anlam
                    </label>
                    <input value={addTrans} onChange={e => setAddTrans(e.target.value)}
                      placeholder="örn. başkasının mutsuzluğundan duyulan zevk"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5
                                 text-cream text-sm focus:outline-none focus:border-fox
                                 placeholder-muted" />
                  </div>

                  <div>
                    <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">
                      Örnek Cümle (isteğe bağlı)
                    </label>
                    <textarea value={addCtx} onChange={e => setAddCtx(e.target.value)}
                      placeholder="Kelimenin geçtiği bir cümle…" rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2.5
                                 text-cream text-sm focus:outline-none focus:border-fox
                                 placeholder-muted resize-none" />
                  </div>
                </div>

                {addErr && (
                  <p className="text-red-400 text-sm">{addErr}</p>
                )}

                <AnimatePresence>
                  {addOk && (
                    <motion.p key="ok"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-green-400 text-sm">
                      ✅ Kelime eklendi!
                    </motion.p>
                  )}
                </AnimatePresence>

                <button type="submit"
                  className="w-full py-3 bg-fox hover:bg-fox-light text-white font-semibold
                             rounded-xl transition-colors text-sm">
                  ➕ Kelimeyi Ekle
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
