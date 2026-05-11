import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { api, voiceApi } from '../services/api'

const SCENARIOS = [
  { id: 'free',       label: 'Serbest Sohbet',  icon: '💬' },
  { id: 'restaurant', label: 'Restoran',         icon: '🍽️' },
  { id: 'business',   label: 'İş Toplantısı',   icon: '💼' },
  { id: 'travel',     label: 'Seyahat',          icon: '✈️' },
  { id: 'shopping',   label: 'Alışveriş',        icon: '🛍️' },
]

// ─── Utilities ────────────────────────────────────────────────────────────────
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function playAudio(src) {
  return new Promise(resolve => {
    const audio = new Audio(src)
    audio.onended = resolve
    audio.onerror = resolve
    audio.play().catch(resolve)
  })
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

/**
 * Records audio with VAD.
 * Resolves with a Blob when ≥1.5s of silence follows speech.
 * Resolves with null if isCancelled() becomes true or no speech is detected.
 */
async function recordWithVAD(isCancelled) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const ctx    = new AudioContext()
  try {
    const source   = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    source.connect(analyser)

    const chunks = []
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    mr.start(100)

    // VAD: returns true if speech was detected, false if cancelled
    const hasSpeech = await new Promise(resolve => {
      const data = new Uint8Array(analyser.frequencyBinCount)
      const THRESH     = 12    // RMS threshold (0–128 scale)
      const SILENCE_MS = 1500  // silence after speech → stop
      let speechDetected = false
      let silenceStart   = null
      let raf

      const tick = () => {
        if (isCancelled()) { cancelAnimationFrame(raf); resolve(false); return }

        analyser.getByteTimeDomainData(data)
        const rms = Math.sqrt(
          data.reduce((sum, v) => sum + (v - 128) ** 2, 0) / data.length
        )

        if (rms > THRESH) {
          speechDetected = true
          silenceStart   = null
        } else if (speechDetected) {
          if (!silenceStart) silenceStart = Date.now()
          else if (Date.now() - silenceStart > SILENCE_MS) {
            cancelAnimationFrame(raf)
            resolve(true)
            return
          }
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })

    // Drain remaining audio chunks
    await new Promise(res => {
      mr.onstop = res
      if (mr.state !== 'inactive') mr.stop()
      else res()
    })

    if (!hasSpeech || chunks.length === 0) return null
    return new Blob(chunks, { type: 'audio/webm' })

  } finally {
    try { ctx.close() } catch {}
    stream.getTracks().forEach(t => t.stop())
  }
}

// ─── Voice Conversation hook ──────────────────────────────────────────────────
/**
 * Manages the voice conversation loop:
 *   listening → transcribing → thinking → speaking → listening …
 *
 * Uses refs for sendMessage / messages / ttsOnline so the loop always
 * reads the latest values without needing to restart.
 */
function useVoiceConversation({ langCode, sendMessageRef, messagesRef, ttsOnlineRef }) {
  const [voiceMode,  setVoiceMode]  = useState(false)
  const [voiceState, setVoiceState] = useState('idle')
  const activeRef = useRef(false)

  const stop = useCallback(() => {
    activeRef.current = false
    setVoiceMode(false)
    setVoiceState('idle')
  }, [])

  const start = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true
    setVoiceMode(true)

    ;(async () => {
      while (activeRef.current) {
        // ── Listen ──────────────────────────────────
        setVoiceState('listening')
        let blob = null
        try {
          blob = await recordWithVAD(() => !activeRef.current)
        } catch (err) {
          console.error('[Voice] mic error:', err)
          await sleep(500)
          continue
        }
        if (!activeRef.current) break
        if (!blob) continue   // cancelled or no speech

        // ── Transcribe ───────────────────────────────
        setVoiceState('transcribing')
        let text = ''
        try {
          const b64 = await blobToBase64(blob)
          const { data } = await voiceApi.post('/api/voice/transcribe', {
            audio_base64: b64,
            language_code: langCode,
            ext: 'webm'
          })
          text = data.text?.trim() ?? ''
        } catch (err) {
          console.error('[Voice] transcribe error:', err)
        }
        if (!activeRef.current) break
        if (!text) continue   // nothing recognised

        // ── Think (send to AI) ───────────────────────
        setVoiceState('thinking')
        try {
          await sendMessageRef.current(text)
        } catch (err) {
          console.error('[Voice] sendMessage error:', err)
          continue
        }
        if (!activeRef.current) break

        // ── Speak (TTS) ──────────────────────────────
        if (ttsOnlineRef.current) {
          const msgs   = messagesRef.current
          const lastAI = [...msgs].reverse().find(m => m.role === 'assistant')
          if (lastAI) {
            setVoiceState('speaking')
            try {
              const { data: td } = await voiceApi.post('/api/voice/synthesize', {
                text: lastAI.content,
                language_code: langCode
              })
              if (activeRef.current) {
                await playAudio(`data:audio/wav;base64,${td.audio_base64}`)
              }
            } catch (err) {
              console.error('[Voice] TTS error:', err)
            }
          }
        }
      }

      // Loop ended
      setVoiceState('idle')
      setVoiceMode(false)
    })()
  }, [langCode, sendMessageRef, messagesRef, ttsOnlineRef])

  const toggle = useCallback(() => {
    if (activeRef.current) stop()
    else start()
  }, [start, stop])

  // Clean up if component unmounts while voice is active
  useEffect(() => () => { activeRef.current = false }, [])

  return { voiceMode, voiceState, toggle, stop }
}

