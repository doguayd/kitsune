import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const STATE_META = {
  idle:         { label: '',              color: '#e8720c' },
  listening:    { label: 'Dinliyorum…',   color: '#22c55e' },
  transcribing: { label: 'Anlıyorum…',    color: '#f59e0b' },
  thinking:     { label: 'Düşünüyorum…',  color: '#f59e0b' },
  speaking:     { label: 'Konuşuyorum…',  color: '#818cf8' },
}

export default function FoxAvatar({ state = 'idle' }) {
  const [blink, setBlink]           = useState(false)
  const [mouthPhase, setMouthPhase] = useState(0)   // 0=closed  1=half  2=open
  const blinkTimer = useRef(null)

  // ── Random blink ──────────────────────────────────────────────────────
  useEffect(() => {
    const schedule = () => {
      blinkTimer.current = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 120)
      }, 2200 + Math.random() * 3800)
    }
    schedule()
    return () => clearTimeout(blinkTimer.current)
  }, [])

  // ── Speaking mouth cycle ───────────────────────────────────────────────
  useEffect(() => {
    if (state !== 'speaking') { setMouthPhase(0); return }
    const id = setInterval(() => setMouthPhase(p => (p + 1) % 3), 170)
    return () => clearInterval(id)
  }, [state])

  const meta  = STATE_META[state] ?? STATE_META.idle
  const eyeRy = blink ? 1.5
    : state === 'thinking'  ? 7
    : state === 'listening' ? 17
    : 14

  const mouthD =
    state === 'thinking'
      ? 'M 95 172 Q 120 172 145 175'
      : state === 'speaking'
        ? ['M 98 170 Q 120 183 142 170',
           'M 98 170 Q 120 192 142 170',
           'M 98 170 Q 120 199 142 170'][mouthPhase]
        : 'M 98 170 Q 120 185 142 170'   // smile

  // ── Body animation per state ───────────────────────────────────────────
  const bodyAnim =
    state === 'idle'     ? { y: [0, -7, 0] } :
    state === 'speaking' ? { rotate: [-1, 1, -1] } :
    state === 'thinking' ? { rotate: -5 } :
    { y: 0, rotate: 0 }

  const bodyTransition =
    state === 'idle'     ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } :
    state === 'speaking' ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } :
    { duration: 0.35, ease: 'easeOut' }

  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      {/* Glow backdrop */}
      <div className="relative flex items-center justify-center">
        {state !== 'idle' && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 260, height: 260,
              background: `radial-gradient(circle, ${meta.color}20 0%, transparent 70%)`
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        )}

        <motion.div
          animate={bodyAnim}
          transition={bodyTransition}
          style={{ width: 210, height: 228 }}
        >
          <svg
            viewBox="0 0 240 260"
            width="210" height="228"
            style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.55))' }}
          >
            {/* ── Ears ──────────────────────────────────────────────────── */}
            <polygon points="28,92  6,14  80,58" fill="#c86008"/>
            <polygon points="28,92  6,14  80,58" fill="#e8720c"/>
            <polygon points="38,84 20,26  72,56" fill="#fcd5b0"/>

            <polygon points="212,92 234,14 160,58" fill="#c86008"/>
            <polygon points="212,92 234,14 160,58" fill="#e8720c"/>
            <polygon points="202,84 220,26 168,56" fill="#fcd5b0"/>

            {/* Listening: ear glow */}
            {state === 'listening' && (
              <motion.circle
                cx="14" cy="22" r="7" fill={meta.color}
                animate={{ scale: [1, 1.7, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.85, repeat: Infinity }}
              />
            )}

            {/* ── Head ──────────────────────────────────────────────────── */}
            <ellipse cx="120" cy="148" rx="92" ry="88" fill="#c86008"/>
            <ellipse cx="120" cy="145" rx="90" ry="86" fill="#e8720c"/>
            {/* Forehead highlight */}
            <ellipse cx="120" cy="100" rx="52" ry="28" fill="#f59e0b" opacity="0.16"/>

            {/* ── Muzzle ────────────────────────────────────────────────── */}
            <ellipse cx="120" cy="174" rx="56" ry="44" fill="#f5f0e8"/>

            {/* ── Cheeks ────────────────────────────────────────────────── */}
            <ellipse cx="50"  cy="153" rx="22" ry="13" fill="#fb7185" opacity="0.22"/>
            <ellipse cx="190" cy="153" rx="22" ry="13" fill="#fb7185" opacity="0.22"/>

            {/* ── Left eye ──────────────────────────────────────────────── */}
            <motion.ellipse cx="82"  cy="127" rx="21"
              animate={{ ry: eyeRy }} transition={{ duration: 0.08 }}
              fill="#f5f0e8"/>
            <motion.ellipse cx="85"  cy="129" rx="13"
              animate={{ ry: Math.max(0.8, eyeRy * 0.75) }} transition={{ duration: 0.08 }}
              fill="#1a1a2e"/>
            {!blink && <circle cx="91"  cy="122" r="5.5" fill="white" opacity="0.85"/>}
            {!blink && <circle cx="80"  cy="134" r="2"   fill="white" opacity="0.4"/>}

            {/* ── Right eye ─────────────────────────────────────────────── */}
            <motion.ellipse cx="158" cy="127" rx="21"
              animate={{ ry: eyeRy }} transition={{ duration: 0.08 }}
              fill="#f5f0e8"/>
            <motion.ellipse cx="161" cy="129" rx="13"
              animate={{ ry: Math.max(0.8, eyeRy * 0.75) }} transition={{ duration: 0.08 }}
              fill="#1a1a2e"/>
            {!blink && <circle cx="167" cy="122" r="5.5" fill="white" opacity="0.85"/>}
            {!blink && <circle cx="156" cy="134" r="2"   fill="white" opacity="0.4"/>}

            {/* ── Nose ──────────────────────────────────────────────────── */}
            <ellipse cx="120" cy="157" rx="10" ry="7" fill="#1a1a2e"/>
            <ellipse cx="117" cy="154" rx="4"  ry="3" fill="white" opacity="0.35"/>

            {/* ── Mouth ─────────────────────────────────────────────────── */}
            <motion.path
              animate={{ d: mouthD }}
              transition={{ duration: 0.07 }}
              fill="none" stroke="#1a1a2e"
              strokeWidth="3.2" strokeLinecap="round"
            />
            {state === 'speaking' && mouthPhase >= 1 && (
              <motion.ellipse
                cx="120" cy={mouthPhase === 2 ? 186 : 183}
                rx={mouthPhase === 2 ? 14 : 10}
                ry={mouthPhase === 2 ? 9 : 6}
                fill="#fca5a5" opacity="0.72"
                initial={{ opacity: 0 }} animate={{ opacity: 0.72 }}
                transition={{ duration: 0.05 }}
              />
            )}

            {/* ── Thinking dots ─────────────────────────────────────────── */}
            {state === 'thinking' && [0, 1, 2].map(i => (
              <motion.circle
                key={i} cx={148 + i * 18} cy={75} r={5.5}
                fill={meta.color}
                animate={{ opacity: [0.3, 1, 0.3], cy: [75, 67, 75] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.26 }}
              />
            ))}

            {/* ── Transcribing: waveform bars ───────────────────────────── */}
            {state === 'transcribing' && [0, 1, 2, 3, 4].map(i => (
              <motion.rect
                key={i} x={103 + i * 9} rx="2" width="5"
                fill={meta.color}
                animate={{ height: [5, 18, 5], y: [83, 73, 83] }}
                transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.11 }}
              />
            ))}

            {/* ── Listening: concentric rings ───────────────────────────── */}
            {state === 'listening' && [0, 1].map(i => (
              <motion.circle
                key={i} cx="120" cy="118"
                r={28 + i * 20}
                fill="none" stroke={meta.color} strokeWidth="1.8"
                animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.75 }}
                style={{ transformOrigin: '120px 118px' }}
              />
            ))}

            {/* ── Neck / body stub ──────────────────────────────────────── */}
            <ellipse cx="120" cy="248" rx="42" ry="17" fill="#c86008"/>
            <ellipse cx="120" cy="243" rx="49" ry="21" fill="#e8720c"/>
            <ellipse cx="120" cy="252" rx="38" ry="11" fill="#0d0d1a" opacity="0.25"/>
          </svg>
        </motion.div>
      </div>

      {/* State label */}
      <AnimatePresence mode="wait">
        {meta.label && (
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-semibold tracking-wide"
            style={{ color: meta.color }}
          >
            {meta.label}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
