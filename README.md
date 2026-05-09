<div align="center">

# 📚✨ StoryBuddy

### 🧸🤖 AI Storybook Maker untuk anak-anak, lengkap dengan cerita interaktif, ilustrasi AI, read-aloud, avatar, Parent Portal, dan mode offline

StoryBuddy adalah aplikasi pembuat buku cerita anak berbasis AI. Anak bisa memilih tema, tokoh, bahasa, tipe cerita, lalu membaca hasilnya dalam bentuk buku digital penuh ilustrasi. App ini dibuat dari Google AI Studio dan sudah disiapkan untuk pengembangan lanjutan tanpa harus mengacak fondasi project. 🚀🎨📖

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## 📌 GitHub About / Description siap pakai

> **StoryBuddy 📚✨ AI storybook maker untuk anak-anak berbasis React + Vite, lengkap dengan cerita klasik/interaktif, ilustrasi AI, read-aloud, avatar cartoonify, Parent Portal, XP, multi-provider AI, dan offline cache.**

**Topics rekomendasi:**

`storybook` `ai-story-generator` `kids-learning` `children-books` `react` `vite` `typescript` `tailwindcss` `pwa` `text-to-speech` `image-generation` `google-ai-studio`

---

## 🌟 Ringkasan Project

**StoryBuddy** adalah playground cerita digital untuk anak-anak. Anak memilih tema seperti luar angkasa, hutan ajaib, bawah laut, negeri permen, dunia dino, atau kastil awan, lalu AI membuat cerita pendek yang ramah anak. Cerita bisa berbentuk klasik atau interaktif dengan pilihan jalan cerita. 🪐🌳🌊🍭🦕☁️

Project ini punya dua sisi besar:

- 👧 **Kids Experience**: dashboard lucu, rak buku, avatar, XP, cerita bergambar, read-aloud, bahasa ID/EN, dan mode offline.
- 👨‍👩‍👧 **Parent & Developer Experience**: Parent Portal, PIN, statistik, provider AI/TTS/image, API health check, dan konfigurasi aman lewat backend Express.

---

## 🧩 Fitur Utama

| Area | Fitur |
|---|---|
| 🏠 **Dashboard Anak** | Rak buku, XP, avatar, switch bahasa, filter cerita offline, dan tombol buat cerita baru |
| ✨ **AI Story Generator** | Generate cerita dari tema, karakter, bahasa, avatar, dan tipe petualangan |
| 🎮 **Interactive Story** | Mode pilih-jalan-cerita dengan pilihan lanjutan yang dibuat AI |
| 📖 **Story Reader** | Baca halaman cerita, ilustrasi, navigasi halaman, read-aloud, musik latar, dan konfeti saat selesai |
| 🎨 **AI Illustration** | Ilustrasi per halaman memakai Vynaa, Gemini, atau fallback Pollinations |
| 🧑‍🚀 **Avatar Creator** | Custom avatar dari pilihan manual atau cartoonify dari foto asli |
| 🔊 **Text-to-Speech** | Native browser TTS, Vynaa, SumoPod, dan ElevenLabs |
| 👪 **Parent Portal** | PIN, progress, rekaman, pengaturan suara, AI provider, image provider, dan clear data |
| 🌍 **Multi Bahasa** | UI dan cerita mendukung Bahasa Indonesia dan English |
| 📦 **Offline Cache** | Download cover dan ilustrasi cerita ke IndexedDB agar bisa dibaca offline |
| 📱 **PWA Ready** | Manifest dan service worker sudah disiapkan lewat vite-plugin-pwa |

---

## 🏠 Dashboard Anak

Dashboard adalah pintu masuk utama StoryBuddy. Di sini anak bisa:

- Melihat nama app dan level eksplorasi cerita 🧭
- Melihat total XP / bintang ⭐
- Masuk ke avatar creator 🧑‍🎨
- Switch bahasa Indonesia atau English 🇮🇩🇺🇸
- Membuat cerita baru ✨
- Melihat semua buku di rak buku 📚
- Filter buku yang sudah tersedia offline 📦
- Download atau hapus cache offline per cerita ☁️⬇️

