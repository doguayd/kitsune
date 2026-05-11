"""
Kitsune TTS Server — Kalıcı süreç, XTTS v2 modeli bir kez VRAM'e yüklenir.
Node.js tarafından başlatılır ve stdin/stdout üzerinden JSON satırlarıyla iletişir.

stdin  (her satır bir JSON): {"text": "...", "file": "out.wav", "language": "en", "ref_wav": "..."}
stdout (her satır bir JSON): {"status": "done", "file": "out.wav"} veya {"error": "..."}
                             İlk satır: {"status": "loading"} veya {"status": "ready", "device": "cuda"}
"""
import sys
import json
import os
import warnings
warnings.filterwarnings("ignore")

LANG_MAP = {
    "en": "en", "de": "de", "zh": "zh-cn", "ja": "ja",
    "fr": "fr", "es": "es", "it": "it", "ko": "ko",
    "tr": "tr", "sv": "en",   # İsveççe desteklenmiyor, İngilizce aksanıyla
}

DEFAULT_REF = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "assets", "voices", "kitsune_default.wav"
)

def main():
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', buffering=1)

    print(json.dumps({"status": "loading", "model": "xtts_v2"}), flush=True)

    import torch
    from TTS.api import TTS

    device = "cuda" if torch.cuda.is_available() else "cpu"
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

    print(json.dumps({"status": "ready", "model": "xtts_v2", "device": device}), flush=True)

    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        try:
            req      = json.loads(line)
            text     = req["text"]
            out_file = req["file"]
            lang     = LANG_MAP.get(req.get("language", "en"), "en")
            ref_wav  = req.get("ref_wav", DEFAULT_REF)

            tts.tts_to_file(
                text=text,
                file_path=out_file,
                speaker_wav=ref_wav,
                language=lang
            )
            print(json.dumps({"status": "done", "file": out_file}), flush=True)

        except Exception as exc:
            print(json.dumps({"error": str(exc)}), flush=True)

if __name__ == "__main__":
    main()
