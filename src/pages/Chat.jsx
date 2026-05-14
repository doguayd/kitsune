import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { api, voiceApi } from '../services/api'
import FoxAvatar from '../components/FoxAvatar'

const SCENARIOS = [
  { id: 'free',       label: 'Serbest',   icon: '💬' },
  { id: 'restaurant', label: 'Restoran',  icon: '🍽️' },
  { id: 'business',   label: 'İş',        icon: '💼' },
  { id: 'travel',     label: 'Seyahat',   icon: '✈️' },
  { id: 'shopping',   label: 'Alışveriş', icon: '🛍️' },
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

async function playAudio(base64) {
  try {
    const binary = atob(base64)
    const bytes  = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const ctx    = new AudioContext()
    const buffer = await ctx.decodeAudioData(bytes.buffer)
    await new Promise(resolve => {
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(ctx.destination)
      src.onended = resolve
      src.start()
    })
    ctx.close()
  } catch (err) {
    console.error('[playAudio]', err)
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

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

    const hasSpeech = await new Promise(resolve => {
      const data       = new Uint8Array(analyser.frequencyBinCount)
      const THRESH     = 12
      const SILENCE_MS = 1500
      let speechDetected = false, silenceStart = null, raf

      const tick = () => {
        if (isCancelled()) { cancelAnimationFrame(raf); resolve(false); return }
        analyser.getByteTimeDomainData(data)
        const rms = Math.sqrt(data.reduce((s, v) => s + (v - 128) ** 2, 0) / data.length)
        if (rms > THRESH) { speechDetected = true; silenceStart = null }
        else if (speechDetected) {
          if (!silenceStart) silenceStart = Date.now()
          else if (Date.now() - silenceStart > SILENCE_MS) { cancelAnimationFrame(raf); resolve(true); return }
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })

    await new Promise(res => {
      mr.onstop = res
      if (mr.state !== 'inactive') mr.stop(); else res()
    })

    if (!hasSpeech || chunks.length === 0) return null
    return new Blob(chunks, { type: 'audio/webm' })
  } finally {
    try { ctx.close() } catch {}
    stream.getTracks().forEach(t => t.stop())
  }
}

// ─── Voice Conversation hook ──────────────────────────────────────────────────
function useVoiceConversation({ langCode, sendMessageRef, messagesRef, ttsOnlineRef }) {
  const [voiceMode,  setVoiceMode]  = useState(false)
  const [voiceState, setVoiceState] = useState('idle')
  const [timings,    setTimings]    = useState({})
  const [lastHeard,  setLastHeard]  = useState('')
  const activeRef = useRef(false)

  const stop = useCallback(() => {
    activeRef.current = false
    setVoiceMode(false)
    setVoiceState('idle')
    setTimings({})
    setLastHeard('')
  }, [])

  const start = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true
    setVoiceMode(true)

    ;(async () => {
      while (activeRef.current) {
        setVoiceState('listening')
        setTimings({})

        let blob = null
        try { blob = await recordWithVAD(() => !activeRef.current) }
        catch (err) { console.error('[Voice] mic:', err); await sleep(500); continue }
        if (!activeRef.current) break
        if (!blob) continue

        setVoiceState('transcribing')
        let text = ''
        const t0stt = Date.now()
        try {
          const b64    = await blobToBase64(blob)
          const { data } = await voiceApi.post('/api/voice/transcribe', {
            audio_base64: b64, language_code: langCode, ext: 'webm'
          })
          text = data.text?.trim() ?? ''
        } catch (err) { console.error('[Voice] transcribe:', err) }
        const sttMs = Date.now() - t0stt
        setTimings(p => ({ ...p, stt: sttMs }))
        console.log(`[Voice] STT: ${sttMs}ms → "${text}"`)
        if (!activeRef.current) break
        if (!text) continue
        setLastHeard(text)

        setVoiceState('thinking')
        const t0llm = Date.now()
        try { await sendMessageRef.current(text) }
        catch (err) { console.error('[Voice] send:', err); continue }
        const llmMs = Date.now() - t0llm
        setTimings(p => ({ ...p, llm: llmMs }))
        console.log(`[Voice] LLM: ${llmMs}ms`)
        if (!activeRef.current) break

        if (ttsOnlineRef.current) {
          const msgs   = messagesRef.current
          const lastAI = [...msgs].reverse().find(m => m.role === 'assistant')
          if (lastAI) {
            setVoiceState('speaking')
            const t0tts = Date.now()
            try {
              const { data: td } = await voiceApi.post('/api/voice/synthesize', {
                text: lastAI.content, language_code: langCode
              })
              const ttsMs = Date.now() - t0tts
              setTimings(p => ({ ...p, tts: ttsMs }))
              console.log(`[Voice] TTS: ${ttsMs}ms`)
              if (activeRef.current) await playAudio(td.audio_base64)
            } catch (err) { console.error('[Voice] TTS:', err) }
          }
        }
      }
      setVoiceState('idle')
      setVoiceMode(false)
      setTimings({})
    })()
  }, [langCode, sendMessageRef, messagesRef, ttsOnlineRef])

  const toggle = useCallback(() => {
    if (activeRef.current) stop(); else start()
  }, [start, stop])

  useEffect(() => () => { activeRef.current = false }, [])

  return { voiceMode, voiceState, timings, lastHeard, toggle, stop }
}

// ─── Manual mic hook ──────────────────────────────────────────────────────────
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
    } catch (err) { console.error('[Mic]', err) }
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
          audio_base64: base64, language_code: langCode, ext: 'webm'
        })
        onResult(data.text ?? '')
      } catch (err) { console.error('[Mic] transcribe:', err); onResult('') }
      finally { setTranscribing(false) }
    }
    mr.stop()
  }, [])

  return { recording, transcribing, start, stop }
}

