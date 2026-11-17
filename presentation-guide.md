# 🌊 Aquaku Pitch Deck Presentation Guide
> **Dokumen Panduan Slide Pitching Tugas Mata Kuliah Technopreneurship**  
> *Target Audiens: Dosen Penguji Technopreneurship, Mentor Bisnis, dan Mitra Komunitas Lokal*  
> *Prinsip Utama: Data Berbasis Fakta Nyata (Ground-Level Validation), Angka Realistis, Bottom-Up Sizing, dan Bebas Klaim Bombastis yang Tidak Tervalidasi.*

---

## 📌 1. Ikhtisar Proyek (Executive Summary)

* **Nama Proyek:** **Aquaku** (`aquaku.id`)
* **Kategori:** *Niche Vertical Community & Local Marketplace*
* **Status Saat Ini:** **Fungsional MVP (Production-Ready Staging)** — Backend & Frontend terintegrasi penuh (Next.js 16 + NestJS + PostgreSQL + MongoDB + Cloudinary + WhatsApp OTP).
* **Fokus Peluncuran:** **Captive Market Wilayah Semarang** (Menjawab risiko logistik produk hidup: tanaman aquascape, fauna nano, dan hardscape via COD & kurir instan).
* **Anchor Partner:** Toko jastip lokal (*Ryan di Jastip*) sebagai **Aquaku Official Store** pertama untuk mengatasi kendala toko kosong di fase awal (*market maker*).

---

## 🎯 2. Struktur Slide-by-Slide Blueprint (11 Slide Technopreneurship)

---

### Slide 1: Cover & Identitas Proyek
* **Headline:** Aquaku — Ekosistem Terpadu Komunitas & Jual-Beli Khusus Hobiis Aquascape
* **Sub-headline:** Menjembatani Pengetahuan Perawatan dan Transaksi Produk Hidup yang Aman di Wilayah Semarang.
* **Elemen Visual:** 
  * Logo resmi Aquaku (Emerald Green & Water theme).
  * Mockup layar web Aquaku (antarmuka forum dan kartu produk di desktop & smartphone).
* **Informasi Tim:** Nama Tim Mahasiswa, Program Studi, Mata Kuliah Technopreneurship 2026.

---

### Slide 2: The Problem (Masalah Nyata Hasil Observasi Hobi)
* **Headline:** Mengapa Jual-Beli Aquascape di Media Sosial dan E-Commerce Umum Bermasalah?
* **3 Problem Utama (Berdasarkan Observasi Lapangan):**
  1. **Komunitas dan Transaksi Terpecah:** Diskusi perawatan dilakukan di grup Facebook/WA, tetapi mencari barang harus ke marketplace umum yang tidak memiliki konteks perawatan.
  2. **Tingginya Risiko Produk Hidup:** Marketplace umum mengandalkan ekspedisi 3–5 hari; tanaman air rentan lumer/busuk dan ikan berisiko mati di perjalanan (*death on arrival*).
  3. **Rentan Penipuan & Kurangnya Standar Kondisi:** Transaksi via grup medsos sering berujung penipuan transfer langsung; tidak ada tag kondisi standar khas hobi (seperti: *Emersed, Submersed, Trimmingan, Rimpang, BNIB, Second*).

---

### Slide 3: The Solution & Value Proposition
* **Headline:** Aquaku: Platform Vertikal yang Menggabungkan Edukasi & Marketplace Terkurasi
* **Poin Solusi Utama:**
  * **Katalog & Tag Spesifik Hobi:** Filter berbasis jenis tanaman (Trimming, Rimpang, TC) dan kondisi barang yang terstandardisasi.
  * **Fokus Pasar Lokal (Semarang Pilot):** Memprioritaskan transaksi *same-day* (COD / titik temu komunitas dan kurir instan) untuk menjaga kelangsungan hidup tanaman/fauna.
  * **Mesin Kepercayaan (*Trust Engine*):** Autentikasi nomor WhatsApp berbasis OTP resmi, riwayat transaksi, dan sistem ulasan pembeli-penjual terverifikasi.

---

### Slide 4: Product Showcase (Fitur Inti yang Sudah Berjalan)
* **Headline:** Solusi Nyata yang Siap Digunakan (Bukan Sekadar Konsep Mockup)
* **Fitur Utama yang Ditampilkan:**
  1. **Marketplace Terstruktur:** Listing produk lengkap dengan foto Cloudinary, lokasi kecamatan di Semarang, dan nomor WhatsApp penjual langsung.
  2. **Forum Diskusi Interaktif:** Tempat hobiis pamer akuarium (*showcase*), konsultasi masalah alga, dan tanya-jawab perawatan air.
  3. **Manajemen Profil Toko (Shop Manager):** Hobiis biasa bisa langsung melepas trimmingan pribadi, sementara toko profesional memiliki etalase toko mandiri.

