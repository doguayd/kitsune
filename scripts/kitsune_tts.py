"""
Kitsune TTS — XTTS v2 tabanlı çok dilli metin-ses dönüştürücü.
Çağrı: python kitsune_tts.py <text> <output_wav> <lang_code> [reference_wav]
Node.js tarafından child_process ile çağrılır.
"""
import sys
import os
import codecs
import torch
import warnings
warnings.filterwarnings("ignore")

# XTTS v2 → Kitsune dil kodu eşlemesi
LANG_MAP = {
    "en": "en",
    "de": "de",
    "zh": "zh-cn",
    "ja": "ja",
    "fr": "fr",
    "es": "es",
    "it": "it",
    "ko": "ko",
    "tr": "tr",
    "sv": "en",   # İsveççe desteklenmiyor, İngilizce aksanıyla devam et
}

DEFAULT_REF = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "assets", "voices", "kitsune_default.wav"
)

def main():
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

    if len(sys.argv) < 4:
        print("HATA: Kullanım: python kitsune_tts.py <metin> <çıktı.wav> <dil> [referans.wav]", file=sys.stderr)
        sys.exit(1)

    text        = sys.argv[1]
    output_path = sys.argv[2]
    lang_code   = sys.argv[3]
    ref_wav     = sys.argv[4] if len(sys.argv) > 4 else DEFAULT_REF

    xtts_lang = LANG_MAP.get(lang_code, "en")

    if not os.path.exists(ref_wav):
        print(f"HATA: Referans ses bulunamadı: {ref_wav}", file=sys.stderr)
        sys.exit(1)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[TTS] Cihaz: {device} | Dil: {xtts_lang} | Model: xtts_v2", file=sys.stdout)

    from TTS.api import TTS
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

    tts.tts_to_file(
        text=text,
        file_path=output_path,
        speaker_wav=ref_wav,
        language=xtts_lang
    )

    print(f"BAŞARILI: {output_path}", file=sys.stdout)

if __name__ == "__main__":
    main()