// ─── TTS hook (manual Dinle button) ──────────────────────────────────────────
function useTTS() {
  const [loadingId, setLoadingId] = useState(null)
  const [playingId, setPlayingId] = useState(null)
  const cacheRef = useRef({})

  const play = useCallback(async (msgId, text, langCode) => {
    let base64 = cacheRef.current[msgId]
    if (!base64) {
      setLoadingId(msgId)
      try {
        const { data } = await voiceApi.post('/api/voice/synthesize', { text, language_code: langCode })
        base64 = data.audio_base64
        cacheRef.current[msgId] = base64
      } catch (err) { console.error('[TTS]', err); return }
      finally { setLoadingId(null) }
    }
    setPlayingId(msgId)
    try { await playAudio(base64) } finally { setPlayingId(null) }
  }, [])

  const stop = useCallback(() => setPlayingId(null), [])
  return { loadingId, playingId, play, stop }
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Chat() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const langCode   = params.get('lang') ?? 'en'
  const [scenario, setScenario] = useState('free')
  const [input,    setInput]    = useState('')
  const bottomRef  = useRef(null)

  const { startChat, sendMessage, messages, chatLoading, ollamaOnline, ttsOnline, user } = useStore()
  const userLang = user?.languages?.find(l => l.language_code === langCode)

  const sendMessageRef = useRef(sendMessage)
  const messagesRef    = useRef(messages)
  const ttsOnlineRef   = useRef(ttsOnline)
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])
  useEffect(() => { messagesRef.current    = messages    }, [messages])
  useEffect(() => { ttsOnlineRef.current   = ttsOnline   }, [ttsOnline])

  const mic   = useMicRecorder()
  const tts   = useTTS()
  const voice = useVoiceConversation({ langCode, sendMessageRef, messagesRef, ttsOnlineRef })

  useEffect(() => {
    if (!user) return
    if (!userLang) { navigate('/languages'); return }
    startChat(langCode, scenario)
  }, [langCode, scenario, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => () => voice.stop(), [])

  // Derive fox state from current activity
  const foxState = voice.voiceMode
    ? voice.voiceState
    : mic.transcribing
      ? 'transcribing'
      : mic.recording
        ? 'listening'
        : chatLoading
          ? 'thinking'
          : 'idle'

  const handleSend = async () => {
    const text = input.trim()
    if (!text || chatLoading || !ollamaOnline) return
    setInput('')
    try { await sendMessage(text) } catch (e) { console.error(e) }
  }

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleMicClick = () => {
    if (mic.recording) mic.stop(langCode, text => { if (text) setInput(text) })
    else mic.start()
  }

  const fmt = ms => ms != null ? `${(ms / 1000).toFixed(1)}s` : null

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 flex items-center gap-3 shrink-0"
           style={{ borderBottom: '1px solid #2a2a4a' }}>
        <span className="text-lg">{userLang?.flag ?? '💬'}</span>
        <div className="flex-1 min-w-0">
          <span className="text-cream font-semibold text-sm">{userLang?.name ?? 'Sohbet'}</span>
          <span className="text-muted text-xs ml-2">{userLang?.cefr_level ?? '—'}</span>
        </div>

        {/* Scenario picker */}
        <div className="flex gap-1">
          {SCENARIOS.map(s => (
            <button key={s.id} title={s.label} onClick={() => setScenario(s.id)}
              className={`w-7 h-7 rounded-lg text-xs transition-colors
                ${scenario === s.id
                  ? 'bg-fox text-white'
                  : 'bg-panel text-muted hover:bg-border hover:text-cream'}`}>
              {s.icon}
            </button>
          ))}
        </div>

        {/* Voice mode toggle */}
        {ttsOnline && (
          <button onClick={voice.toggle}
            title={voice.voiceMode ? 'Sesli modu kapat' : 'Sesli konuşma modu'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                        border transition-all shrink-0
                        ${voice.voiceMode
                          ? 'bg-green-500/20 text-green-400 border-green-500/40'
                          : 'bg-panel text-muted border-border hover:border-fox/40 hover:text-cream'}`}>
            {voice.voiceMode ? '🔴' : '🎙️'}
            <span>{voice.voiceMode ? 'Aktif' : 'Sesli Konuş'}</span>
          </button>
        )}
      </div>

      {/* ── Body: fox panel + messages ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Fox panel */}
        <div className="w-52 shrink-0 flex flex-col items-center justify-between py-5 px-3"
             style={{ borderRight: '1px solid #2a2a4a', background: '#0f0f1f' }}>

          <FoxAvatar state={foxState} />

          {/* Timings */}
          {(voice.timings.stt != null || voice.timings.llm != null || voice.timings.tts != null) && (
            <div className="flex flex-col gap-1 w-full mt-3">
              {voice.timings.stt != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">🎙 Ses tanıma</span>
                  <span className="text-fox font-mono">{fmt(voice.timings.stt)}</span>
                </div>
              )}
              {voice.timings.llm != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">🦊 Yapay zeka</span>
                  <span className="text-fox font-mono">{fmt(voice.timings.llm)}</span>
                </div>
              )}
              {voice.timings.tts != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">🔊 Ses üretimi</span>
                  <span className="text-fox font-mono">{fmt(voice.timings.tts)}</span>
                </div>
              )}
            </div>
          )}

          {/* Last heard */}
          {voice.lastHeard && (
            <div className="w-full mt-3 px-3 py-2 bg-surface rounded-xl text-xs text-muted italic leading-relaxed line-clamp-3">
              "{voice.lastHeard}"
            </div>
          )}

          {/* Stop voice button */}
          {voice.voiceMode && (
            <button onClick={voice.stop}
              className="mt-3 w-full py-1.5 text-xs text-danger border border-danger/30
                         bg-danger/10 hover:bg-danger/20 rounded-xl transition-colors">
              ✕ Sesli Modu Kapat
            </button>
          )}
        </div>

        {/* Messages panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted gap-3">
                <p className="text-sm">Konuşmaya başla, seninle pratik yapalım!</p>
                <p className="text-xs opacity-60">
                  {SCENARIOS.find(s => s.id === scenario)?.icon}{' '}
                  {SCENARIOS.find(s => s.id === scenario)?.label}
                </p>
                {ttsOnline && !voice.voiceMode && (
                  <button onClick={voice.toggle}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                               bg-fox/10 text-fox border border-fox/20 hover:bg-fox/20 transition-colors">
                    <span>🎙️</span><span>Sesli konuşmayı başlat</span>
                  </button>
                )}
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <Bubble
                  key={msg.id} msg={msg} langCode={langCode}
                  ttsOnline={ttsOnline && !voice.voiceMode}
                  ttsLoadingId={tts.loadingId} ttsPlayingId={tts.playingId}
                  onPlay={tts.play} onStop={tts.stop}
                />
              ))}
            </AnimatePresence>

            {chatLoading && (
              <div className="flex items-center gap-2">
                <div className="bg-panel border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <Dots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div className={`px-4 py-3 shrink-0 transition-opacity
                       ${voice.voiceMode ? 'opacity-25 pointer-events-none' : ''}`}
           style={{ borderTop: '1px solid #2a2a4a' }}>
        {!ollamaOnline && (
          <p className="text-danger text-xs text-center mb-2">
            Ollama bağlı değil — <code className="font-mono">ollama serve</code>
          </p>
        )}
        {mic.transcribing && (
          <div className="flex items-center gap-2 mb-2 text-xs text-fox">
            <Dots /><span>Ses tanınıyor…</span>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={handleMicClick}
            disabled={mic.transcribing || chatLoading || voice.voiceMode}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0
              ${mic.recording
                ? 'bg-danger text-white animate-pulse shadow-lg shadow-danger/40'
                : 'bg-panel border border-border text-muted hover:border-fox/40 hover:text-cream disabled:opacity-30'}`}>
            {mic.recording ? '⏹' : '🎙️'}
          </button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={mic.recording ? '🔴 Kaydediliyor…' : 'Mesajını yaz… (Enter = gönder)'}
            rows={2}
            disabled={chatLoading || !ollamaOnline || mic.transcribing || voice.voiceMode}
            className="flex-1 bg-panel border border-border hover:border-fox/30 focus:border-fox
                       rounded-xl px-4 py-2.5 text-cream text-sm resize-none
                       focus:outline-none placeholder-muted disabled:opacity-40 transition-colors"
          />
          <button onClick={handleSend}
            disabled={chatLoading || !input.trim() || !ollamaOnline || voice.voiceMode}
            className="px-5 bg-fox hover:bg-fox-light disabled:opacity-30
                       text-white font-bold rounded-xl transition-colors text-lg shrink-0">
            ➤
          </button>
        </div>
      </div>
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
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-fox text-white rounded-br-sm'
            : 'bg-panel border border-border text-cream rounded-bl-sm'}`}>
          {msg.content}
        </div>

        {!isUser && msg.corrections && !/^none$/i.test(msg.corrections.trim()) && (
          <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30
                          rounded-lg text-xs text-amber-400 max-w-full">
            <span className="font-semibold mr-1">✏️</span>
            {msg.corrections.split('|').map((c, i, arr) => (
              <span key={i} className="inline-block">
                {c.trim()}{i < arr.length - 1 && <span className="mx-1.5 opacity-40">·</span>}
              </span>
            ))}
          </div>
        )}

        {!isUser && ttsOnline && (
          <button
            onClick={() => isPlaying ? onStop() : onPlay(msg.id, msg.content, langCode)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
                       text-muted hover:text-cream bg-panel border border-border
                       hover:border-fox/30 transition-colors disabled:opacity-40">
            {isLoading
              ? <><Dots /><span>Üretiliyor…</span></>
              : isPlaying
                ? <><span>⏹</span><span>Durdur</span></>
                : <><span>🔊</span><span>Dinle</span></>}
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
        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  )
}