// ─── Mic recording hook (for manual "speak → send" button) ───────────────────
function useMicRecorder() {
  const [recording,    setRecording]    = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch (err) {
      console.error('[Mic] getUserMedia error:', err)
    }
  }, [])

  const stop = useCallback((langCode, onResult) => {
    const mr = mediaRef.current
    if (!mr || mr.state === 'inactive') return
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop())
      mediaRef.current = null
      setRecording(false)
      setTranscribing(true)
      try {
        const blob   = new Blob(chunksRef.current, { type: 'audio/webm' })
        const base64 = await blobToBase64(blob)
        const { data } = await voiceApi.post('/api/voice/transcribe', {
          audio_base64: base64,
          language_code: langCode,
          ext: 'webm'
        })
        onResult(data.text ?? '')
      } catch (err) {
        console.error('[Mic] Transcribe error:', err)
        onResult('')
      } finally {
        setTranscribing(false)
      }
    }
    mr.stop()
  }, [])

  return { recording, transcribing, start, stop }
}

// ─── TTS hook (for manual "Dinle" button on each message) ────────────────────
function useTTS() {
  const [loadingId, setLoadingId] = useState(null)
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)
  const cacheRef = useRef({})

  const play = useCallback(async (msgId, text, langCode) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPlayingId(null)

    let base64 = cacheRef.current[msgId]
    if (!base64) {
      setLoadingId(msgId)
      try {
        const { data } = await voiceApi.post('/api/voice/synthesize', { text, language_code: langCode })
        base64 = data.audio_base64
        cacheRef.current[msgId] = base64
      } catch (err) {
        console.error('[TTS] Error:', err)
        return
      } finally {
        setLoadingId(null)
      }
    }

    const audio = new Audio(`data:audio/wav;base64,${base64}`)
    audioRef.current = audio
    setPlayingId(msgId)
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
    audio.play()
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPlayingId(null)
  }, [])

  return { loadingId, playingId, play, stop }
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Chat() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const langCode  = params.get('lang') ?? 'en'
  const [scenario, setScenario] = useState('free')
  const [input,    setInput]    = useState('')
  const bottomRef = useRef(null)

  const { startChat, sendMessage, messages, chatLoading, ollamaOnline, ttsOnline, user } = useStore()
  const userLang = user?.languages?.find(l => l.language_code === langCode)

  // Stable refs for the voice conversation loop
  const sendMessageRef = useRef(sendMessage)
  const messagesRef    = useRef(messages)
  const ttsOnlineRef   = useRef(ttsOnline)
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])
  useEffect(() => { messagesRef.current    = messages    }, [messages])
  useEffect(() => { ttsOnlineRef.current   = ttsOnline   }, [ttsOnline])

  const mic   = useMicRecorder()
  const tts   = useTTS()
  const voice = useVoiceConversation({
    langCode,
    sendMessageRef,
    messagesRef,
    ttsOnlineRef
  })

  useEffect(() => {
    if (!user) return
    if (!userLang) { navigate('/languages'); return }
    startChat(langCode, scenario)
  }, [langCode, scenario, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Stop voice mode if user navigates away
  useEffect(() => () => voice.stop(), [])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || chatLoading || !ollamaOnline) return
    setInput('')
    try { await sendMessage(text) }
    catch (e) { console.error(e) }
  }

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleMicClick = () => {
    if (mic.recording) {
      mic.stop(langCode, text => { if (text) setInput(text) })
    } else {
      mic.start()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 flex items-center gap-3 shrink-0"
           style={{ borderBottom: '1px solid #2a2a4a' }}>
        <span className="text-xl">{userLang?.flag ?? '💬'}</span>
        <div className="flex-1">
          <h2 className="text-cream font-semibold text-sm">{userLang?.name ?? 'Sohbet'}</h2>
          <p className="text-muted text-xs">Seviye: {userLang?.cefr_level ?? '—'}</p>
        </div>

        {/* Scenario picker */}
        <div className="flex gap-1">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              title={s.label}
              onClick={() => setScenario(s.id)}
              className={`w-8 h-8 rounded-lg text-sm transition-colors
                ${scenario === s.id
                  ? 'bg-fox text-white'
                  : 'bg-panel text-muted hover:bg-border hover:text-cream'}`}
            >
              {s.icon}
            </button>
          ))}
        </div>

        {/* Voice conversation toggle */}
        {ttsOnline && (
          <button
            onClick={voice.toggle}
            title={voice.voiceMode ? 'Sesli modu kapat' : 'Sesli konuşma modunu aç'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                        transition-all border shrink-0
                        ${voice.voiceMode
                          ? 'bg-green-500/20 text-green-400 border-green-500/40 shadow-lg shadow-green-500/10'
                          : 'bg-panel text-muted border-border hover:border-fox/40 hover:text-cream'}`}
          >
            <span>{voice.voiceMode ? '🔴' : '🎙️'}</span>
            <span className="hidden sm:inline">{voice.voiceMode ? 'Sesli Mod' : 'Sesli Konuş'}</span>
          </button>
        )}
      </div>

      {/* ── Voice status bar (only in voice mode) ──────────────────────────── */}
      <AnimatePresence>
        {voice.voiceMode && (
          <motion.div
            key="voice-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden shrink-0"
          >
            <VoiceStatusBar state={voice.voiceState} onStop={voice.stop} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted">
            <span className="text-5xl mb-3">🦊</span>
            <p className="text-sm">Konuşmaya başla, seninle pratik yapalım!</p>
            <p className="text-xs mt-1 opacity-60">
              Senaryo: {SCENARIOS.find(s => s.id === scenario)?.label}
            </p>
            {ttsOnline && !voice.voiceMode && (
              <button
                onClick={voice.toggle}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                           bg-fox/10 text-fox border border-fox/20 hover:bg-fox/20 transition-colors"
              >
                <span>🎙️</span>
                <span>Sesli konuşma modunu başlat</span>
              </button>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <Bubble
              key={msg.id}
              msg={msg}
              langCode={langCode}
              ttsOnline={ttsOnline && !voice.voiceMode}
              ttsLoadingId={tts.loadingId}
              ttsPlayingId={tts.playingId}
              onPlay={tts.play}
              onStop={tts.stop}
            />
          ))}
        </AnimatePresence>

        {chatLoading && (
          <div className="flex items-center gap-2">
            <span className="text-lg">🦊</span>
            <div className="bg-panel border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
              <Dots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div className={`px-4 py-3 shrink-0 transition-opacity
                       ${voice.voiceMode ? 'opacity-30 pointer-events-none' : ''}`}
           style={{ borderTop: '1px solid #2a2a4a' }}>
        {!ollamaOnline && (
          <p className="text-danger text-xs text-center mb-2">
            Ollama bağlı değil — <code className="font-mono">ollama serve</code>
          </p>
        )}

        {mic.transcribing && (
          <div className="flex items-center gap-2 mb-2 text-xs text-fox">
            <Dots color="fox" />
            <span>Ses tanınıyor…</span>
          </div>
        )}

        <div className="flex gap-2">
          {/* Mic button (manual mode) */}
          <button
            onClick={handleMicClick}
            disabled={mic.transcribing || chatLoading || voice.voiceMode}
            title={mic.recording ? 'Kaydı durdur' : 'Sesle yaz'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0
              ${mic.recording
                ? 'bg-danger text-white animate-pulse shadow-lg shadow-danger/40'
                : 'bg-panel border border-border text-muted hover:border-fox/40 hover:text-cream disabled:opacity-30'}`}
          >
            {mic.recording ? '⏹' : '🎙️'}
          </button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={mic.recording ? '🔴 Kaydediliyor… (tekrar tıkla = dur)' : 'Mesajını yaz... (Enter = gönder)'}
            rows={2}
            disabled={chatLoading || !ollamaOnline || mic.transcribing || voice.voiceMode}
            className="flex-1 bg-panel border border-border hover:border-fox/30 focus:border-fox
                       rounded-xl px-4 py-2.5 text-cream text-sm resize-none
                       focus:outline-none placeholder-muted disabled:opacity-40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={chatLoading || !input.trim() || !ollamaOnline || voice.voiceMode}
            className="px-5 bg-fox hover:bg-fox-light disabled:opacity-30
                       text-white font-bold rounded-xl transition-colors text-lg shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Voice Status Bar ─────────────────────────────────────────────────────────
const VOICE_STATES = {
  listening:    { icon: '🎙️', label: 'Dinliyorum…',        color: '#22c55e' },
  transcribing: { icon: '📝', label: 'Sesi çözüyorum…',    color: '#f59e0b' },
  thinking:     { icon: '🦊', label: 'Düşünüyorum…',       color: '#e07b39' },
  speaking:     { icon: '🔊', label: 'Konuşuyorum…',       color: '#818cf8' },
  idle:         { icon: '⏳', label: 'Hazırlanıyor…',      color: '#6b7280' },
}

function VoiceStatusBar({ state, onStop }) {
  const s = VOICE_STATES[state] ?? VOICE_STATES.idle

  return (
    <div
      className="flex items-center gap-3 px-5 py-3"
      style={{
        background: s.color + '10',
        borderBottom: `1px solid ${s.color}30`
      }}
    >
      <motion.span
        key={state}
        animate={
          state === 'listening'
            ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }
            : state === 'speaking'
              ? { scale: [1, 1.15, 1] }
              : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        className="text-xl"
      >
        {s.icon}
      </motion.span>

      <span className="text-sm font-medium" style={{ color: s.color }}>
        {s.label}
      </span>

      {/* State dots */}
      {(state === 'thinking' || state === 'transcribing') && (
        <Dots />
      )}

      {/* Listening pulse rings */}
      {state === 'listening' && (
        <div className="relative flex items-center justify-center w-5 h-5">
          {[0, 1].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{ borderColor: s.color }}
              animate={{ scale: [1, 2], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.75 }}
            />
          ))}
          <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
        </div>
      )}

      <button
        onClick={onStop}
        className="ml-auto px-3 py-1 text-xs rounded-lg border transition-colors
                   bg-danger/10 text-danger border-danger/30 hover:bg-danger/20"
      >
        ✕ Kapat
      </button>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, langCode, ttsOnline, ttsLoadingId, ttsPlayingId, onPlay, onStop }) {
  const isUser    = msg.role === 'user'
  const isLoading = ttsLoadingId === msg.id
  const isPlaying = ttsPlayingId === msg.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && <span className="text-xl mt-0.5 shrink-0">🦊</span>}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-fox text-white rounded-br-sm'
            : 'bg-panel border border-border text-cream rounded-bl-sm'}`}
        >
          {msg.content}
        </div>

        {/* Corrections badge */}
        {!isUser && msg.corrections && !/^none$/i.test(msg.corrections.trim()) && (
          <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30
                          rounded-lg text-xs text-amber-400 max-w-full">
            <span className="font-semibold mr-1">✏️</span>
            {msg.corrections.split('|').map((c, i, arr) => (
              <span key={i} className="inline-block">
                {c.trim()}
                {i < arr.length - 1 && <span className="mx-1.5 opacity-40">·</span>}
              </span>
            ))}
          </div>
        )}

        {/* TTS play button (hidden during voice conversation mode) */}
        {!isUser && ttsOnline && (
          <button
            onClick={() => isPlaying ? onStop() : onPlay(msg.id, msg.content, langCode)}
            disabled={isLoading}
            title={isPlaying ? 'Durdur' : 'Sesli dinle'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
                       text-muted hover:text-cream bg-panel border border-border
                       hover:border-fox/30 transition-colors disabled:opacity-40"
          >
            {isLoading
              ? <><Dots /><span>Üretiliyor…</span></>
              : isPlaying
                ? <><span>⏹</span><span>Durdur</span></>
                : <><span>🔊</span><span>Dinle</span></>
            }
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function Dots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}