---

### Slide 5: Arsitektur Penjual & Keamanan (Trust Architecture)
* **Headline:** Struktur Pembeda Penjual untuk Menjamin Keamanan Transaksi
* **Tiga Kategori Seller di Aquaku:**
  1. **🛡️ Aquaku Official (Toko Resmi Platform):**
     * **Hanya ada 1 toko**, dikelola oleh internal/mitra utama (*Ryan di Jastip*).
     * Berfungsi sebagai *Market Maker*: Menjamin stok bibit tanaman segar, garansi hidup, dan perlengkapan siap kirim sejak hari pertama.
     * Hanya bisa diaktifkan secara manual di database oleh pengelola sistem.
  2. **✓ Verified Store (Toko Mitra Terverifikasi):**
     * Untuk toko/reseller fisik di Semarang yang mengajukan verifikasi profil toko dan disetujui admin.
  3. **Hobiis Personal (Verified Phone):**
     * Akun perorangan dengan verifikasi nomor WhatsApp OTP. Dibatasi kuota 5 listing aktif agar tidak melakukan spam.

---

### Slide 6: Validasi Pasar & Target Pengguna (Bottom-Up Market Sizing)
* **Headline:** Validasi Pasar Riil Berbasis Komunitas Lokal Semarang
* **Analisis Pasar Bottom-Up (Bukan Angka Khayalan):**
  * **Ground Reality di Semarang:**
    * Terdapat sekitar **30–50 toko fisik akuarium & aquascape** (tersebar di area Pasar Ikan Karimata, Jl. Kartini, Tembalang, Banyumanik, dan Semarang Barat).
    * Estimasi anggota aktif grup Facebook & komunitas WhatsApp aquascape regional Semarang berkisar **3.000 – 5.000 orang**.
  * **Target Realistis Tahap MVP (Fase 1 - 3 Bulan Pertama):**
    * **5–10 Toko/Penjual Rutin** bergabung ke platform.
    * **50–100 Hobiis Aktif** (terdaftar dengan WhatsApp terverifikasi).
    * **100+ Listing Produk** aktif di wilayah Semarang.
  * **Customer Segments:**
    1. *Pemula:* Butuh panduan tanaman mudah dan bibit murah dari hobiis sekitar.
    2. *Hobiis Aktif:* Rutin merapikan (*trimming*) tanaman dan ingin menjual kembali daripada dibuang.
    3. *Toko Lokal:* Ingin menjangkau pembeli lokal tanpa terpotong komisi e-commerce besar.

---

### Slide 7: Model Bisnis & Kelayakan Finansial (Financial Feasibility)
* **Headline:** Model Bisnis Berkelanjutan: *Zero-Commission* dengan Arus Kas Dapat Diprediksi
* **Mengapa Tanpa Komisi Transaksi?** Mencegah penjual dan pembeli melakukan transaksi di luar aplikasi (*leakage*). Biaya dikenakan di muka untuk fasilitas listing dan profil.
* **1. Beban Biaya Operasional Riil (Monthly Lean Burn Rate Mahasiswa):**
  * Server Backend (Railway Hobby/Staging): ~Rp 100.000 – Rp 150.000 / bulan
  * Database & Storage (Supabase/Neon + MongoDB + Cloudinary Free-to-Starter): ~Rp 0 – Rp 100.000 / bulan
  * WhatsApp OTP Gateway (OTP.ID): ~Rp 50.000 / 200 verifikasi
  * Domain & Pemeliharaan: ~Rp 25.000 / bulan (biaya tahunan diamortisasi)
  * **Total Biaya Operasional Dasar: ± Rp 175.000 – Rp 325.000 / bulan.**

* **2. Simulasi Pendapatan Awal (Berdasarkan Target Realistis):**
  * **Tier Toko (Rp 40.000/bln):** Target 5 toko lokal = Rp 200.000
  * **Tier Juragan (Rp 100.000/bln):** Target 2 toko besar/supplier = Rp 200.000
  * **Add-on Kuota Listing Personal (Rp 3.000/slot):** Estimasi 20 slot = Rp 60.000
  * **Margin Toko Internal (Aquaku Official / Jastip):** Estimasi laba kotor = Rp 300.000 – Rp 500.000
  * **Total Estimasi Pemasukan Awal: ± Rp 760.000 – Rp 960.000 / bulan.**

* **3. Titik Impas (Break-Even Point / BEP):**
  * Proyek ini **mencapai titik impas (BEP) hanya dengan 4–5 toko berlangganan**.
  * Tidak membutuhkan suntikan modal besar untuk bertahan hidup (*self-sustaining* sejak peluncuran awal).

