import { NavLink } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import KitsuneMascot from '../Kitsune/KitsuneMascot'

const NAV = [
  { to: '/',          icon: '🏠', label: 'Ana Sayfa', end: true },
  { to: '/chat',      icon: '💬', label: 'Konuş'     },
  { to: '/learn',      icon: '📚', label: 'Öğren'     },
  { to: '/vocabulary', icon: '🃏', label: 'Kelimeler' },
  { to: '/dashboard',  icon: '📊', label: 'İlerleme'  },
  { to: '/languages', icon: '🌍', label: 'Diller'    },
]

export default function Sidebar() {
  const { serverOnline, ollamaOnline, whisperOnline, ttsOnline, user } = useStore()
  const tailCount = user?.languages?.length ?? 0
  const totalXP   = user?.languages?.reduce((s, l) => s + (l.xp ?? 0), 0) ?? 0
  const maxStreak = user?.languages?.reduce((s, l) => Math.max(s, l.streak ?? 0), 0) ?? 0

  return (
    <aside className="w-52 flex flex-col shrink-0 bg-panel"
      style={{ borderRight: '1px solid #2a2a4a' }}>

      {/* Mascot + user info */}
      <div className="py-5 flex flex-col items-center"
        style={{ borderBottom: '1px solid #2a2a4a' }}>
        <KitsuneMascot tails={tailCount} size="sm" />
        <p className="text-cream text-sm font-semibold mt-2">{user?.name ?? 'Tilki'}</p>
        {totalXP > 0 && (
          <div className="flex items-center gap-3 mt-1 text-xs text-muted">
            <span>⭐ {totalXP.toLocaleString()}</span>
            {maxStreak > 0 && <span>🔥 {maxStreak}</span>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ to, icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
               ${isActive
                 ? 'bg-fox/20 text-fox font-semibold'
                 : 'text-muted hover:bg-border hover:text-cream'}`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Service status */}
      <div className="p-3 space-y-1.5" style={{ borderTop: '1px solid #2a2a4a' }}>
        <Dot label="Sunucu"    on={serverOnline}  />
        <Dot label="Ollama AI" on={ollamaOnline}  />
        <Dot label="Whisper"   on={whisperOnline} />
        <Dot label="TTS"       on={ttsOnline}     />
      </div>
    </aside>
  )
}

function Dot({ label, on }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-success' : 'bg-danger'}`} />
      {label}
    </div>
  )
}
