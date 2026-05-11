# Kitsune — Proje Yol Haritası

> AI destekli, tamamen yerel çalışan dil öğrenme uygulaması.
> Maskot: Japon mitolojisinden dokuz kuyruklu tilki (Kitsune/Kyuubi).
> Her dil = bir kuyruk. Seviye atladıkça kuyruk parlar.

---

## Hızlı Referans

| Şey | Detay |
|-----|-------|
| Proje yolu | `F:\Projeler\Kitsune` |
| Geliştirme komutu | `npm run dev` |
| Build | `npm run build` |
| Sunucu portu | `3717` (き·つ·ね) |
| Varsayılan AI modeli | `qwen3:14b` (Ollama) |
| Veritabanı | sql.js (WASM SQLite — derleme gerektirmez) |
| DB dosya konumu | `%APPDATA%\kitsune\kitsune.db` |

---

## Gereksinimler

### Kurulu olması gerekenler

| Program | Durum | Not |
|---------|-------|-----|
| Node.js 18+ | ✅ (v24.13.1) | |
| npm | ✅ | |
| Git | ✅ | |
| Ollama | ✅ çalışıyor | `ollama serve` ile başlatılır |
| `qwen3:14b` modeli | ✅ kurulu | Tüm diller için kullanılıyor |
| `qwen2.5:7b` modeli | ✅ kurulu | CJK (Çince/Japonca/Korece) yedek |

### İleriki fazlarda gerekecek olanlar

