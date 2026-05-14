import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const XP_LEVELS = [
  { level: 'A1', min: 0,     max: 500   },
  { level: 'A2', min: 500,   max: 1500  },
  { level: 'B1', min: 1500,  max: 3500  },
  { level: 'B2', min: 3500,  max: 7000  },
  { level: 'C1', min: 7000,  max: 12000 },
  { level: 'C2', min: 12000, max: 20000 },
]

function xpProgress(xp, cefrLevel) {
  const band = XP_LEVELS.find(l => l.level === cefrLevel) ?? XP_LEVELS[XP_LEVELS.length - 1]
  const pct  = Math.min(100, Math.max(0, ((xp - band.min) / (band.max - band.min)) * 100))
  return { pct, remaining: Math.max(0, band.max - xp) }
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-cream font-bold text-lg leading-tight">{value}</p>
        <p className="text-muted text-xs">{label}</p>
        {sub && <p className="text-fox text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, loadProfile } = useStore()
  useEffect(() => { loadProfile() }, [])

  const langs     = user?.languages ?? []
  const totalXP   = langs.reduce((s, l) => s + (l.xp ?? 0), 0)
  const maxStreak = langs.reduce((s, l) => Math.max(s, l.streak ?? 0), 0)

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-cream mb-1">İlerleme</h2>
          <p className="text-muted text-sm">Dil yolculuğunun özeti</p>
        </div>

        {langs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-muted text-sm gap-3">
            <span className="text-5xl">📊</span>
            <p>Henüz dil eklenmedi.</p>
            <Link to="/languages"
              className="px-4 py-2 bg-fox/15 text-fox border border-fox/30 rounded-xl
                         text-sm hover:bg-fox/25 transition-colors">
              Dil Ekle →
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon="⭐" label="Toplam XP"       value={totalXP.toLocaleString()} />
              <StatCard icon="🔥" label="En yüksek seri"  value={`${maxStreak} gün`}
                sub={maxStreak > 0 ? 'Devam et!' : undefined} />
              <StatCard icon="🌍" label="Öğrenilen dil"   value={langs.length} />
            </div>

            {/* Per-language cards */}
            <div className="space-y-4">
              {langs.map((lang, i) => {
                const xp     = lang.xp     ?? 0
                const streak = lang.streak ?? 0
                const { pct, remaining } = xpProgress(xp, lang.cefr_level)
                return (
                  <motion.div
                    key={lang.language_code}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-panel border border-border rounded-xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{lang.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-cream font-semibold">{lang.name}</span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: lang.tail_color + '22', color: lang.tail_color }}>
                            {lang.cefr_level}
                          </span>
                        </div>
                        <p className="text-muted text-xs mt-0.5">
                          {xp.toLocaleString()} XP
                          {remaining > 0 && ` · Sonraki seviyeye ${remaining.toLocaleString()} XP`}
                        </p>
                      </div>
                    </div>

                    {/* XP bar */}
                    <div className="h-2 bg-border rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: lang.tail_color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: i * 0.07 }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>🔥 {streak} günlük seri</span>
                      <div className="flex gap-2">
                        <Link to={`/chat?lang=${lang.language_code}`}
                          className="px-2.5 py-1 bg-surface border border-border rounded-lg
                                     hover:border-fox/40 hover:text-cream transition-colors">
                          Konuş
                        </Link>
                        <Link to={`/learn?lang=${lang.language_code}`}
                          className="px-2.5 py-1 bg-fox/10 border border-fox/20 text-fox rounded-lg
                                     hover:bg-fox/20 transition-colors">
                          Alıştırma
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
