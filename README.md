# Aquaku Frontend

Frontend demo forum komunitas dan marketplace aquascape lokal Semarang. Menggunakan Next.js 16 App Router, React 19, TypeScript, dan Tailwind CSS 4.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

```bash
npm run lint
npm run typecheck
npm run build
npm run start
npm run test:e2e
```

Playwright menjalankan production server sementara pada port 3100 dan menghentikannya setelah tes. Default menggunakan Google Chrome yang sudah terpasang (`channel: chrome`), jadi tidak perlu mengunduh Chromium lagi. Jika Chrome belum tersedia, pasang Chrome atau ubah channel di `playwright.config.ts`.

## Halaman

- `/`: beranda gabungan, marketplace sebagai fokus utama.
- `/marketplace`: pencarian, kategori, kondisi, batas harga, pengiriman, dan pengurutan.
- `/marketplace?view=saved`: produk tersimpan di browser ini.
- `/marketplace/[slug]`: galeri, kondisi, spesifikasi, profil penjual contoh, dan pratinjau chat.
- `/forum`: feed diskusi, kategori, pencarian, pengurutan, dan composer lokal.
- `/forum/[slug]`: diskusi, catatan tank/air, komentar bertingkat, collapse, dan balasan lokal. Diskusi baru memakai `/forum/local-[uuid]`; tautan hanya dapat dibuka di browser yang menyimpan datanya.
- `/preview`: studio pembanding lima komposisi beranda. `Pasar hijau` adalah arah utama; preview tidak mengubah preferensi pengguna atau konfigurasi aplikasi.

## Struktur

```text
src/app/                     Route, layout, metadata, tema global
src/components/layout/       Header, sidebar, bottom navigation, tema
src/components/marketplace/  Kartu, pencarian/filter, galeri, simpan, chat
src/components/forum/        Feed, diskusi, composer, komentar bertingkat
src/components/ui/           Kontrol bersama
src/lib/                     Fixture dan fungsi data murni
public/images/               Foto lokal dan ilustrasi produk
.agents/skills/              Skills lokal proyek
.better-web-ui.md             Konteks dan prinsip desain
```

## Batas demo dan integrasi berikutnya

Semua listing, harga, penjual, badge verifikasi, profil, dan percakapan adalah data contoh. Tidak ada backend, login, pembayaran, keranjang, voting, atau penerbitan listing sungguhan.

- Simpan produk memakai `localStorage` dengan kunci versi `aquaku-saved-v1`; tema memakai `aquaku-theme-v1`. Browser storage yang tidak tersedia tidak membuat halaman gagal.
- Diskusi dan komentar baru memakai `localStorage` dengan kunci versi `aquaku-forum-v1`, bukan server. Data tetap tersedia setelah refresh di browser/origin yang sama. Jumlah komentar dan urutan “paling dibahas” menggunakan data yang sama di feed, beranda, dan detail; perubahan storage disinkronkan antar-tab. Penulisan bersamaan antar-tab bersifat last-write-wins, bukan transaksi database.
- Penyimpanan forum dibatasi 50 diskusi dan 500 komentar tambahan; judul 8–120, isi diskusi 20–5.000, dan komentar 3–2.000 karakter. Data storage divalidasi saat dibaca. Data dapat dihapus lewat pengaturan situs browser; jangan sertakan data pribadi. Jika storage diblokir/penuh, aplikasi tetap bisa digunakan di memori dan menampilkan peringatan bahwa perubahan bisa hilang saat refresh.
- Halaman diskusi lokal memakai metadata umum dan `noindex`, tidak menerbitkan isi diskusi ke server atau metadata. Browser lain yang tidak menyimpan diskusi akan mendapat penjelasan “Diskusi lokal tidak ditemukan”, bukan akses ke tulisan pengguna.
- Tombol chat membuka pratinjau pesan yang bisa disalin. Tidak ada nomor WhatsApp dummy yang berpotensi menghubungi pihak lain.
- Jual barang dan masuk menjelaskan fitur yang belum tersedia, tanpa mengumpulkan data pribadi.
- Backend kelak wajib memvalidasi identitas, verifikasi, kuota, cooldown, kondisi/tag, dan izin membership. Validasi UI bukan enforcement.
- Daftar/foto produk bekas pada produksi harus memakai foto aktual, minimal tiga untuk Second/Like New, bukan ilustrasi yang disertakan di prototipe.

## Aset dan desain

Logo asli ada di `public/logo.png` dan tidak diubah. `logo-mark.webp` adalah crop kecil untuk navigasi. Kredit dan lisensi foto tercantum di `public/images/CREDITS.md`; semua foto dilayani lokal, bukan hotlink dari browser pengguna.

Visual: hijau dari identitas logo, latar netral tenang, font Manrope, pola katalog/pencarian Tokopedia dan feed/komentar Reddit tanpa voting. Light/dark mengikuti sistem pada awalnya dan bisa diubah melalui tombol tema. Font Google diunduh oleh `next/font` saat development/build lalu disajikan dari aplikasi, sehingga proses build memerlukan akses jaringan awal.