---

### Slide 8: Strategi Peluncuran & Validasi Lapangan (Go-to-Market)
* **Headline:** Strategi Eksekusi: Pendekatan Komunitas Langsung (*Grassroots Approach*)
* **Tahapan Peluncuran Lapangan:**
  1. **Door-to-Door Onboarding Toko:** Mengunjungi langsung 10 toko aquascape di Semarang (Jl. Kartini & Karimata) untuk mendemokan kemudahan pasang etalase toko.
  2. **Infiltrasi Organik Grup Media Sosial:** Membagikan thread edukasi perawatan tanaman di grup Facebook aquascape lokal yang menautkan katalog trimmingan murah di Aquaku.
  3. **Aktivasi Offline (Trimming Gathering):** Mengadakan meetup kecil komunitas hobiis di Semarang dengan konsep *"Bawa Trimminganmu, Tukar Gratis atau Jual di Aquaku"*.
  4. **Anchor Reliability:** Memastikan toko internal (*Ryan di Jastip*) selalu siap merespons pesanan dan memberikan contoh transaksi yang memuaskan.

---

### Slide 9: Keunggulan Kompetitif (Competitor Comparison)
* **Headline:** Mengapa Aquaku Lebih Relevan Dibanding Media Sosial dan E-Commerce Raksasa?

| Parameter Pembanding | Grup Medsos (Facebook / WA) | Marketplace Umum (Shopee/Tokopedia) | 🌊 Aquaku |
| :--- | :--- | :--- | :--- |
| **Kesesuaian Produk Hidup** | Rendah (tidak ada filter) | Rendah (kurir ekspedisi berhari-hari) | **Sangat Tinggi (Same-day & COD lokal)** |
| **Spesifikasi Teknis Hobi** | Postingan cepat tenggelam | Tidak ada tag bibit/trimming/tanaman | **Taksonomi khusus & tag terstandarisasi** |
| **Keamanan Transaksi** | Sangat rentan penipuan transfer | Ada escrow, tapi komisi tinggi (6–10%) | **OTP WhatsApp, Zero-Commission, Tautan Transaksi** |
| **Ruang Komunitas** | Banyak spam & tidak terstruktur | Tidak ada ruang komunitas | **Forum showcase & marketplace satu pintu** |
| **Biaya Penjual** | Gratis tapi sepi buyer serius | Komisi memotong laba penjual kecil | **Langganan flat & terjangkau (Rp 40k/bln)** |

---

### Slide 10: Fondasi Teknologi & Implementasi (Tech Stack)
* **Headline:** Arsitektur Perangkat Lunak Skalabel & Standar Industri
* **Frontend:** Next.js 16 (App Router, Turbopack, Tailwind CSS) — Dioptimalkan untuk kecepatan akses di smartphone.
* **Backend:** NestJS TypeScript (Modular Architecture, RESTful API dengan OpenAPI documentation).
* **Manajemen Database Hybrid:**
  * **PostgreSQL:** Mengelola konsistensi ketat akun, kuota listing, kepemilikan toko, dan relasi transaksi (ACID).
  * **MongoDB:** Menyimpan konten forum diskusi, komentar, dan showcase foto yang fleksibel.
* **Layanan Cloud:** Cloudinary (optimasi foto otomatis), OTP.ID (gateway WhatsApp terpercaya), Railway (hosting server).

---

### Slide 11: Rencana Pengembangan & Metrik Keberhasilan (Milestones)
* **Headline:** Rencana Bertahap Berdasarkan Validasi Pengguna
* **Milestone 1 (Semester Ini - MVP Launch):**
  * Peluncuran publik di Semarang.
  * Target: 10 toko terdaftar, 50 hobiis aktif, 100 listing barang.
  * Uji coba validitas *Willingness-to-Pay* untuk tier Toko berbayar.
* **Milestone 2 (Fase Pertumbuhan 6 Bulan):**
  * Integrasi fitur kalkulator dosis pupuk & profil akuarium (*tank profile*).
  * Evaluasi umpan balik sistem COD dan integrasi escrow QRIS jika volume transaksi meningkat.
* **Milestone 3 (Ekspansi Regional):**
  * Perluasan jangkauan ke kota tetangga (Solo, Salatiga, Kudus, Yogyakarta).

---

## 💬 3. Panduan Menjawab Pertanyaan Dosen / Juri (Q&A Defense)

