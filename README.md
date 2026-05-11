# 🦊 Kitsune

**AI-powered local language learning app — fully offline, no subscriptions, no cloud.**

Kitsune runs entirely on your machine. It uses local LLMs for conversation, Whisper for speech recognition, and XTTS v2 for text-to-speech. Everything stays on your GPU.

---

## Features

- **Voice conversation mode** — hands-free, VAD-based auto-cycle: listen → transcribe → AI → speak → listen
- **Adaptive CEFR assessment** — weighted scoring across A1–C2, starts at B1 and adjusts per answer
- **Grammar corrections** — AI flags actual errors inline, never false positives
- **9 languages** — English, German, French, Spanish, Italian, Japanese, Chinese, Korean, Swedish
- **5 scenarios** — Free chat, Restaurant, Business, Travel, Shopping
- **Fully local** — Ollama + Whisper + XTTS v2, all on-device

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron + electron-vite |
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Express (port 3717) |
| Database | sql.js (WASM SQLite) |
| LLM | Ollama — `qwen3:14b` |
| STT | OpenAI Whisper `large-v3-turbo` (persistent Python process) |
| TTS | Coqui XTTS v2 (persistent Python process, CUDA) |

> Port 3717: き(3)つ(7)ね(1) — Japanese reading of "kitsune"

---

## Requirements

- **Node.js** 18+
- **Ollama** with `qwen3:14b` pulled (`ollama pull qwen3:14b`)
- **Python 3.x** with `openai-whisper` installed
- **Python** (Anaconda env) with `TTS` (Coqui) installed, CUDA-capable GPU recommended
- Configure Python paths in `server/services/modelManager.js`:
  ```js
  const WHISPER_PYTHON = 'C:/Python314/python.exe'
  const TTS_PYTHON     = 'C:/Users/.../anaconda3/envs/your_env/python.exe'
  ```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build
```

On startup, Kitsune automatically loads both Whisper and XTTS v2 into VRAM in the background. The first voice request is fast because models are already warm.

---

## Project Structure

```
kitsune/
├── src/                    # React frontend
│   ├── pages/
│   │   ├── Chat.jsx        # Main chat + voice conversation mode
│   │   ├── Assessment.jsx  # Adaptive CEFR level test
│   │   ├── Onboarding.jsx  # First-launch flow
│   │   └── Languages.jsx   # Language selection
│   ├── store/useStore.js   # Zustand global state
│   └── data/questions.js   # 270 CEFR questions (9 langs × 6 levels × 5)
├── server/                 # Express backend
│   ├── routes/
│   │   ├── chat.js         # AI conversation endpoint
│   │   ├── voice.js        # STT + TTS endpoints
│   │   └── assessment.js   # CEFR save + AI check
│   └── services/
│       ├── modelManager.js # Persistent Python process manager
│       ├── whisper.js      # STT service
│       ├── tts.js          # TTS service
│       └── ollama.js       # LLM service
├── scripts/
│   ├── whisper_server.py   # Persistent Whisper process (stdin/stdout IPC)
│   └── tts_server.py       # Persistent XTTS v2 process (stdin/stdout IPC)
└── assets/
    └── voices/
        └── kitsune_default.wav  # Reference voice for XTTS cloning
```

---

## Voice Conversation Mode

Click **🎙️ Sesli Konuş** in the chat header to enter hands-free mode:

```
listening → transcribing → thinking → speaking → listening …
```

- VAD uses Web Audio `AnalyserNode` — 1.5 s of silence after speech triggers transcription
- No button presses needed during the loop
- Click **✕ Kapat** to exit at any time

---

## License

MIT
