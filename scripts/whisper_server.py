"""
Kitsune Whisper Server — Kalıcı süreç, model bir kez VRAM'e yüklenir.
Node.js tarafından başlatılır ve stdin/stdout üzerinden JSON satırlarıyla iletişir.

stdin  (her satır bir JSON): {"file": "path/to/audio.webm", "language": "english"}
stdout (her satır bir JSON): {"text": "..."} veya {"error": "..."}
                             İlk satır: {"status": "loading"} veya {"status": "ready"}
"""
import sys
import json
import os

def main():
    # UTF-8 ve satır tamponlama — Node.js ile güvenli iletişim
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', buffering=1)

    model_name = os.environ.get("WHISPER_MODEL", "large-v3-turbo")

    print(json.dumps({"status": "loading", "model": model_name}), flush=True)

    import whisper
    model = whisper.load_model(model_name)

    print(json.dumps({"status": "ready", "model": model_name}), flush=True)

    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            audio_file = req["file"]
            language   = req.get("language") or None  # None = otomatik algıla

            result = model.transcribe(audio_file, language=language)
            text   = result["text"].strip()
            print(json.dumps({"text": text}), flush=True)

        except Exception as exc:
            print(json.dumps({"error": str(exc)}), flush=True)

if __name__ == "__main__":
    main()