| Program | Faz | Kurulum | Not |
|---------|-----|---------|-----|
| openai-whisper (Python) | Faz 2 | ✅ kurulu (`F:\Projeler\whisper-main`) | Ses → metin (STT) |
| Whisper `large-v3-turbo` modeli | Faz 2 | ✅ indirilmiş (`~/.cache/whisper/`) | Hızlı + çok dilli |
| Coqui TTS / XTTS v2 | Faz 2 | ✅ kurulu (`baykus_env` conda ortamı) | Metin → ses, ses klonlama |
| XTTS v2 modeli | Faz 2 | ✅ indirilmiş (`%LOCALAPPDATA%\tts\`) | RTX 4090 GPU ile hızlı |
| Kitsune referans ses | Faz 2 | ✅ `assets/voices/kitsune_default.wav` | BaykuşFM'den alındı |
| Python 3.10+ | Faz 2 | ✅ (3.14.3 + anaconda baykus_env) | |
| ffmpeg | Faz 2 | ✅ kurulu | Ses dönüşümü için |

---

## Mimari Özeti

```
Electron (masaüstü kabuk)
├── Renderer — React + Vite + Tailwind + Framer Motion
│   ├── Zustand (global state)
│   ├── React Router (sayfa yönlendirme)
│   └── Axios → http://127.0.0.1:3717
└── Main — Node.js
    ├── Express sunucu (:3717)
    ├── sql.js — SQLite veritabanı (WASM)
    ├── Ollama API (:11434)
    ├── [Faz 2] Whisper STT
    └── [Faz 2] Piper TTS
```

### Desteklenen Diller ve Kuyruklar

| # | Kuyruk | Dil | Renk | Model |
|---|--------|-----|------|-------|
| 1 | 🟢 | İngilizce (en) | `#4ade80` | qwen3:14b |
| 2 | 🟡 | Almanca (de) | `#facc15` | qwen3:14b |
| 3 | 🔵 | Çince (zh) | `#60a5fa` | qwen3:14b |
| 4 | 🔴 | Japonca (ja) | `#f87171` | qwen3:14b |
| 5 | 🟠 | Fransızca (fr) | `#fb923c` | qwen3:14b |
| 6 | 🟣 | İspanyolca (es) | `#c084fc` | qwen3:14b |
| 7 | 🟨 | İtalyanca (it) | `#fde68a` | qwen3:14b |
| 8 | 🩷 | Korece (ko) | `#f9a8d4` | qwen3:14b |
| 9 | 🩵 | İsveççe (sv) | `#67e8f9` | qwen3:14b |

---

## ✅ FAZ 0 — Temel Altyapı `[TAMAMLANDI]`

> Commit: `feat: Faz 0 tamamlandı — Kitsune iskelet kurulumu`

### Yapılanlar

- [x] Electron + React + Vite + Tailwind + Framer Motion kurulumu
- [x] electron-vite yapılandırması (entry point, renderer, preload)
- [x] Özel pencere çubuğu (titlebar drag, minimize/maximize/close)
- [x] Express sunucu (port 3717) — Electron main process içinde çalışır
- [x] sql.js WASM veritabanı — better-sqlite3 yerine (Windows ClangCL sorunu çözüldü)
- [x] better-sqlite3 uyumlu wrapper API (`.prepare().get()/.all()/.run()`)
- [x] Tam veritabanı şeması: users, languages, user_languages, chat_sessions, messages, vocabulary, level_assessments
- [x] 9 dil için seed verisi (kod, isim, bayrak, kuyruk rengi)
- [x] Varsayılan kullanıcı oluşturma
- [x] Ollama API entegrasyonu (`/api/ai/status`, `/api/ai/models`)
- [x] qwen3:14b varsayılan model olarak ayarlandı
- [x] Chat oturumu yönetimi (session başlat, mesaj gönder, geçmiş yükle)
- [x] Gramer düzeltme sistemi — AI `[CORRECTIONS: ...]` bloğunu otomatik ayıklar
- [x] Senaryo sistemi: serbest, restoran, iş toplantısı, seyahat, alışveriş
- [x] Kitsune maskotu — her dil bir kuyruk, seviyeye göre parlaklık
- [x] Ana Sayfa — dil kartları, CEFR seviye çubuğu, Ollama uyarısı
- [x] Chat sayfası — mesaj baloncukları, yazıyor animasyonu, düzeltme kutusu
- [x] Diller sayfası — dil ekleme, kuyruk rengi göstergesi
- [x] Dashboard sayfası — CEFR ilerleme çubukları (iskelet)
- [x] Sidebar — sayfa navigasyonu, sunucu/Ollama durum göstergesi
- [x] Git deposu başlatıldı, ilk commit atıldı

---

## ✅ FAZ 1 — Seviye Ölçümü & Onboarding `[TAMAMLANDI]`

> Commit: `feat: Faz 1 tamamlandı — adaptif seviye testi + onboarding`

### Yapılanlar

- [x] **Placement test motoru** — yeni dil eklendiğinde otomatik tetiklenir
  - [x] Çoktan seçmeli kelime/gramer soruları (A1→C2 arası sıralı)
  - [x] Cevaplara göre adaptif soru seçimi (doğru → daha zor, yanlış → daha kolay)
  - [x] AI ile kısa konuşma turu (1 mesaj, seviyeyi analiz eder)
  - [x] Sonuç: CEFR skoru (A1/A2/B1/B2/C1/C2) + açıklama
- [x] **Sonuç sayfası animasyonu** — Kitsune'nin yeni kuyruğu belirip parlar
- [x] **Soru bankası** — 9 dil × 6 seviye × 5 soru = 270 soru (`src/data/questions.js`)
- [x] **Seviye tekrar testi** — Languages sayfasından yeniden erişilebilir
- [x] **Onboarding akışı** — uygulamayı ilk açanlar için karşılama ekranı
  - [x] İsim girişi
  - [x] İlk dil seçimi
  - [x] Hemen test başlar

---

## ✅ FAZ 2 — Konuşma & Ses `[TAMAMLANDI]`

> Commit: `feat: Faz 2 tamamlandı — Whisper STT + XTTS v2 TTS entegrasyonu`

### Yapılanlar

- [x] **Whisper STT entegrasyonu** (openai-whisper, yerel, internet yok)
  - [x] Node.js'den child_process ile çağır (`server/services/whisper.js`)
  - [x] Mikrofon → WebM → base64 → Whisper → metin pipeline
  - [x] `large-v3-turbo` modeli, 9 dil için dil ipucu desteği
- [x] **XTTS v2 TTS entegrasyonu** (Coqui TTS, yerel, RTX 4090)
  - [x] `baykus_env` conda ortamı, `kitsune_default.wav` referans sesi
  - [x] Metin → WAV → base64 → Electron Web Audio oynatma
  - [x] Ses önbelleği (aynı mesaj ikinci dinlemede anında oynar)
- [x] **`/api/voice/transcribe`** ve **`/api/voice/synthesize`** endpoint'leri
- [x] **Chat sayfasına mikrofon butonu** — tıkla/durdur, transcription input'a girer
- [x] **AI mesajlarına "Dinle" butonu** — XTTS ile seslendirme
- [x] `<think>` token temizleme, corrections kalite filtreleri

---

## ⏳ FAZ 3 — Yazma & Kelime Sistemi `[PLANLI]`

- [ ] **Yazma modu** — makale/paragraf yaz, AI editör gibi düzeltir
- [ ] **Kelime bankası** — konuşmalardan otomatik çıkarılan kelimeler
- [ ] **SRS (Spaced Repetition)** — SM-2 algoritması ile tekrar planlaması
  - [ ] Günlük tekrar bildirimi
  - [ ] Kolay/Orta/Zor derecelendirme
- [ ] **Okuma modu** — seviyeye uygun metin + soru-cevap
- [ ] **Dashboard istatistikleri** (Faz 3'te tamamlanır)
  - [ ] Günlük/haftalık pratik süresi
  - [ ] En çok kullanılan kelimeler
  - [ ] Hata analizi: hangi gramer konuları zayıf?

---

## ⏳ FAZ 4 — Gamification `[PLANLI]`

- [ ] **Streak sistemi** — günlük pratik zinciri (ateş animasyonu)
- [ ] **XP sistemi** — her konuşma/test/tekrar XP kazandırır
- [ ] **Kuyruk parlaklık seviyeleri** — A1=soluk, C2=tam parlak, 9 kuyruk=efsane aura
- [ ] **Milestone animasyonları** — Lottie ile Kitsune kutlama sahneleri
- [ ] **Rozetler** — "İlk Konuşma", "7 Gün Streak", "3 Dil Ustası" vb.
- [ ] **Haftalık özet** — "Bu hafta 45 kelime öğrendin" ekranı

---

## ⏳ FAZ 5 — Cilalama & Yeni Dil Desteği `[PLANLI]`

- [ ] **Plug-in dil sistemi** — JSON dosyasıyla yeni dil eklemek kolaylaşır
- [ ] **Ek diller**: Portekizce, Rusça, Arapça, Hintçe, Lehçe, Flemenkçe...
- [ ] **Arayüz dili seçeneği** — Türkçe / İngilizce
- [ ] **Ayarlar sayfası**: model seçimi, ses hızı, tema, sıfırlama
- [ ] **Offline tam garanti** — internet bağlantısı sıfır gereksinim

---

## ⏳ FAZ 6 — Mobile `[İLERİ DÖNEM]`

- [ ] React Native'e geçiş planı (renderer kodunun %60-70'i yeniden kullanılabilir)
- [ ] iOS + Android build pipeline
- [ ] Bulut sync seçeneği (opsiyonel — yerel öncelik korunur)
- [ ] Mobil için STT: device native API (iOS SpeechRecognizer / Android SpeechRecognizer)

---

## Bilinen Sorunlar / Notlar

| # | Konu | Durum | Not |
|---|------|-------|-----|
| 1 | `better-sqlite3` Windows'ta ClangCL hatası | ✅ Çözüldü | `sql.js` WASM kullanılıyor |
| 2 | `framer-motion` büyük bundle (654KB) | ⚠️ Kabul | İleride tree-shaking ile küçültülür |
| 3 | İsveççe XTTS v2'de desteklenmiyor | ⚠️ Kabul | sv için İngilizce aksanla çalışır, ileride Piper eklenebilir |
| 4 | sql.js WASM her kapanışta diske yazar | ✅ Çalışıyor | 3 saniyede bir flush, `_flush()` manuel de çağrılabilir |
| 5 | qwen3:14b düşünme tokenleri (`<think>`) | 🔲 Faz 1'de ele alınacak | Yanıttan `<think>...</think>` blokları temizlenecek |

---

## Git Commit Geçmişi

| Commit | Açıklama | Faz |
|--------|----------|-----|
| `c585f1e` | feat: Faz 0 tamamlandı — Kitsune iskelet kurulumu | Faz 0 |
| _(gelecek)_ | feat: Faz 1 tamamlandı — adaptif seviye testi + onboarding | Faz 1 |
| _(gelecek)_ | feat: Faz 2 tamamlandı — Whisper STT + XTTS v2 TTS entegrasyonu | Faz 2 |

---

*Bu dosya her önemli commit'te güncellenir.*
*Son güncelleme: 2026-05-11 — Faz 2 tamamlandı*
