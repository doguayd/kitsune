import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

const STEP_COUNT = 3

export default function Onboarding() {
  const navigate = useNavigate()
  const { allLanguages, updateName, addLanguage } = useStore()

  const [step, setStep]           = useState(0)   // 0=welcome 1=name 2=language
  const [name, setName]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [selectedLang, setLang]   = useState(null)

  const handleNameNext = async () => {
    if (!name.trim()) return
    setSaving(true)
    try { await updateName(name.trim()) } finally { setSaving(false) }
    setStep(2)
  }

  const handleLangPick = async (lang) => {
    setLang(lang)
    await addLanguage(lang.code)
    navigate(`/assessment?lang=${lang.code}`)
  }

  const handleSkipLang = () => navigate('/')

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="text-center max-w-md"
          >
            <motion.div
              className="text-8xl mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              🦊
            </motion.div>
            <h1 className="text-3xl font-black text-cream mb-3">
              Kitsune'ye Hoş Geldin!
            </h1>
            <p className="text-muted text-sm leading-relaxed mb-8">
              Japon efsanesinin dokuz kuyruklu tilkisi ile dil öğren.
              Her dil bir kuyruk — dokuz dil = efsane aura.
              Yapay zeka tamamen yerel çalışır, internet gerekmez.
            </p>
            <div className="flex justify-center gap-2 mb-8">
              {Array.from({ length: 9 }, (_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-fox/30"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-3 bg-fox hover:bg-fox-light text-white font-semibold rounded-xl transition-colors"
            >
              Başlayalım →
            </button>
          </motion.div>
        )}

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="text-center max-w-sm w-full"
          >
            <p className="text-5xl mb-6">✨</p>
            <h2 className="text-2xl font-bold text-cream mb-2">Adın ne?</h2>
            <p className="text-muted text-sm mb-6">Kitsune seni bu isimle tanıyacak.</p>

            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameNext()}
              placeholder="Adını yaz..."
              className="w-full bg-panel border border-border rounded-xl px-4 py-3 text-cream text-center text-lg focus:outline-none focus:border-fox placeholder-muted mb-4"
            />

            <button
              onClick={handleNameNext}
              disabled={!name.trim() || saving}
              className="w-full py-3 bg-fox hover:bg-fox-light disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
            >
              {saving ? 'Kaydediliyor…' : 'Devam →'}
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Language pick ── */}
        {step === 2 && (
          <motion.div
            key="lang"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-lg"
          >
            <div className="text-center mb-6">
              <p className="text-5xl mb-3">🌍</p>
              <h2 className="text-2xl font-bold text-cream mb-1">İlk dilin hangisi?</h2>
              <p className="text-muted text-sm">Kısa bir seviye testi ile başlayacaksın.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {allLanguages.map(lang => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleLangPick(lang)}
                  disabled={!!selectedLang}
                  className="p-4 bg-panel border border-border hover:border-fox/40 rounded-xl text-left transition-all disabled:opacity-50"
                >
                  <div className="text-3xl mb-2">{lang.flag}</div>
                  <div className="text-cream font-medium text-sm">{lang.name}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lang.tail_color, boxShadow: `0 0 5px ${lang.tail_color}88` }}
                    />
                    <span className="text-xs text-muted">Kuyruk {lang.tail_index}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <button
              onClick={handleSkipLang}
              className="w-full py-2 text-muted text-xs hover:text-cream transition-colors"
            >
              Şimdilik geç — Ana sayfaya git
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Step dots */}
      <div className="absolute bottom-8 flex gap-2">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-fox w-5' : 'bg-border'}`}
          />
        ))}
      </div>
    </div>
  )
}