---

## ✨ AI Story Generator

Generator cerita menyediakan alur yang simpel untuk anak:

### 🎭 Pilihan Tema

- 🚀 Luar Angkasa / Outer Space
- 🌳 Hutan Ajaib / Magic Forest
- 🌊 Bawah Laut / Underwater
- 🍭 Negeri Permen / Candy Land
- 🦕 Dunia Dino / Dino World
- ☁️ Kastil Awan / Cloud Castle

### 🦸 Pilihan Tokoh

- 🧒 Anak Berani / Brave Kid
- 🤖 Robot Lucu / Cute Robot
- 🐉 Naga Baik / Friendly Dragon
- 🐱 Kucing Pintar / Smart Cat
- 🧚 Peri Kecil / Small Fairy
- 👨‍🚀 Astronot / Astronaut

### 📖 Tipe Cerita

- **Cerita Klasik** 📖  
  AI membuat cerita 4 sampai 6 halaman dengan teks singkat dan prompt ilustrasi.

- **Petualangan Interaktif** 🎮  
  AI membuat halaman awal dengan 2 sampai 3 pilihan. Pilihan anak akan menghasilkan halaman lanjutan baru.

---

## 📖 Story Reader

Reader adalah ruang baca utama. Fiturnya:

- Ilustrasi besar per halaman 🎨
- Teks cerita ramah anak 🧸
- Tombol lanjut, kembali, dan selesai ▶️
- Read-aloud dengan provider TTS terpilih 🔊
- Stop reading kapan saja ⏹️
- Pilihan lanjutan untuk interactive story ✨
- Loading bar saat AI menulis halaman baru ⏳
- Reward +50 bintang saat cerita selesai 🏆
- Confetti celebration 🎉
- Musik latar opsional 🎵

---

## 🧑‍🎨 Avatar Creator

Avatar dipakai untuk menjaga konsistensi karakter utama dalam cerita dan ilustrasi.

Fitur avatar:

- Pilih warna kulit
- Pilih warna rambut
- Pilih gaya rambut
- Simpan preferensi avatar di local storage
- Generate avatar otomatis dari deskripsi
- Upload foto asli lalu diubah menjadi avatar kartun AI 📸✨
- Cache avatar ke IndexedDB agar tidak dibuat ulang terus-menerus

Catatan: prompt cerita mengunci deskripsi avatar agar karakter utama tidak berubah wajah, rambut, dan pakaian antar halaman.

---

## 👪 Parent Portal

Parent Portal adalah area orang tua/developer untuk kontrol aplikasi.

### 🔐 Keamanan

- Bisa pasang PIN orang tua
- Jika PIN sudah dipasang, anak tidak bisa masuk portal tanpa PIN

### 📊 Progress

- Total cerita yang dibuat/dibaca
- Total XP / bintang

### 🎙️ Rekaman Anak

- Struktur store sudah mendukung rekaman suara anak
- Rekaman tersimpan dengan storyId, pageId, blobUrl, dan timestamp

### 🔊 Pengaturan Suara AI

Provider yang tersedia:

- Native browser TTS
- Vynaa AI
- SumoPod
- ElevenLabs

### 🤖 Pengaturan AI Text

Provider yang tersedia:

- Gemini
- SumoPod
- Custom OpenAI-compatible provider

### 🖼️ Pengaturan Image Provider

Provider gambar yang tersedia:

- Vynaa AI
- Gemini
- Pollinations fallback

Mode Vynaa image:

- Maker
- DeepImg
- Pollinations

### 🧹 Data Management

- Clear semua story, settings, avatar, dan cache lokal
- Autosave pengaturan lewat Zustand Persist

---

## 🤖 Arsitektur AI Provider

StoryBuddy memakai backend Express sebagai proxy agar credential owner tidak bocor ke client.

### 🔤 Text Generation

