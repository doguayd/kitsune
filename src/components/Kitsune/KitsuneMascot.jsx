import { motion } from 'framer-motion'

// One color per tail slot — matches DB seed order
const TAIL_COLORS = [
  '#4ade80', // en — green
  '#facc15', // de — gold
  '#60a5fa', // zh — blue
  '#f87171', // ja — red
  '#fb923c', // fr — orange
  '#c084fc', // es — purple
  '#fde68a', // it — cream gold
  '#f9a8d4', // ko — pink
  '#67e8f9', // sv — ice blue
]

export default function KitsuneMascot({ tails = 0, size = 'md' }) {
  const active = Math.min(tails, 9)
  const foxSize = size === 'sm' ? 'text-5xl' : 'text-8xl'
  const dotH    = size === 'sm' ? 'h-3'      : 'h-5'
  const dotW    = size === 'sm' ? 'w-1.5'    : 'w-2'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Fox emoji with floating animation */}
      <motion.div
        className={foxSize}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        🦊
      </motion.div>

      {/* Tail indicator row */}
      <div className="flex gap-1 items-end">
        {TAIL_COLORS.map((color, i) => {
          const isActive = i < active
          return (
            <motion.div
              key={i}
              className={`${dotW} ${dotH} rounded-full`}
              initial={false}
              animate={{
                backgroundColor: isActive ? color : '#2a2a4a',
                opacity:         isActive ? 1 : 0.25,
                scaleY:          isActive ? 1 : 0.6,
                boxShadow:       isActive ? `0 0 6px ${color}88` : 'none',
              }}
              transition={{ duration: 0.4 }}
              title={isActive ? `Kuyruk ${i + 1}` : 'Kilitli'}
            />
          )
        })}
      </div>

      {active === 0 && (
        <p className="text-muted text-xs">Dil ekle → kuyruk kazan!</p>
      )}
      {active === 9 && (
        <motion.p
          className="text-xs font-semibold"
          style={{ color: '#f59e0b' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✨ Efsanevi Tilki
        </motion.p>
      )}
    </div>
  )
}
