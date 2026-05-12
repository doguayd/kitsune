"""
Kitsune Whisper Server — faster-whisper ile kalıcı süreç.
openai-whisper'a göre 3-4× hızlı, int8/float16 GPU quantization desteği.

Kurulum (C:/Python314):
    pip install faster-whisper

stdin  (her satır bir JSON): {"file": "path/to/audio.webm", "language": "english"}
stdout (her satır bir JSON): {"text": "..."} veya {"error": "..."}
                             İlk satır: {"status": "loading"} veya {"status": "ready", "device": "cuda"}
"""
import sys
import json
import os

def main():
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', buffering=1)

    model_name   = os.environ.get("WHISPER_MODEL", "large-v3-turbo")
    device       = os.environ.get("WHISPER_DEVICE", "cuda")      # cuda | cpu
    compute_type = os.environ.get("WHISPER_COMPUTE", "float16")  # float16 | int8

    print(json.dumps({"status": "loading", "model": model_name}), flush=True)

    try:
        from faster_whisper import WhisperModel
        model = WhisperModel(model_name, device=device, compute_type=compute_type)
        actual_device = device
    except Exception as e:
        # faster-whisper yoksa openai-whisper'a düş
        print(json.dumps({"status": "loading", "fallback": "openai-whisper", "reason": str(e)}), flush=True)
        import whisper
        model = whisper.load_model(model_name)
        actual_device = "cpu"
        model = ("openai", model)

    print(json.dumps({"status": "ready", "model": model_name, "device": actual_device}), flush=True)

    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        try:
            req       = json.loads(line)
            audio_file = req["file"]
            language  = req.get("language") or None  # None = otomatik algıla

            if isinstance(model, tuple) and model[0] == "openai":
                # openai-whisper fallback
                result = model[1].transcribe(audio_file, language=language)
                text   = result["text"].strip()
            else:
                # faster-whisper — streaming segments
                segments, _ = model.transcribe(
                    audio_file,
                    language=language,
                    beam_size=5,
                    vad_filter=True,          # dahili VAD — sessizliği atlıyor
                    vad_parameters={"min_silence_duration_ms": 500},
                )
                text = "".join(seg.text for seg in segments).strip()

            print(json.dumps({"text": text}), flush=True)

        except Exception as exc:
            print(json.dumps({"error": str(exc)}), flush=True)

if __name__ == "__main__":
    main()
