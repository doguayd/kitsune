import { readFileSync, unlinkSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { getTtsProcess, TEMP_DIR } from './modelManager.js'

const DEFAULT_VOICE = resolve('assets/voices/kitsune_default.wav')

/**
 * Metni sese dönüştürür (XTTS v2 / RTX 4090).
 * Model bellekte kalıcıdır — ilk çağrı ~7s, sonrakiler ~2-3s.
 * @returns {Promise<string>} Oluşturulan WAV dosyasının yolu
 */
export async function synthesize (text, langCode = 'en', refWav = DEFAULT_VOICE) {
  const outFile = join(TEMP_DIR, `tts_${Date.now()}.wav`)
  const proc    = getTtsProcess()

  const result = await proc.send({
    text,
    file:    outFile.replace(/\\/g, '/'),
    language: langCode,
    ref_wav:  refWav.replace(/\\/g, '/')
  })

  if (result.error) throw new Error(result.error)
  return outFile
}

export async function checkTtsStatus () {
  const proc = getTtsProcess()
  return {
    available: proc.isReady,
    ready:     proc.isReady,
    model:     'xtts_v2',
    voice:     'kitsune_default',
    gpu:       true
  }
}

export function getVoicePath (voiceName = 'kitsune_default') {
  return resolve(`assets/voices/${voiceName}.wav`)
}
