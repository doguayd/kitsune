/**
 * Kitsune Model Manager
 * Whisper ve XTTS v2 için kalıcı Python süreçlerini yönetir.
 * Modeller uygulama açılışında VRAM'e yüklenir, her istek için tekrar yüklenmez.
 */
import { spawn }      from 'child_process'
import { EventEmitter } from 'events'
import { resolve, join } from 'path'
import { mkdirSync }  from 'fs'

// Python çalıştırıcıları
const WHISPER_PYTHON = 'C:/Python314/python.exe'
const TTS_PYTHON     = 'C:/Users/doguk/anaconda3/envs/baykus_env/python.exe'

// Yollar
const SCRIPTS_DIR = resolve('scripts')
export const TEMP_DIR = resolve('temp')

// temp klasörünü oluştur (yoksa)
try { mkdirSync(TEMP_DIR, { recursive: true }) } catch {}

// ─── Persistent Python Process ────────────────────────────────────────────────
class PersistentPythonProcess extends EventEmitter {
  constructor ({ name, python, script }) {
    super()
    this.name    = name
    this.python  = python
    this.script  = script
    this.proc    = null
    this.ready   = false
    this.queue   = []       // bekleyen istekler
    this.pending = null     // işlenen istek { resolve, reject }
    this._buf    = ''       // stdout satır tamponu
  }

  // ── Süreci başlat ──────────────────────────────────────────────────────────
  start () {
    if (this.proc) return
    console.log(`[${this.name}] Başlatılıyor…`)

    this.proc = spawn(this.python, [this.script], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    })

    // stdout — satır bazlı JSON okuma
    this.proc.stdout.on('data', chunk => {
      this._buf += chunk.toString()
      const lines = this._buf.split('\n')
      this._buf = lines.pop()  // yarım satırı sakla

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        this._handleLine(trimmed)
      }
    })

    // stderr — sadece hataları logla (uyarıları değil)
    this.proc.stderr.on('data', d => {
      const txt = d.toString()
      if (/error|exception/i.test(txt)) {
        console.error(`[${this.name}] stderr:`, txt.slice(0, 200))
      }
    })

    // Süreç beklenmedik çıkışı
    this.proc.on('exit', code => {
      console.warn(`[${this.name}] Süreç çıktı (kod: ${code})`)
      this.proc  = null
      this.ready = false
      if (this.pending) {
        this.pending.reject(new Error(`${this.name} süreci çıktı: ${code}`))
        this.pending = null
      }
      // Kuyruktaki tüm bekleyenleri hatayla bitir
      while (this.queue.length) {
        this.queue.shift().reject(new Error(`${this.name} süreci yeniden başlatılıyor`))
      }
    })

    this.proc.on('error', err => {
      console.error(`[${this.name}] spawn hatası:`, err.message)
    })
  }

  // ── Satır işleme ───────────────────────────────────────────────────────────
  _handleLine (line) {
    let msg
    try { msg = JSON.parse(line) } catch { return }

    if (msg.status === 'loading') {
      console.log(`[${this.name}] Model yükleniyor…`)
      this.emit('loading')
    } else if (msg.status === 'ready') {
      console.log(`[${this.name}] Hazır ✓ (${msg.device ?? ''})`)
      this.ready = true
      this.emit('ready')
      this._drain()
    } else {
      // İstek yanıtı
      if (this.pending) {
        const { resolve, reject } = this.pending
        this.pending = null
        if (msg.error) reject(new Error(msg.error))
        else           resolve(msg)
        this._drain()
      }
    }
  }

  // ── Kuyruğu işle ──────────────────────────────────────────────────────────
  _drain () {
    if (this.pending || !this.queue.length) return
    if (!this.ready) return

    const item = this.queue.shift()
    this.pending = item
    this.proc.stdin.write(JSON.stringify(item.data) + '\n')
  }

  // ── İstek gönder ──────────────────────────────────────────────────────────
  send (data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject })
      if (!this.proc) this.start()
      this._drain()
    })
  }

  get isReady () { return this.ready }
  get isAlive () { return !!this.proc }
}

// ─── Singleton'lar ────────────────────────────────────────────────────────────
let _whisper = null
let _tts     = null

export function getWhisperProcess () {
  if (!_whisper) {
    _whisper = new PersistentPythonProcess({
      name:   'Whisper',
      python: WHISPER_PYTHON,
      script: join(SCRIPTS_DIR, 'whisper_server.py')
    })
  }
  return _whisper
}

export function getTtsProcess () {
  if (!_tts) {
    _tts = new PersistentPythonProcess({
      name:   'XTTS',
      python: TTS_PYTHON,
      script: join(SCRIPTS_DIR, 'tts_server.py')
    })
  }
  return _tts
}

/**
 * Uygulama başlarken her iki modeli arka planda yükle.
 * İlk ses isteği anında cevap verilir.
 */
export function initModelProcesses () {
  console.log('[ModelManager] Modeller arka planda VRAM\'e yükleniyor…')
  getWhisperProcess().start()
  getTtsProcess().start()
}

export function getModelStatus () {
  return {
    whisper: { ready: _whisper?.isReady ?? false, alive: _whisper?.isAlive ?? false },
    tts:     { ready: _tts?.isReady     ?? false, alive: _tts?.isAlive     ?? false }
  }
}