1. **"Mengapa membatasi skala hanya di Semarang, apakah pasarnya tidak terlalu sempit?"**
   * *Jawaban:* Justru ini adalah strategi mitigasi risiko utama kami. Produk utama aquascape adalah tanaman air dan ikan hias yang memiliki batasan fisiologis (mudah mati jika dikirim ekspedisi antarkota 3–5 hari). Dengan memvalidasi model ini secara lokal di Semarang terlebih dahulu, kami memastikan kualitas barang tetap prima dan biaya operasional awal sangat rendah. Jika unit economics di Semarang terbukti berhasil, model ini sangat mudah direplikasi ke kota lain seperti Solo atau Surabaya.

2. **"Apa bukti bahwa pemilik toko mau membayar biaya langganan Rp 40.000 per bulan?"**
   * *Jawaban:* Di marketplace umum, toko dikenakan komisi 4%–10% per transaksi. Untuk transaksi senilai Rp 500.000 saja, potongan e-commerce sudah mencapai Rp 20.000–50.000 per pesanan. Dengan membayar biaya tetap Rp 40.000/bulan di Aquaku, toko dapat memasang hingga 30 listing tanpa potongan komisi sepeser pun dan langsung terhubung dengan calon pembeli terdekat via WhatsApp. Biaya ini jauh lebih hemat bagi penjual lokal.

3. **"Bagaimana cara memastikan penjual tidak menipu pembeli saat COD?"**
   * *Jawaban:* Semua penjual wajib memverifikasi nomor WhatsApp melalui OTP resmi. Selain itu, kami menerapkan sistem konfirmasi transaksi dua arah: penjual menautkan ID pembeli terverifikasi saat barang terjual, yang kemudian membuka akses bagi pembeli untuk memberikan ulasan rating. Penjual bermasalah akan langsung di-blacklist nomor HP dan akunnya oleh admin.

4. **"Mengapa ada toko internal Aquaku Official?"**
   * *Jawaban:* Toko internal berfungsi sebagai *Market Maker* untuk menyelesaikan masalah pasar sepi di awal (*cold-start problem*). Di hari pertama peluncuran, pembeli sudah bisa menemukan tanaman segar dan perlengkapan siap kirim tanpa harus menunggu penjual lain mengunggah barang. Status ini hanya dimiliki oleh 1 toko resmi dan dikunci manual di database agar tidak bisa disalahgunakan.

---

## 🤖 4. Prompt Siap Pakai untuk AI Slide Generator (Canva / Gamma / PPT)

Salin prompt di bawah ini ke Canva / Gamma / AI Agent:

```text
Buatkan 11 slide presentasi pitch deck untuk tugas mata kuliah Technopreneurship mengenai platform startup "Aquaku" (Platform Komunitas & Marketplace Aquascape Lokal Semarang). 

Desain visual: Rasio 16:9, warna dominan Nature Emerald Green (#16a34a), latar Slate Dark (#0a1410) yang kontras dan bersih, serta aksen Amber Gold (#f59e0b). Tampilan profesional, akademis, dan modern.

Struktur slide (gunakan data konkret dan realistis sesuai panduan):
1. Cover: Aquaku - Ekosistem Terpadu Komunitas & Marketplace Aquascape (Pilot Semarang)
2. The Problem: 3 kendala utama hobiis (Diskusi vs transaksi terpisah, risiko tanaman busuk di ekspedisi biasa, dan penipuan di medsos)
3. The Solution: Dual-engine platform (Katalog spesifik aquascape, logistik same-day/COD lokal Semarang, dan verifikasi OTP)
4. Core Product Features: Marketplace dengan tag kondisi hobi, tombol direct WhatsApp, forum diskusi, dan shop manager
5. Trust Architecture: Pembeda jelas antara Aquaku Official (1 toko resmi internal), Verified Store, dan Hobiis Personal
6. Market Sizing (Bottom-Up): Analisis captive market nyata di Semarang (30-50 toko fisik, komunitas 3.000-5.000 orang, target MVP 5-10 toko dan 50 hobiis)
7. Financial Feasibility & BEP: Biaya operasional lean mahasiswa (Rp 175k-325k/bln) vs potensi pemasukan (Rp 760k-960k/bln) dengan BEP hanya 4-5 toko berlangganan
8. Go-to-Market Strategy: Validasi toko lokal Semarang, promosi komunitas Facebook, event tukar trimmingan offline
9. Competitor Matrix: Perbandingan tabel Aquaku vs Grup Medsos vs E-Commerce Raksasa
10. Tech Stack: Next.js 16, NestJS, Postgres + Mongo hybrid, Cloudinary, status MVP siap staging
11. Milestones: Rencana bertahap Semester ini (MVP) -> Evaluasi 6 bulan -> Ekspansi regional

Pastikan tidak ada klaim triliunan yang tidak masuk akal; fokus pada data terukur, kelayakan akademis, dan pembuktian Problem-Solution Fit.
```
