import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const LEVEL_PCT = { A1: 10, A2: 25, B1: 42, B2: 60, C1: 78, C2: 100 }

export default function Dashboard() {
  const { user, loadProfile } = useStore()
  useEffect(() => { loadProfile() }, [])

  const langs = user?.languages ?? []

  return (
    <div className="h-full overflow-auto p-6">
      <h2 className="text-xl font-bold text-cream mb-1">İlerleme</h2>
      <p className="text-muted text-sm mb-6">Dil yolculuğunun özeti</p>

      {langs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted text-sm">
          <span className="text-4xl mb-3">📊</span>
          <p>Henüz dil eklenmedi.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg">
          {langs.map((lang, i) => (
            <motion.div
              key={lang.language_code}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-panel border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-cream font-medium text-sm">{lang.name}</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${lang.tail_color}22`,
                        color: lang.tail_color
                      }}
                    >
                      {lang.cefr_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: lang.tail_color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${LEVEL_PCT[lang.cefr_level] ?? 10}%` }}
                  transition={{ duration: 0.8, delay: i * 0.07 }}
                />
              </div>

              <div className="flex justify-between mt-2 text-xs text-muted">
                <span>A1</span>
                <span>C2</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-panel/50 border border-border/50 rounded-xl max-w-lg">
        <p className="text-muted text-xs text-center">
          📅 Detaylı istatistikler, streak takibi ve SRS sistemi — Faz 3'te geliyor
        </p>
      </div>
    </div>
  )
}