- SumoPod chat completions untuk default text generation
- Gemini chat sebagai fallback/opsi
- Custom OpenAI-compatible provider untuk pengembangan lanjutan

### 🖼️ Image Generation

- Vynaa text-to-image sebagai default
- Gemini image generation sebagai opsi
- Pollinations fallback jika provider utama gagal

### 🔊 Text-to-Speech

- Native Web Speech API
- Vynaa TTS
- SumoPod TTS
- ElevenLabs direct client mode

### 🧪 Endpoint Backend Penting

| Endpoint | Fungsi |
|---|---|
| `GET /api/health` | Cek status konfigurasi provider |
| `GET /api/provider/status` | Melihat provider default aktif |
| `GET /api/sumopod/test` | Test koneksi SumoPod |
| `POST /api/sumopod/chat` | Generate text/story via SumoPod |
| `POST /api/sumopod/tts` | Generate audio via SumoPod |
| `POST /api/gemini/chat` | Generate text/story via Gemini |
| `POST /api/gemini/generate-image` | Generate image via Gemini |
| `POST /api/gemini/cartoonify` | Ubah foto menjadi avatar kartun |
| `GET /api/vynaa/test` | Test koneksi Vynaa |
| `POST /api/vynaa/generate-image` | Generate image via Vynaa |
| `POST /api/vynaa/tts` | Generate audio via Vynaa |

---

## 📦 Offline Mode dan Cache

StoryBuddy memakai `idb-keyval` untuk menyimpan gambar ke IndexedDB.

Yang bisa di-cache:

- Cover cerita
- Ilustrasi setiap halaman
- Avatar custom
- Gambar hasil AI yang sudah dibuat

Fungsi penting:

- `downloadStoryImages(story)` untuk download cover dan semua page image
- `removeStoryImages(story)` untuk hapus cache cerita
- `useOfflineImage(cacheKey, prompt, seed)` untuk load dari cache atau generate saat belum ada

PWA juga sudah menyiapkan caching untuk:

- Asset app
- Google Fonts
- Pollinations image URLs

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
|---|---|
| UI | React 19 |
| Build Tool | Vite 6 |
| Bahasa | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Utility | class-variance-authority, clsx, tailwind-merge |
| Animasi | motion/react, tw-animate-css |
| State | Zustand + Persist |
| Local Cache | idb-keyval / IndexedDB |
| Backend | Express |
| Build Backend | esbuild |
| AI SDK | @google/genai |
| Icons | lucide-react |
| Celebration | canvas-confetti |
| PWA | vite-plugin-pwa |
| Dev Runtime | tsx |

---

## 📁 Struktur Penting

```txt
StoryBuddy/
├── README.md
├── package.json
├── server.ts
├── vite.config.ts
├── index.html
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── store.ts
    ├── components/
    │   ├── Dashboard.tsx
    │   ├── StoryGenerator.tsx
    │   ├── StoryReader.tsx
    │   ├── ParentPortal.tsx
    │   ├── AvatarCreator.tsx
    │   ├── OfflineImage.tsx
    │   └── LoadingBar.tsx
    └── lib/
        ├── audio.tsx
        ├── gemini.ts
        ├── offline.ts
        └── vynaa.ts
```

---

## 🚀 Jalankan Lokal

### 1. Install dependency

```bash
npm install
```

### 2. Jalankan development server

```bash
npm run dev
```

Default server:

```txt
http://localhost:3000
```

### 3. Build production

```bash
npm run build
```

### 4. Jalankan production build

```bash
npm start
```

### 5. Preview frontend build

```bash
npm run preview
```

### 6. Type-check

```bash
npm run lint
```

---

## 🔐 Environment Configuration

StoryBuddy mendukung beberapa provider. Simpan credential di environment lokal atau panel environment Google AI Studio, bukan di source code.

Variable yang didukung:

