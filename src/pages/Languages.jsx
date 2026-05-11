import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function Languages() {
  const navigate = useNavigate()
  const { user, allLanguages, addLanguage, loadProfile, loadAllLanguages } = useStore()
  const added = new Set(user?.languages?.map(l => l.language_code) ?? [])

  useEffect(() => {
    loadAllLanguages()
    loadProfile()
  }, [])

  return (
    <div className="h-full overflow-auto p-6">
      <h2 className="text-xl font-bold text-cream mb-1">Dil Seç</h2>
      <p className="text-muted text-sm mb-6">
        Her yeni dil Kitsune'ye bir kuyruk kazandırır. Dokuz kuyruk = efsane!
      </p>

      <div className="grid grid-cols-3 gap-3 max-w-xl">
        {allLanguages.map(lang => {
          const isAdded = added.has(lang.code)
          return (
            <motion.button
              key={lang.code}
              whileHover={{ scale: isAdded ? 1 : 1.03 }}
              whileTap={{ scale: isAdded ? 1 : 0.97 }}
              onClick={async () => {
                if (isAdded) return
                await addLanguage(lang.code)
                navigate(`/assessment?lang=${lang.code}`)
              }}
              disabled={isAdded}
              className={`p-4 rounded-xl border text-left transition-all
                ${isAdded
                  ? 'bg-panel border-fox/40 opacity-80 cursor-default'
                  : 'bg-panel border-border hover:border-fox/40 cursor-pointer'}`}
            >
              <div className="text-3xl mb-2">{lang.flag}</div>
              <div className="text-cream font-medium text-sm">{lang.name}</div>
              <div className="text-muted text-xs">{lang.native_name}</div>

              {/* Tail color indicator */}
              <div className="mt-3 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: lang.tail_color,
                    boxShadow: `0 0 5px ${lang.tail_color}88`
                  }}
                />
                <span className="text-xs text-muted">Kuyruk {lang.tail_index}</span>
              </div>

              {isAdded && (
                <div className="mt-2 text-xs font-medium" style={{ color: lang.tail_color }}>
                  ✓ Eklendi
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {allLanguages.length === 0 && (
        <p className="text-muted text-sm mt-8">Sunucu bağlantısı bekleniyor...</p>
      )}
    </div>
  )
}
