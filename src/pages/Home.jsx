import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import KitsuneMascot from '../components/Kitsune/KitsuneMascot'

const LEVEL_PCT = { A1: 10, A2: 25, B1: 42, B2: 60, C1: 78, C2: 100 }

export default function Home() {
  const { user, loadProfile, ollamaOnline, serverOnline } = useStore()
  const navigate = useNavigate()

  useEffect(() => { loadProfile() }, [])

  const langs = user?.languages ?? []

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <KitsuneMascot tails={langs.length} />

        <h1 className="text-3xl font-bold text-cream mt-6 mb-1">
          Merhaba, {user?.name ?? 'Tilki'}! 👋
        </h1>
        <p className="text-muted text-sm mb-8">
          Bugün hangi dili pratik etmek istiyorsun?
        </p>

        {/* Status banners */}
        {!serverOnline && (
          <Banner danger>
            ⚠️ Kitsune sunucusu başlatılamadı. Uygulamayı yeniden başlat.
          </Banner>
        )}
        {serverOnline && !ollamaOnline && (
          <Banner danger>
            ⚠️ Ollama bağlantısı yok.&nbsp;
            <code className="font-mono bg-black/20 px-1 rounded">ollama serve</code>
            &nbsp;komutunu çalıştır.
          </Banner>
        )}

        {/* Language cards */}
        {langs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
            {langs.map(lang => (
              <LangCard
                key={lang.language_code}
                lang={lang}
                onClick={() => navigate(`/chat?lang=${lang.language_code}`)}
              />
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/languages')}
              className="col-span-2 p-3 border border-dashed border-border hover:border-fox/40
                         rounded-xl text-muted hover:text-fox text-sm transition-colors"
            >
              + Yeni dil ekle
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/languages')}
            className="mt-2 px-7 py-3 bg-fox hover:bg-fox-light text-white font-semibold
                       rounded-xl transition-colors shadow-lg shadow-fox/20"
          >
            🌍 İlk dilini ekle →
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

function LangCard({ lang, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="p-4 bg-panel border border-border hover:border-fox/40
                 rounded-xl text-left transition-all"
    >
      <div className="text-2xl mb-1">{lang.flag}</div>
      <div className="text-cream font-medium text-sm">{lang.name}</div>
      <div className="text-muted text-xs mb-2">Seviye: {lang.cefr_level}</div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${LEVEL_PCT[lang.cefr_level] ?? 10}%`,
            backgroundColor: lang.tail_color
          }}
        />
      </div>
    </motion.button>
  )
}

function Banner({ children, danger }) {
  return (
    <div className={`mb-5 px-4 py-2.5 rounded-lg text-sm
      ${danger
        ? 'bg-danger/10 border border-danger/30 text-danger'
        : 'bg-success/10 border border-success/30 text-success'}`}
    >
      {children}
    </div>
  )
}