| Variable | Fungsi |
|---|---|
| `SUMOPOD_API_KEY` | Owner default key untuk SumoPod text generation dan TTS |
| `VYNAA_API_KEY` | Owner default key untuk Vynaa image generation dan TTS |
| `GEMINI_API_KEY` | Key untuk Gemini chat, image generation, dan cartoonify |
| `SUMOPOD_BASE_URL` | Base URL SumoPod, optional |
| `SUMOPOD_TEXT_MODEL` | Default model text, optional |
| `SUMOPOD_TTS_MODEL` | Default model TTS, optional |
| `SUMOPOD_TTS_VOICE` | Default voice TTS, optional |
| `PORT` | Port Express server, optional |
| `DISABLE_HMR` | Disable Vite HMR saat diperlukan di AI Studio |

🛡️ Catatan aman:

- Jangan commit credential ke repo
- Jangan hardcode API key di client
- Pakai backend proxy untuk owner default keys
- Hapus atau rotate key jika pernah terlanjur terekspos

---

## 🧠 Cara Kerja Generate Story

1. Anak memilih tema dan karakter 🎭
2. Anak memilih cerita klasik atau interaktif 📖🎮
3. App membaca avatar dan bahasa aktif 🧑‍🎨🌍
4. Prompt dikirim ke backend provider AI 🤖
5. AI mengembalikan JSON berisi judul, genre, halaman, prompt ilustrasi, dan pilihan jika interaktif 🧾
6. Story disimpan ke Zustand Persist 📦
7. Reader menampilkan teks dan memakai `OfflineImage` untuk generate/cache ilustrasi 🖼️
8. Jika cerita selesai, anak mendapat reward XP dan konfeti 🏆🎉

---

## 🧩 Panduan Pengembangan Lanjutan

### ➕ Tambah tema baru

Edit pilihan tema di:

```txt
src/components/StoryGenerator.tsx
```

Tambahkan label Indonesia dan English agar UI tetap bilingual.

### ➕ Tambah karakter baru

Edit daftar karakter di:

```txt
src/components/StoryGenerator.tsx
```

Pastikan nama karakter aman untuk anak dan cocok untuk ilustrasi.

### ➕ Tambah bahasa baru

Area yang perlu dicek:

```txt
src/store.ts
src/components/Dashboard.tsx
src/components/StoryGenerator.tsx
src/components/StoryReader.tsx
src/components/ParentPortal.tsx
src/components/AvatarCreator.tsx
src/lib/gemini.ts
src/lib/audio.tsx
```

Saran: pindahkan semua object `t` ke file `src/lib/i18n.ts` supaya makin rapi.

### ➕ Tambah provider AI baru

Area utama:

```txt
server.ts
src/store.ts
src/lib/gemini.ts
src/components/ParentPortal.tsx
```

Checklist:

- Tambah setting provider di store
- Tambah endpoint backend jika perlu
- Tambah UI pilihan di Parent Portal
- Pastikan key tidak bocor ke client
- Tambah test endpoint kecil

### ➕ Tambah fitur rekaman anak

Store sudah punya struktur `AudioRecording`. Lanjutannya bisa dibuat di `StoryReader`:

- Tombol mulai rekam
- Tombol stop rekam
- Simpan recording ke store
- Tampilkan di Parent Portal tab Rekaman

### ➕ Tambah export story

Ide export:

- Export ke PDF
- Export ke gambar cover
- Share link lokal
- Export JSON story untuk backup

---

## ✅ Checklist Sebelum Rilis

- [ ] Test generate story klasik
- [ ] Test generate story interaktif
- [ ] Test lanjut halaman dari pilihan interaktif
- [ ] Test read-aloud Native, Vynaa, SumoPod, dan ElevenLabs
- [ ] Test image provider Vynaa, Gemini, dan fallback
- [ ] Test cartoonify avatar dari foto
- [ ] Test download offline story
- [ ] Test remove offline cache
- [ ] Test Parent Portal PIN
- [ ] Test clear data
- [ ] Test ID/EN language switch
- [ ] Test mobile dan tablet
- [ ] Pastikan credential tidak masuk commit

---

## 🧪 Roadmap Pengembangan

### 🎯 Prioritas Cepat

- [ ] Rapikan i18n ke satu file khusus
- [ ] Tambah tombol rekam suara anak di Story Reader
- [ ] Tambah indikator provider aktif di dashboard
- [ ] Tambah retry button saat generate story gagal
- [ ] Tambah delete story per buku
- [ ] Tambah rename story
- [ ] Tambah loading skeleton untuk ilustrasi
- [ ] Tambah empty state untuk offline filter

### 🚀 Prioritas Menengah

- [ ] Export cerita ke PDF
- [ ] Parent dashboard lebih lengkap
- [ ] Statistik waktu baca
- [ ] Badge pencapaian anak
- [ ] Story categories dan search
- [ ] PWA install prompt yang lebih ramah anak
- [ ] Cloud sync optional
- [ ] Backup/restore story JSON

### 🪄 Prioritas AI Studio

- [ ] AI rewrite story untuk umur berbeda
- [ ] AI moral lesson generator
- [ ] AI bedtime mode dengan cerita lebih lembut
- [ ] AI quiz dari cerita yang sudah dibaca
- [ ] AI narrator voice selector per karakter
- [ ] AI consistency checker untuk ilustrasi avatar
- [ ] AI parent summary mingguan

---

## 🤖 Prompt Lanjutan untuk Google AI Studio

```txt
Lanjutkan project StoryBuddy tanpa mengubah fitur existing yang sudah berjalan.
Jangan hapus Dashboard, StoryGenerator, StoryReader, ParentPortal, AvatarCreator, OfflineImage, AudioProvider, AI provider settings, offline cache, XP, dan language switch.
Pertahankan React + TypeScript + Vite + Tailwind CSS + Express backend.
Fokus pada perubahan kecil, modular, dan aman.
Jangan hardcode credential rahasia di client atau source code.
Jika menambah provider AI/TTS/image, routing harus lewat backend proxy bila memakai owner API key.
Jika menambah UI text baru, buat versi Bahasa Indonesia dan English.
Jika menambah fitur anak, pastikan aman, ramah anak, dan tidak mengandung konten dewasa.
Jelaskan file mana yang diubah dan alasan perubahannya.
```

---

## 🧹 Script NPM

| Script | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Express + Vite development server |
| `npm run build` | Build frontend Vite dan bundle backend Express |
| `npm start` | Menjalankan production server dari `dist/server.cjs` |
| `npm run preview` | Preview build frontend |
| `npm run clean` | Menghapus folder `dist` |
| `npm run lint` | Type-check dengan `tsc --noEmit` |

---

## 🧯 Catatan Keamanan dan Privasi

- Data story, avatar, settings, dan XP disimpan lokal via Zustand Persist
- Gambar cache disimpan lokal via IndexedDB
- Parent PIN juga tersimpan lokal, cukup untuk proteksi ringan di device yang sama
- Jangan simpan data anak yang sensitif tanpa alasan kuat
- Jangan upload foto anak ke provider AI tanpa izin orang tua
- Untuk produksi publik, tambahkan privacy policy dan consent flow
- Untuk cloud sync, gunakan auth dan rules yang ketat

---

## 🧭 Roadmap Mini

```txt
v0.1 ✅ AI storybook generator dasar
v0.2 ✅ Dashboard, reader, avatar, Parent Portal
v0.3 ✅ Multi-provider AI, TTS, image generation
v0.4 ✅ Offline image cache dan PWA support
v0.5 🔜 Rekaman suara anak + badge progress
v0.6 🔜 Export PDF + backup/restore story
v0.7 🔜 Cloud sync optional + parent summary AI
```

---

<div align="center">

## 📚✨ StoryBuddy

**Bikin cerita, baca bareng, pilih petualangan, simpan kenangan.**  
Sebuah mesin dongeng kecil untuk anak-anak, orang tua, dan developer yang suka bikin buku dari percikan imajinasi. 🧸🌙🚀

</div>
